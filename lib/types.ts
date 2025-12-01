export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  streak: number;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
}

export interface HabitStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
}
