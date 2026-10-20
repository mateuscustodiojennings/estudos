export type ItemType = 'aula' | 'topico';

export interface StudyItem {
  id: string; // e.g. "quimica_quimica-basica_aula-1"
  number: number;
  title: string;
  type: ItemType;
}

export interface StudyModule {
  id: string; // e.g. "quimica_quimica-basica"
  name: string;
  order: number;
  declared_aulas: number;
  items_count: number;
  items_type: ItemType | 'nenhum';
  notes?: string | null;
  items: StudyItem[];
}

export interface StudySubject {
  id: string; // e.g. "quimica"
  name: string;
  original_title: string;
  order: number;
  modules_count: number;
  total_declared_aulas: number;
  total_items: number;
  modules: StudyModule[];
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  completedItems: string[]; // List of completed item IDs
  updatedAt: string;
}

export interface SubjectStats {
  id: string;
  name: string;
  order: number;
  totalModules: number;
  completedModules: number;
  pendingModules: number;
  percentage: number;
  totalItems: number;
  completedItems: number;
}

export interface GlobalStats {
  totalSubjects: number;
  totalModules: number;
  completedModules: number;
  pendingModules: number;
  percentage: number;
  totalItems: number;
  completedItems: number;
  subjects: SubjectStats[];
}

export interface UserSession {
  userId: string;
  username: string;
}
