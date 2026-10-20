import { NextResponse } from 'next/server';
import { getStudyStructure, getUserProgressMap, computeStats } from '@/lib/data-store';
import { getEffectiveUserId, GUEST_COOKIE_NAME } from '@/lib/session';
import { isDatabaseConfigured } from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId, isGuest, username } = await getEffectiveUserId();
    const isDbReady = isDatabaseConfigured();

    const subjects = await getStudyStructure();
    let progressMap: Record<string, { completed: boolean; completedItems: string[]; updatedAt?: string }> = {};

    if (isDbReady) {
      try {
        progressMap = await getUserProgressMap(userId);
      } catch (dbErr) {
        console.error('Falha ao obter progresso do usuário no banco:', dbErr);
      }
    }

    const stats = computeStats(subjects, progressMap);

    const response = NextResponse.json({
      subjects,
      progressMap,
      stats,
      user: isGuest ? null : { userId, username },
      isGuest,
      isDatabaseConfigured: isDbReady,
    });

    if (isGuest) {
      response.cookies.set(GUEST_COOKIE_NAME, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 ano
      });
    }

    return response;
  } catch (error: any) {
    console.error('Erro em /api/subjects:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar as matérias.', details: error.message },
      { status: 500 }
    );
  }
}
