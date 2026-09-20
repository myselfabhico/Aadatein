'use client';

import React, { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { COLOR_THEMES } from '@/lib/color-themes';
import { computeHabitStats, getTodayKey } from '@/lib/date-utils';
import { ContributionMatrix } from './ContributionMatrix';
import { Check, Flame, Award, Percent } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  habitIndex: number;
  onToggleToday: (habitId: string) => void;
  onToggleDate: (habitId: string, dateKey: string) => void;
  onEditHabit: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  habitIndex,
  onToggleToday,
  onToggleDate,
  onEditHabit,
}) => {
  const theme = COLOR_THEMES[habit.color] || COLOR_THEMES.blue;
  const stats = useMemo(() => computeHabitStats(habit.completedDates), [habit.completedDates]);

  return (
    <div
      id={`habit-card-${habit.id}`}
      className="group relative rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 sm:p-5 transition-all duration-200 hover:border-[#32323f] shadow-lg shadow-black/20"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252530]">
        {/* Left: Circular status toggle + emoji + title */}
        <div className="flex items-center gap-3">
          {/* Circular status toggle button container - fixed dimensions lock element position to prevent shaking/layout shifts */}
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <button
              id={`toggle-today-${habit.id}`}
              type="button"
              onClick={() => onToggleToday(habit.id)}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-transform duration-150 ease-out hover:scale-105 active:scale-95 animate-checkbox-tap cursor-pointer shrink-0 select-none transform-gpu origin-center will-change-transform ${
                stats.isCompletedToday
                  ? 'border-transparent shadow-xs'
                  : 'border-[#3f3f4e] hover:border-[#808096] bg-[#141418]'
              }`}
              style={{
                backgroundColor: stats.isCompletedToday ? theme.bgFill : undefined,
                boxShadow: stats.isCompletedToday ? `0 0 12px ${theme.glow}` : undefined,
              }}
              title={
                stats.isCompletedToday
                  ? `Completed today! Click to uncheck (Shortcut: ${habitIndex + 1})`
                  : `Mark completed today (Shortcut: ${habitIndex + 1})`
              }
              aria-label={`Toggle completion for ${habit.title}`}
            >
              {stats.isCompletedToday ? (
                <Check className="w-4 h-4 text-white stroke-[3] animate-checkmark-rotate origin-center" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#353542]" />
              )}
            </button>
          </div>

          {/* Emoji Icon */}
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#22222b] text-lg select-none"
            role="img"
            aria-label={habit.title}
          >
            {habit.emoji}
          </span>

          {/* Habit Title */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onEditHabit(habit)}
              className="text-left font-bold text-white text-sm sm:text-base hover:underline hover:text-white/90 cursor-pointer flex items-center gap-2"
              title="Click to edit habit"
            >
              <span>{habit.title}</span>
            </button>
            <span className="text-[11px] text-[#8e8e93]">
              {habit.category} • Target {habit.targetDaysPerWeek}d/week
            </span>
          </div>
        </div>

        {/* Right: Pill-shaped status tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Streak pill */}
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              border: `1px solid ${theme.border}`,
            }}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{stats.currentStreak}-day streak</span>
          </div>

          {/* Best streak pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#22222b] text-[#d4d4d8] border border-[#2d2d38]">
            <Award className="w-3.5 h-3.5 text-[#8e8e93]" />
            <span>Best: {stats.longestStreak}</span>
          </div>

          {/* 30-day completion rate pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#22222b] text-[#d4d4d8] border border-[#2d2d38]">
            <Percent className="w-3 h-3 text-[#8e8e93]" />
            <span>{stats.thirtyDayRate}%</span>
          </div>
        </div>
      </div>

      {/* Contribution Matrix */}
      <ContributionMatrix habit={habit} onToggleDate={onToggleDate} />
    </div>
  );
};
