import { NextResponse } from 'next/server';
import { getStudyStructure, getUserProgressMap, computeStats } from '@/lib/data-store';
import { getEffectiveUserId } from '@/lib/session';
import { isDatabaseConfigured } from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId } = await getEffectiveUserId();
    const subjects = await getStudyStructure();
    let progressMap = {};

    if (isDatabaseConfigured()) {
      try {
        progressMap = await getUserProgressMap(userId);
      } catch (err) {
        console.error('Erro ao ler progresso para estatísticas:', err);
      }
    }

    const stats = computeStats(subjects, progressMap);

    return NextResponse.json({
      stats,
      isDatabaseConfigured: isDatabaseConfigured(),
    });
  } catch (error: any) {
    console.error('Erro em /api/stats:', error);
    return NextResponse.json(
      { error: 'Falha ao calcular estatísticas.', details: error.message },
      { status: 500 }
    );
  }
}
