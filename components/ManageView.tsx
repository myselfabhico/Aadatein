'use client';

import React from 'react';
import { Habit } from '@/types/habit';
import { COLOR_THEMES } from '@/lib/color-themes';
import { computeHabitStats, getDaysSinceLastUpdate, formatFriendlyDate } from '@/lib/date-utils';
import { GripVertical, Pencil, Trash2, ArrowUp, ArrowDown, Plus, AlertCircle, Clock } from 'lucide-react';

interface ManageViewProps {
  habits: Habit[];
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onMoveHabit: (index: number, direction: 'up' | 'down') => void;
  onOpenAddModal: () => void;
}

export const ManageView: React.FC<ManageViewProps> = ({
  habits,
  onEditHabit,
  onDeleteHabit,
  onMoveHabit,
  onOpenAddModal,
}) => {
  return (
    <div
      id="manage-view-container"
      className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 sm:p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252530] mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Manage Habits & Parameters
          </h2>
          <p className="text-xs text-[#8e8e93] mt-0.5">
            Reorder, edit titles, colors, target frequencies, or remove habits.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Habit</span>
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#292936] rounded-xl">
          <p className="text-sm text-[#8e8e93] mb-3">No habits configured yet.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-black cursor-pointer"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit, index) => {
            const theme = COLOR_THEMES[habit.color] || COLOR_THEMES.blue;
            const stats = computeHabitStats(habit.completedDates);
            const inactivity = getDaysSinceLastUpdate(habit.completedDates, habit.createdAt);
            const isInactive = inactivity.days >= 7;

            return (
              <div
                key={habit.id}
                id={`manage-item-${habit.id}`}
                className={`flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all group ${
                  isInactive
                    ? 'bg-[#181517] border-amber-500/25 hover:border-amber-500/40 shadow-xs'
                    : 'bg-[#141418] border-[#262633] hover:border-[#353545]'
                }`}
              >
                {/* Left: Drag Handle & Reorder controls */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <div
                    className="p-1 text-[#606070] group-hover:text-[#a0a0b2] transition-colors cursor-grab select-none"
                    title="Drag handle (::)"
                    aria-label="Reorder handle"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Up / Down arrows for quick repositioning */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveHabit(index, 'up')}
                      className={`p-0.5 rounded text-[#71717a] hover:text-white transition-colors cursor-pointer ${
                        index === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#22222d]'
                      }`}
                      title="Move habit up"
                      aria-label="Move habit up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === habits.length - 1}
                      onClick={() => onMoveHabit(index, 'down')}
                      className={`p-0.5 rounded text-[#71717a] hover:text-white transition-colors cursor-pointer ${
                        index === habits.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#22222d]'
                      }`}
                      title="Move habit down"
                      aria-label="Move habit down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Habit Identity & Metadata */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Emoji Icon */}
                  <span
                    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#22222b] text-lg sm:text-xl shrink-0"
                    role="img"
                    aria-label={habit.title}
                  >
                    {habit.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                        {habit.title}
                      </h3>

                      {/* Inactive visual pill tag if not updated in 7+ days */}
                      {isInactive && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0"
                          title={
                            inactivity.lastDateKey
                              ? `Last completed on ${formatFriendlyDate(inactivity.lastDateKey)} (${inactivity.days} days ago)`
                              : `Created ${inactivity.days} days ago with no recorded completions`
                          }
                        >
                          <AlertCircle className="w-3 h-3 text-amber-400 stroke-[2.2]" />
                          <span>
                            {inactivity.neverCompleted
                              ? 'No check-ins (7d+)'
                              : `Inactive ${inactivity.days}d`}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8e8e93] mt-0.5 truncate">
                      {habit.category} • Target: {habit.targetDaysPerWeek} days/week
                      {isInactive && inactivity.lastDateKey && (
                        <span className="text-[#a1a1aa] ml-1.5">
                          • Last active: {formatFriendlyDate(inactivity.lastDateKey)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="shrink-0 hidden sm:block">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {stats.currentStreak}-day streak
                  </span>
                </div>

                {/* Right-aligned interactive action icons: edit [✎] pencil and delete [✕] cross */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    id={`edit-habit-${habit.id}`}
                    type="button"
                    onClick={() => onEditHabit(habit)}
                    className="p-2 rounded-lg text-[#8e8e93] hover:text-white hover:bg-[#22222d] border border-transparent hover:border-[#353545] transition-all cursor-pointer"
                    title="Edit habit [✎]"
                    aria-label={`Edit ${habit.title}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    id={`delete-habit-${habit.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHabit(habit.id);
                    }}
                    className={`p-2 rounded-lg transition-all cursor-pointer border ${
                      isInactive
                        ? 'text-amber-400/80 hover:text-red-400 hover:bg-red-500/15 border-amber-500/20 hover:border-red-500/30'
                        : 'text-[#8e8e93] hover:text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/20'
                    } active:scale-95`}
                    title={`Delete or archive ${habit.title}`}
                    aria-label={`Delete ${habit.title}`}
                  >
                    <Trash2 className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

