import fs from 'fs';
import path from 'path';
import { getDb, isDatabaseConfigured } from './mongodb';
import { StudySubject, StudyModule, GlobalStats, SubjectStats } from '@/types';

export interface UserProgressDoc {
  userId: string;
  moduleId: string;
  completed: boolean;
  completedItems: string[];
  updatedAt: string;
}

// Carrega a estrutura de estudos local (extraída fielmente do PDF)
export function getLocalStudyStructure(): StudySubject[] {
  const filePath = path.join(process.cwd(), 'data', 'study_structure.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('Arquivo de estrutura de estudos data/study_structure.json não encontrado. Execute npm run extract:pdf.');
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  return data.subjects as StudySubject[];
}

export async function getStudyStructure(): Promise<StudySubject[]> {
  if (isDatabaseConfigured()) {
    try {
      const db = await getDb();
      const count = await db.collection('subjects').countDocuments();
      if (count > 0) {
        const subjects = await db.collection<StudySubject>('subjects').find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
        return subjects;
      }
    } catch (err) {
      console.warn('Aviso: Falha ao carregar do MongoDB, utilizando arquivo local data/study_structure.json:', err);
    }
  }
  return getLocalStudyStructure();
}

export async function getUserProgressMap(userId: string): Promise<Record<string, { completed: boolean; completedItems: string[]; updatedAt?: string }>> {
  const progressMap: Record<string, { completed: boolean; completedItems: string[]; updatedAt?: string }> = {};

  if (!isDatabaseConfigured()) {
    return progressMap;
  }

  try {
    const db = await getDb();
    const cursor = db.collection<UserProgressDoc>('progress').find({ userId });
    const docs = await cursor.toArray();

    for (const doc of docs) {
      progressMap[doc.moduleId] = {
        completed: Boolean(doc.completed),
        completedItems: Array.isArray(doc.completedItems) ? doc.completedItems : [],
        updatedAt: doc.updatedAt,
      };
    }
  } catch (err: any) {
    console.error('Erro ao buscar progresso no MongoDB:', err.message);
    if (err.message?.includes('not allowed to do action')) {
      throw new Error('Permissão insuficiente no MongoDB Atlas: o usuário configurado precisa da permissão "Read and write to any database" no painel do Atlas (Security -> Database Access -> Edit User).');
    }
    throw err;
  }

  return progressMap;
}

export async function setModuleProgress(
  userId: string,
  moduleId: string,
  completed: boolean
): Promise<{ completed: boolean; completedItems: string[] }> {
  if (!isDatabaseConfigured()) {
    throw new Error('Banco de dados MongoDB não configurado.');
  }

  const subjects = await getStudyStructure();
  let targetModule: StudyModule | null = null;
  for (const s of subjects) {
    const found = s.modules.find(m => m.id === moduleId);
    if (found) {
      targetModule = found;
      break;
    }
  }

  if (!targetModule) {
    throw new Error(`Módulo '${moduleId}' não encontrado na estrutura de estudos.`);
  }

  // Se marcar como concluído, marca todos os itens do módulo. Se desmarcar, limpa.
  const completedItems = completed ? targetModule.items.map(i => i.id) : [];
  const now = new Date().toISOString();

  try {
    const db = await getDb();
    await db.collection<UserProgressDoc>('progress').updateOne(
      { userId, moduleId },
      {
        $set: {
          userId,
          moduleId,
          completed,
          completedItems,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
  } catch (err: any) {
    if (err.message?.includes('not allowed to do action')) {
      throw new Error('Permissão negada no MongoDB Atlas: seu usuário de banco não possui permissão de escrita. No Atlas, acesse Security -> Database Access -> Edit User e selecione "Read and write to any database".');
    }
    throw err;
  }

  return { completed, completedItems };
}

export async function setItemProgress(
  userId: string,
  moduleId: string,
  itemId: string,
  completed: boolean
): Promise<{ completed: boolean; completedItems: string[] }> {
  if (!isDatabaseConfigured()) {
    throw new Error('Banco de dados MongoDB não configurado.');
  }

  const subjects = await getStudyStructure();
  let targetModule: StudyModule | null = null;
  for (const s of subjects) {
    const found = s.modules.find(m => m.id === moduleId);
    if (found) {
      targetModule = found;
      break;
    }
  }

  if (!targetModule) {
    throw new Error(`Módulo '${moduleId}' não encontrado.`);
  }

  const itemExists = targetModule.items.some(i => i.id === itemId);
  if (!itemExists) {
    throw new Error(`Item '${itemId}' não pertence ao módulo '${moduleId}'.`);
  }

  try {
    const db = await getDb();
    const existing = await db.collection<UserProgressDoc>('progress').findOne({ userId, moduleId });

    let completedItems = existing?.completedItems ? [...existing.completedItems] : [];

    if (completed) {
      if (!completedItems.includes(itemId)) {
        completedItems.push(itemId);
      }
    } else {
      completedItems = completedItems.filter(id => id !== itemId);
    }

    // Se todos os itens do módulo foram concluídos, o módulo é considerado concluído
    const totalItemsCount = targetModule.items.length;
    const isModuleComplete = totalItemsCount > 0 && completedItems.length >= totalItemsCount;

    const now = new Date().toISOString();

    await db.collection<UserProgressDoc>('progress').updateOne(
      { userId, moduleId },
      {
        $set: {
          userId,
          moduleId,
          completed: isModuleComplete,
          completedItems,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return { completed: isModuleComplete, completedItems };
  } catch (err: any) {
    if (err.message?.includes('not allowed to do action')) {
      throw new Error('Permissão negada no MongoDB Atlas: seu usuário de banco não possui permissão de escrita. No Atlas, acesse Security -> Database Access -> Edit User e selecione "Read and write to any database".');
    }
    throw err;
  }
}

export function computeStats(
  subjects: StudySubject[],
  progressMap: Record<string, { completed: boolean; completedItems: string[] }>
): GlobalStats {
  let totalModules = 0;
  let totalCompletedModules = 0;
  let totalItems = 0;
  let totalCompletedItems = 0;

  const subjectsStats: SubjectStats[] = subjects.map(s => {
    let sCompletedModules = 0;
    let sTotalItems = 0;
    let sCompletedItems = 0;

    for (const m of s.modules) {
      totalModules++;
      const p = progressMap[m.id];
      const isCompleted = Boolean(p?.completed);
      if (isCompleted) {
        sCompletedModules++;
        totalCompletedModules++;
      }

      sTotalItems += m.items.length;
      totalItems += m.items.length;

      const cItems = p?.completedItems ? p.completedItems.length : (isCompleted ? m.items.length : 0);
      sCompletedItems += cItems;
      totalCompletedItems += cItems;
    }

    const sTotalModules = s.modules.length;
    const sPendingModules = sTotalModules - sCompletedModules;
    // Fórmula oficial Seção 7.5: (módulos concluídos / total de módulos) * 100
    const sPercentage = sTotalModules > 0 ? Number(((sCompletedModules / sTotalModules) * 100).toFixed(1)) : 0;

    return {
      id: s.id,
      name: s.name,
      order: s.order,
      totalModules: sTotalModules,
      completedModules: sCompletedModules,
      pendingModules: sPendingModules,
      percentage: sPercentage,
      totalItems: sTotalItems,
      completedItems: sCompletedItems,
    };
  });

  const pendingModules = totalModules - totalCompletedModules;
  // Fórmula oficial Seção 7.5: (total de módulos concluídos / total de módulos identificados) * 100
  const percentage = totalModules > 0 ? Number(((totalCompletedModules / totalModules) * 100).toFixed(1)) : 0;

  return {
    totalSubjects: subjects.length,
    totalModules,
    completedModules: totalCompletedModules,
    pendingModules,
    percentage,
    totalItems,
    completedItems: totalCompletedItems,
    subjects: subjectsStats,
  };
}
