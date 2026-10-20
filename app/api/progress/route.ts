import { NextRequest, NextResponse } from 'next/server';
import {
  setModuleProgress,
  setItemProgress,
  getStudyStructure,
  getUserProgressMap,
  computeStats,
} from '@/lib/data-store';
import { getEffectiveUserId, GUEST_COOKIE_NAME } from '@/lib/session';
import { isDatabaseConfigured } from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId, isGuest } = await getEffectiveUserId();
    const isDbReady = isDatabaseConfigured();

    if (!isDbReady) {
      return NextResponse.json(
        { error: 'MongoDB Atlas não configurado. Defina MONGODB_URI.', isDatabaseConfigured: false },
        { status: 503 }
      );
    }

    const subjects = await getStudyStructure();
    const progressMap = await getUserProgressMap(userId);
    const stats = computeStats(subjects, progressMap);

    return NextResponse.json({
      progressMap,
      stats,
      isGuest,
      isDatabaseConfigured: true,
    });
  } catch (error: any) {
    console.error('Erro em GET /api/progress:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar progresso.', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error: 'Persistência no banco indisponível. Configure a variável de ambiente MONGODB_URI.',
          isDatabaseConfigured: false,
        },
        { status: 503 }
      );
    }

    const { userId, isGuest } = await getEffectiveUserId();
    const body = await req.json();

    const { type, moduleId, itemId, completed } = body;

    if (!moduleId || typeof moduleId !== 'string') {
      return NextResponse.json(
        { error: 'Identificador do módulo (moduleId) é obrigatório.' },
        { status: 400 }
      );
    }

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'O parâmetro completed deve ser um booleano (true ou false).' },
        { status: 400 }
      );
    }

    let updatedModuleState: { completed: boolean; completedItems: string[] };

    if (type === 'module') {
      updatedModuleState = await setModuleProgress(userId, moduleId, completed);
    } else if (type === 'item') {
      if (!itemId || typeof itemId !== 'string') {
        return NextResponse.json(
          { error: 'Identificador do item (itemId) é obrigatório para atualização do tipo item.' },
          { status: 400 }
        );
      }
      updatedModuleState = await setItemProgress(userId, moduleId, itemId, completed);
    } else {
      return NextResponse.json(
        { error: "Tipo de operação inválido. Utilize 'module' ou 'item'." },
        { status: 400 }
      );
    }

    // Recalcula estatísticas gerais e por matéria
    const subjects = await getStudyStructure();
    const progressMap = await getUserProgressMap(userId);
    const stats = computeStats(subjects, progressMap);

    const response = NextResponse.json({
      success: true,
      moduleId,
      progress: updatedModuleState,
      stats,
    });

    if (isGuest) {
      response.cookies.set(GUEST_COOKIE_NAME, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Erro em POST /api/progress:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar progresso.' },
      { status: 500 }
    );
  }
}
