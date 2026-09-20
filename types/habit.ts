export type HabitColor = 'blue' | 'magenta' | 'emerald' | 'red' | 'amber' | 'purple' | 'cyan' | 'indigo';

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  category: string;
  targetDaysPerWeek: number;
  color: HabitColor;
  completedDates: string[]; // ISO format YYYY-MM-DD
  createdAt: string;
  order: number;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  thirtyDayCount: number;
  thirtyDayRate: number;
  annualRate: number;
  totalCompletions: number;
  isCompletedToday: boolean;
}

export type ActiveTab = 'calendar' | 'statistics' | 'manage';
