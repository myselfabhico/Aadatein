'use client';

import React, { useMemo, useState } from 'react';
import { Habit } from '@/types/habit';
import { COLOR_THEMES, UNFILLED_COLOR } from '@/lib/color-themes';
import { buildRecentDateWindow, computeHabitStats, formatFriendlyDate } from '@/lib/date-utils';
import { Flame } from 'lucide-react';

interface MatrixViewProps {
  habits: Habit[];
  onToggleDate: (habitId: string, dateKey: string) => void;
  onEditHabit: (habit: Habit) => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ habits, onToggleDate, onEditHabit }) => {
  const dateWindow = useMemo(() => buildRecentDateWindow(30), []);
  const [hoveredCell, setHoveredCell] = useState<{
    habitTitle: string;
    dateKey: string;
    isCompleted: boolean;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  // Determine month spans for top header
  const dateRangeLabel = useMemo(() => {
    if (dateWindow.length === 0) return '';
    const first = dateWindow[0];
    const last = dateWindow[dateWindow.length - 1];
    return `${first.monthShort} ${first.dayNumber} — ${last.monthShort} ${last.dayNumber}`;
  }, [dateWindow]);

  return (
    <div
      id="matrix-view-container"
      className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 sm:p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#252530] mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>High-Density Activity Matrix</span>
            <span className="text-xs font-normal text-[#8e8e93] px-2 py-0.5 rounded-full bg-[#24242e]">
              Recent 30 Days
            </span>
          </h2>
          <p className="text-xs text-[#8e8e93] mt-0.5">
            Window: {dateRangeLabel}. Click any cell to toggle completion.
          </p>
        </div>
      </div>

      {/* Responsive horizontal scroll table */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#2d2d38]">
        <div className="min-w-fit">
          {/* Header Row with Date Columns */}
          <div className="flex items-end border-b border-[#292934] pb-2">
            {/* Left label column */}
            <div className="w-56 sm:w-64 pr-4 shrink-0 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
              Habit & Streak
            </div>

            {/* Date columns */}
            <div className="flex items-end gap-1.5">
              {dateWindow.map((item) => (
                <div
                  key={item.dateKey}
                  className={`flex flex-col items-center justify-end w-6 text-center select-none ${
                    item.isToday ? 'text-white font-bold' : 'text-[#71717a]'
                  }`}
                >
                  <span className="text-[9px] font-mono leading-none mb-1">
                    {item.weekdayShort}
                  </span>
                  <span
                    className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full leading-none font-mono ${
                      item.isToday
                        ? 'bg-white text-black font-bold shadow-xs'
                        : 'text-[#8e8e93]'
                    }`}
                    title={item.dateKey}
                  >
                    {item.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows: Each Habit */}
          <div className="divide-y divide-[#22222b]">
            {habits.map((habit) => {
              const theme = COLOR_THEMES[habit.color] || COLOR_THEMES.blue;
              const completedSet = new Set(habit.completedDates);
              const stats = computeHabitStats(habit.completedDates);

              return (
                <div
                  key={habit.id}
                  className="flex items-center py-2.5 hover:bg-[#1f1f26] rounded-lg transition-colors group"
                >
                  {/* Left Habit Information */}
                  <div className="w-56 sm:w-64 pr-4 shrink-0 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onEditHabit(habit)}
                      className="flex items-center gap-2 text-left cursor-pointer min-w-0"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-[#23232d] text-base shrink-0">
                        {habit.emoji}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[130px] sm:max-w-[150px] group-hover:text-blue-300 transition-colors">
                        {habit.title}
                      </span>
                    </button>

                    {/* Streak pill */}
                    <span
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                      style={{
                        backgroundColor: theme.badgeBg,
                        color: theme.badgeText,
                        border: `1px solid ${theme.border}`,
                      }}
                      title={`${stats.currentStreak}-day current streak`}
                    >
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      {stats.currentStreak}d
                    </span>
                  </div>

                  {/* Activity Squares */}
                  <div className="flex items-center gap-1.5">
                    {dateWindow.map((item) => {
                      const isCompleted = completedSet.has(item.dateKey);

                      return (
                        <div
                          key={item.dateKey}
                          className="w-6 h-6 shrink-0 flex items-center justify-center relative"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleDate(habit.id, item.dateKey)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredCell({
                                habitTitle: habit.title,
                                dateKey: item.dateKey,
                                isCompleted,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                                color: theme.accent,
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-6 h-6 rounded-[3px] flex items-center justify-center transition-transform duration-150 ease-out hover:scale-105 active:scale-95 animate-checkbox-tap cursor-pointer transform-gpu origin-center will-change-transform ${
                              item.isToday ? 'ring-1 ring-white/60' : ''
                            } hover:brightness-125 hover:ring-1 hover:ring-white/40`}
                            style={{
                              backgroundColor: isCompleted ? theme.bgFill : UNFILLED_COLOR,
                              boxShadow: isCompleted ? `0 0 6px ${theme.glow}` : undefined,
                            }}
                            aria-label={`${habit.title} on ${item.dateKey}: ${
                              isCompleted ? 'Completed' : 'Unfinished'
                            }`}
                          >
                            {isCompleted && item.isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 px-2.5 py-1.5 rounded-md bg-[#0f0f13] border border-[#2e2e3a] text-white text-[11px] shadow-xl whitespace-nowrap"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
          }}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: hoveredCell.isCompleted ? hoveredCell.color : '#52525b',
              }}
            />
            <span className="truncate max-w-[160px]">{hoveredCell.habitTitle}</span>
          </div>
          <p className="text-[10px] text-[#a1a1aa] mt-0.5">
            {formatFriendlyDate(hoveredCell.dateKey)} •{' '}
            <span className={hoveredCell.isCompleted ? 'text-white font-semibold' : 'text-[#71717a]'}>
              {hoveredCell.isCompleted ? 'Completed' : 'No activity'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
