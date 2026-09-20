import { HabitColor } from '@/types/habit';

export interface ColorDefinition {
  id: HabitColor;
  name: string;
  accent: string;
  bgFill: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  glow: string;
  // 4 stepped intensity levels for heatmap legend (from level 1 to level 4)
  levels: [string, string, string, string];
}

export const COLOR_THEMES: Record<HabitColor, ColorDefinition> = {
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    accent: '#3b82f6',
    bgFill: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeText: '#93c5fd',
    border: 'rgba(59, 130, 246, 0.4)',
    glow: 'rgba(59, 130, 246, 0.35)',
    levels: ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa'],
  },
  magenta: {
    id: 'magenta',
    name: 'Magenta / Pink',
    accent: '#ec4899',
    bgFill: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    badgeText: '#f472b6',
    border: 'rgba(236, 72, 153, 0.4)',
    glow: 'rgba(236, 72, 153, 0.35)',
    levels: ['#831843', '#db2777', '#ec4899', '#f472b6'],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    accent: '#10b981',
    bgFill: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeText: '#6ee7b7',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.35)',
    levels: ['#064e3b', '#059669', '#10b981', '#34d399'],
  },
  red: {
    id: 'red',
    name: 'Crimson Red',
    accent: '#ef4444',
    bgFill: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeText: '#fca5a5',
    border: 'rgba(239, 68, 68, 0.4)',
    glow: 'rgba(239, 68, 68, 0.35)',
    levels: ['#7f1d1d', '#dc2626', '#ef4444', '#f87171'],
  },
  amber: {
    id: 'amber',
    name: 'Amber Gold',
    accent: '#f59e0b',
    bgFill: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeText: '#fcd34d',
    border: 'rgba(245, 158, 11, 0.4)',
    glow: 'rgba(245, 158, 11, 0.35)',
    levels: ['#78350f', '#d97706', '#f59e0b', '#fbbf24'],
  },
  purple: {
    id: 'purple',
    name: 'Violet Purple',
    accent: '#a855f7',
    bgFill: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    badgeText: '#d8b4fe',
    border: 'rgba(168, 85, 247, 0.4)',
    glow: 'rgba(168, 85, 247, 0.35)',
    levels: ['#581c87', '#9333ea', '#a855f7', '#c084fc'],
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    accent: '#06b6d4',
    bgFill: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    badgeText: '#67e8f9',
    border: 'rgba(6, 182, 212, 0.4)',
    glow: 'rgba(6, 182, 212, 0.35)',
    levels: ['#164e63', '#0891b2', '#06b6d4', '#22d3ee'],
  },
  indigo: {
    id: 'indigo',
    name: 'Deep Indigo',
    accent: '#6366f1',
    bgFill: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    badgeText: '#a5b4fc',
    border: 'rgba(99, 102, 241, 0.4)',
    glow: 'rgba(99, 102, 241, 0.35)',
    levels: ['#312e81', '#4f46e5', '#6366f1', '#818cf8'],
  },
};

export const UNFILLED_COLOR = '#212128';
