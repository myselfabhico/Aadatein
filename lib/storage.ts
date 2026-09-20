import { Habit } from '@/types/habit';
import { formatDateKey } from './date-utils';

const COOKIE_PREFIX = 'aadatein_habits';
const STORAGE_KEY = 'aadatein_habits_data';

// Helper to set cookie
export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper to get cookie
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Helper to remove cookie
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

// Save habits to both Cookie and localStorage (handles chunking if payload is large)
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeHabits(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function saveHabits(habits: Habit[]): void {
  cachedHabits = habits;
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(habits);

    // Save to localStorage as reliable backup
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch {
      // ignore localStorage quota errors
    }

    // Cookie storage: cookies have ~4KB limit per cookie.
    // If json < 3500 chars, write to single cookie.
    // If larger, write chunked cookies.
    const CHUNK_SIZE = 3000;
    if (json.length <= CHUNK_SIZE) {
      setCookie(COOKIE_PREFIX, json);
      // Clean up chunk markers if any existed before
      deleteCookie(`${COOKIE_PREFIX}_chunks`);
    } else {
      const totalChunks = Math.ceil(json.length / CHUNK_SIZE);
      setCookie(`${COOKIE_PREFIX}_chunks`, String(totalChunks));
      for (let i = 0; i < totalChunks; i++) {
        const chunk = json.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        setCookie(`${COOKIE_PREFIX}_${i}`, chunk);
      }
    }
    notifyListeners();
  } catch (err) {
    console.error('Failed to save habits to cookies:', err);
  }
}

// Load habits from Cookie (or fallback to localStorage / default initial habits)
let cachedHabits: Habit[] | null = null;

export function getHabitsSnapshot(): Habit[] {
  if (typeof window === 'undefined') {
    return getDefaultHabits();
  }
  if (!cachedHabits) {
    cachedHabits = loadHabits();
  }
  return cachedHabits;
}

export function loadHabits(): Habit[] {
  if (typeof window === 'undefined') {
    return getDefaultHabits();
  }

  try {
    // 1. Try reading chunked cookies
    const chunksCountStr = getCookie(`${COOKIE_PREFIX}_chunks`);
    if (chunksCountStr) {
      const chunksCount = parseInt(chunksCountStr, 10);
      let combined = '';
      for (let i = 0; i < chunksCount; i++) {
        const chunk = getCookie(`${COOKIE_PREFIX}_${i}`);
        if (chunk) combined += chunk;
      }
      if (combined) {
        const parsed = JSON.parse(combined);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedHabits = parsed;
          return parsed;
        }
      }
    }

    // 2. Try single cookie
    const singleCookie = getCookie(COOKIE_PREFIX);
    if (singleCookie) {
      const parsed = JSON.parse(singleCookie);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedHabits = parsed;
        return parsed;
      }
    }

    // 3. Try localStorage fallback
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedHabits = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading stored habits, returning defaults', err);
  }

  // 4. If no stored habits, return default preset habits and save them immediately to cookies!
  const defaults = getDefaultHabits();
  cachedHabits = defaults;
  saveHabits(defaults);
  return defaults;
}

// Generate realistic history for starter habits
function generateSampleDates(options: {
  frequencyRatio: number; // e.g. 0.7
  streakDays: number; // recent streak up to today
  historyMonths?: number;
  skipDaysPattern?: (dayOfWeek: number) => boolean;
}): string[] {
  const dates = new Set<string>();
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Guarantee recent streak days
  for (let i = 0; i < options.streakDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.add(formatDateKey(d));
  }

  // Create realistic historical check-ins over the past 365 days
  const totalDays = 365;
  for (let i = options.streakDays + 1; i < totalDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();

    if (options.skipDaysPattern && options.skipDaysPattern(dayOfWeek)) {
      continue;
    }

    // Deterministic pseudo-randomness based on date and habit frequency
    const pseudoRandom = Math.sin(d.getTime() % 1000000) * 0.5 + 0.5;
    if (pseudoRandom < options.frequencyRatio) {
      dates.add(formatDateKey(d));
    }
  }

  return Array.from(dates).sort();
}

// Memoized static default habits instance so getServerSnapshot returns a stable reference
let defaultHabitsCached: Habit[] | null = null;

export function getDefaultHabits(): Habit[] {
  if (!defaultHabitsCached) {
    defaultHabitsCached = [
      {
        id: 'habit-1',
        title: 'TouchType for 10 minutes daily',
        emoji: '📝',
        category: 'Productivity',
        targetDaysPerWeek: 7,
        color: 'blue',
        completedDates: generateSampleDates({
          frequencyRatio: 0.72,
          streakDays: 4,
        }),
        createdAt: '2026-01-01',
        order: 1,
      },
      {
        id: 'habit-2',
        title: 'Drink 2.5L Water',
        emoji: '💧',
        category: 'Health & Fitness',
        targetDaysPerWeek: 7,
        color: 'magenta',
        completedDates: generateSampleDates({
          frequencyRatio: 0.85,
          streakDays: 12,
        }),
        createdAt: '2026-01-05',
        order: 2,
      },
      {
        id: 'habit-3',
        title: 'Strength Training',
        emoji: '🏋️',
        category: 'Health & Fitness',
        targetDaysPerWeek: 4,
        color: 'emerald',
        completedDates: generateSampleDates({
          frequencyRatio: 0.55,
          streakDays: 3,
          skipDaysPattern: (day) => day === 0 || day === 4, // skip Sun & Thu
        }),
        createdAt: '2026-01-10',
        order: 3,
      },
      {
        id: 'habit-4',
        title: 'Read 20 Pages',
        emoji: '📚',
        category: 'Learning',
        targetDaysPerWeek: 6,
        color: 'red',
        completedDates: generateSampleDates({
          frequencyRatio: 0.78,
          streakDays: 6,
        }),
        createdAt: '2026-01-15',
        order: 4,
      },
      {
        id: 'habit-5',
        title: 'Music Practice',
        emoji: '🎵',
        category: 'Mindfulness',
        targetDaysPerWeek: 5,
        color: 'amber',
        completedDates: generateSampleDates({
          frequencyRatio: 0.62,
          streakDays: 2,
        }),
        createdAt: '2026-02-01',
        order: 5,
      },
    ];
  }
  return defaultHabitsCached;
}

export function getServerHabitsSnapshot(): Habit[] {
  return getDefaultHabits();
}
