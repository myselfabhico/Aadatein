import { HabitStats } from '@/types/habit';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getDaysAgo(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export interface CalendarDay {
  date: Date;
  dateKey: string;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  isToday: boolean;
  isFuture: boolean;
  month: number;
}

export interface CalendarWeek {
  weekIndex: number;
  monthLabel?: string;
  days: (CalendarDay | null)[];
}

/**
 * Builds a 52-week calendar grid ending on the current week's Saturday.
 * Sun = row 0, Sat = row 6.
 */
export function buildYearlyCalendar(): {
  weeks: CalendarWeek[];
  monthMarkers: { label: string; colIndex: number }[];
} {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // End of current week (Saturday)
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  const endSaturday = new Date(today);
  endSaturday.setDate(today.getDate() + (6 - currentDayOfWeek));

  const totalWeeks = 53; // GitHub standard is ~52-53 weeks
  const totalDays = totalWeeks * 7;

  const startDate = new Date(endSaturday);
  startDate.setDate(endSaturday.getDate() - totalDays + 1);

  const weeks: CalendarWeek[] = [];
  const monthMarkers: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;

  const cursor = new Date(startDate);

  for (let w = 0; w < totalWeeks; w++) {
    const days: (CalendarDay | null)[] = [];
    let weekMonth = -1;

    for (let d = 0; d < 7; d++) {
      const dateCopy = new Date(cursor);
      const dateKey = formatDateKey(dateCopy);
      const isToday = dateKey === getTodayKey();
      const isFuture = dateCopy > today;
      const m = dateCopy.getMonth();

      days.push({
        date: dateCopy,
        dateKey,
        dayOfWeek: dateCopy.getDay(),
        isToday,
        isFuture,
        month: m,
      });

      if (d === 0) {
        weekMonth = m;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    // Determine month label placement
    if (weekMonth !== lastMonth) {
      const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2026, weekMonth, 1));
      monthMarkers.push({ label: monthShort, colIndex: w });
      lastMonth = weekMonth;
    }

    weeks.push({
      weekIndex: w,
      days,
    });
  }

  return { weeks, monthMarkers };
}

/**
 * Builds recent date window (e.g. 30 days) for Matrix View.
 */
export function buildRecentDateWindow(daysCount: number = 30): {
  date: Date;
  dateKey: string;
  dayNumber: number;
  monthShort: string;
  weekdayShort: string;
  isToday: boolean;
}[] {
  const result = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    result.push({
      date: d,
      dateKey,
      dayNumber: d.getDate(),
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      weekdayShort: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: dateKey === getTodayKey(),
    });
  }

  return result;
}

/**
 * Builds 12-week mini strip for statistics card.
 */
export function buildTwelveWeekStrip(): {
  dateKey: string;
  isToday: boolean;
  weekIndex: number;
}[] {
  const result = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const totalDays = 12 * 7; // 84 days
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      dateKey: formatDateKey(d),
      isToday: i === 0,
      weekIndex: Math.floor((totalDays - 1 - i) / 7),
    });
  }
  return result;
}

/**
 * Calculates current streak, longest streak, 30-day rate, and annual rate.
 */
export function computeHabitStats(completedDates: string[]): HabitStats {
  const dateSet = new Set(completedDates);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const todayKey = formatDateKey(today);
  const isCompletedToday = dateSet.has(todayKey);

  // Current streak
  let currentStreak = 0;
  const streakCursor = new Date(today);

  if (isCompletedToday) {
    currentStreak++;
    streakCursor.setDate(streakCursor.getDate() - 1);
  } else {
    // Check if yesterday was completed
    streakCursor.setDate(streakCursor.getDate() - 1);
  }

  while (dateSet.has(formatDateKey(streakCursor))) {
    currentStreak++;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }

  // Longest streak
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTimestamp: number | null = null;

  for (const dKey of sortedDates) {
    const ts = parseDateKey(dKey).getTime();
    if (prevTimestamp === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((ts - prevTimestamp) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevTimestamp = ts;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 30-day rate
  let thirtyDayCount = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dateSet.has(formatDateKey(d))) {
      thirtyDayCount++;
    }
  }
  const thirtyDayRate = Math.round((thirtyDayCount / 30) * 100);

  // Annual rate (past 365 days)
  let annualCount = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dateSet.has(formatDateKey(d))) {
      annualCount++;
    }
  }
  const annualRate = Math.round((annualCount / 365) * 100);

  return {
    currentStreak,
    longestStreak,
    thirtyDayCount,
    thirtyDayRate,
    annualRate,
    totalCompletions: completedDates.length,
    isCompletedToday,
  };
}

export function formatFriendlyDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export type DateRangeType = '30d' | '90d' | 'ytd';

export interface RangePeriodStats {
  periodDays: number;
  periodCompletions: number;
  periodRate: number; // 0 - 100%
  label: string;
}

export function getDateRangeDays(range: DateRangeType): { days: number; label: string } {
  if (range === '30d') {
    return { days: 30, label: 'Last 30 Days' };
  }
  if (range === '90d') {
    return { days: 90, label: 'Last 90 Days' };
  }
  // Year-to-Date: days from Jan 1 of current year to today (inclusive)
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const startOfYear = new Date(today.getFullYear(), 0, 1, 12, 0, 0);
  const diffDays = Math.max(1, Math.round((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  return { days: diffDays, label: 'Year-to-Date' };
}

export function computeHabitRangeStats(completedDates: string[], range: DateRangeType): RangePeriodStats {
  const dateSet = new Set(completedDates);
  const { days: periodDays, label } = getDateRangeDays(range);

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let periodCompletions = 0;
  for (let i = 0; i < periodDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dateSet.has(formatDateKey(d))) {
      periodCompletions++;
    }
  }

  const periodRate = Math.round((periodCompletions / periodDays) * 100);

  return {
    periodDays,
    periodCompletions,
    periodRate,
    label,
  };
}

export function getDaysSinceLastUpdate(completedDates: string[], createdAt?: string): {
  days: number;
  lastDateKey: string | null;
  neverCompleted: boolean;
} {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (completedDates.length === 0) {
    if (createdAt) {
      const createdDate = new Date(createdAt);
      createdDate.setHours(12, 0, 0, 0);
      const diffMs = today.getTime() - createdDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return { days: diffDays, lastDateKey: null, neverCompleted: true };
    }
    return { days: Infinity, lastDateKey: null, neverCompleted: true };
  }

  // Get the most recent date key
  const sorted = [...completedDates].sort();
  const latestDateKey = sorted[sorted.length - 1];
  const latestDate = parseDateKey(latestDateKey);

  const diffMs = today.getTime() - latestDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  return {
    days: diffDays,
    lastDateKey: latestDateKey,
    neverCompleted: false,
  };
}
