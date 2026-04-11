// ===== Game Types =====
export type GradeMode = 'low_grade' | 'high_grade' | null;
export type Gender = 'male' | 'female';

export interface Player {
  name: string;
  gender: Gender;
}

export interface GameStats {
  understanding: number;
  trust: number;
  communication: number;
  patience: number;
}

export interface GameLogs {
  waiting_count: number;
  tool_accuracy: number;
  tool_attempts: number;
}

export interface GameState {
  currentStage: string;
  gradeMode: GradeMode;
  hearts: number;
  player: Player;
  npc: Player;
  stats: GameStats;
  inventory: string[];
  usedTools: string[];
  logs: GameLogs;
  stressGauge: number;
  encyclopediaUnlocked: string[];
  completedStages: string[];
  isMuted: boolean;
}

export type GameAction =
  | { type: 'SET_PLAYER_GENDER'; payload: Gender }
  | { type: 'SET_PLAYER'; payload: Partial<Player> }
  | { type: 'SET_NPC'; payload: Partial<Player> }
  | { type: 'SET_STAGE'; payload: string }
  | { type: 'SET_GRADE_MODE'; payload: GradeMode }
  | { type: 'ADD_HEART' }
  | { type: 'ADD_STAT'; payload: { key: keyof GameStats; value: number } }
  | { type: 'ADD_INVENTORY'; payload: string }
  | { type: 'USE_TOOL'; payload: string }
  | { type: 'LOG_TOOL_ATTEMPT' }
  | { type: 'LOG_TOOL_ACCURACY' }
  | { type: 'LOG_WAITING' }
  | { type: 'SET_STRESS'; payload: number }
  | { type: 'COMPLETE_STAGE'; payload: string }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'RESET' };

// ===== Auth Types =====
export type UserRole = 'teacher' | 'student' | 'admin';

export interface AuthUser {
  uid: string;
  username: string;
  email?: string;
  role: UserRole;
  classId?: string;
  teacherId?: string;
  authCode?: string;
}

export interface TeacherData {
  uid: string;
  username: string;
  email: string;
  createdAt: string;
  classes: ClassData[];
}

export interface ClassData {
  id: string;
  name: string;
  authCode: string;
  students: StudentData[];
}

export interface StudentData {
  id: string;
  name: string;
  authCode: string;
  progress: StudentProgress;
}

export interface StudentProgress {
  gradeMode: GradeMode;
  currentStage: string;
  stats: GameStats;
  usedTools: string[];
  logs: GameLogs;
  completedStages: string[];
  completedAt?: string;
}

// ===== Dialogue Types =====
export interface DialogueChoice {
  text: string;
  action: () => void;
}

export interface DialogueData {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  onNext?: () => void;
}

// ===== Tool Types =====
export interface ToolInfo {
  /** Key into ITEM_IMAGES for displaying the tool's PNG icon. */
  iconKey?: string;
  name: string;
  color: string;
  desc: string;
}
