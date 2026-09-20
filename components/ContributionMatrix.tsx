'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { COLOR_THEMES, UNFILLED_COLOR } from '@/lib/color-themes';
import { buildYearlyCalendar, formatFriendlyDate, CalendarDay } from '@/lib/date-utils';

interface ContributionMatrixProps {
  habit: Habit;
  onToggleDate: (habitId: string, dateKey: string) => void;
}

const CELL_SIZE = 11;
const CELL_GAP = 3;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ContributionMatrix: React.FC<ContributionMatrixProps> = ({ habit, onToggleDate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = COLOR_THEMES[habit.color] || COLOR_THEMES.blue;

  const [hoveredCell, setHoveredCell] = useState<{
    day: CalendarDay;
    isCompleted: boolean;
    x: number;
    y: number;
  } | null>(null);

  const completedSet = useMemo(() => new Set(habit.completedDates), [habit.completedDates]);
  const { weeks, monthMarkers } = useMemo(() => buildYearlyCalendar(), []);

  // Scroll to the far right on mount so recent dates are visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);

  const totalCols = weeks.length;
  const matrixWidth = totalCols * (CELL_SIZE + CELL_GAP);
  const matrixHeight = 7 * (CELL_SIZE + CELL_GAP);

  return (
    <div className="w-full flex flex-col pt-1">
      {/* Scrollable Matrix Container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#2a2a35] scrollbar-track-transparent"
      >
        <div className="min-w-fit flex items-start select-none py-1">
          {/* Weekday Row Labels (Sun - Sat) */}
          <div
            className="flex flex-col justify-between pr-2 text-[10px] text-[#71717a] font-mono select-none"
            style={{ height: `${matrixHeight}px`, marginTop: '20px' }}
          >
            {DAY_LABELS.map((dayLabel, idx) => (
              <span
                key={dayLabel}
                className={`h-[11px] leading-[11px] flex items-center ${
                  idx % 2 === 1 ? 'opacity-90 text-[#8e8e93]' : 'opacity-40'
                }`}
              >
                {idx % 2 === 1 ? dayLabel : ''}
              </span>
            ))}
          </div>

          {/* SVG Heatmap Grid */}
          <div className="relative">
            {/* Month Labels across the top */}
            <div
              className="relative text-[10px] font-medium text-[#8e8e93] h-5 mb-1"
              style={{ width: `${matrixWidth}px` }}
            >
              {monthMarkers.map((marker, idx) => {
                const leftPos = marker.colIndex * (CELL_SIZE + CELL_GAP);
                return (
                  <span
                    key={`${marker.label}-${idx}`}
                    className="absolute top-0 transform select-none"
                    style={{ left: `${leftPos}px` }}
                  >
                    {marker.label}
                  </span>
                );
              })}
            </div>

            {/* Matrix SVG */}
            <svg
              width={matrixWidth}
              height={matrixHeight}
              className="overflow-visible"
              role="img"
              aria-label={`Yearly contribution chart for ${habit.title}`}
            >
              {weeks.map((week, colIdx) => {
                const x = colIdx * (CELL_SIZE + CELL_GAP);
                return (
                  <g key={`week-${week.weekIndex}`}>
                    {week.days.map((day, rowIdx) => {
                      if (!day) return null;
                      const y = rowIdx * (CELL_SIZE + CELL_GAP);
                      const isCompleted = completedSet.has(day.dateKey);

                      let fillColor = UNFILLED_COLOR;
                      if (isCompleted) {
                        fillColor = theme.bgFill;
                      }

                      return (
                        <rect
                          key={day.dateKey}
                          x={x}
                          y={y}
                          width={CELL_SIZE}
                          height={CELL_SIZE}
                          rx={2}
                          ry={2}
                          fill={fillColor}
                          stroke={day.isToday ? '#ffffff' : isCompleted ? theme.border : 'transparent'}
                          strokeWidth={day.isToday ? 1.5 : isCompleted ? 0.75 : 0}
                          className={`cursor-pointer transition-colors duration-150 ${
                            day.isFuture
                              ? 'opacity-30 cursor-not-allowed'
                              : 'hover:brightness-125 hover:stroke-white/80'
                          }`}
                          onClick={() => {
                            if (!day.isFuture) {
                              onToggleDate(habit.id, day.dateKey);
                            }
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              day,
                              isCompleted,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
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
                backgroundColor: hoveredCell.isCompleted ? theme.accent : '#52525b',
              }}
            />
            <span>{formatFriendlyDate(hoveredCell.day.dateKey)}</span>
          </div>
          <p className="text-[10px] text-[#a1a1aa] mt-0.5">
            {hoveredCell.day.isFuture
              ? 'Future date'
              : hoveredCell.isCompleted
              ? 'Completed • Click to uncheck'
              : 'Not completed • Click to check'}
          </p>
        </div>
      )}

      {/* Card Footer: Legend "Less" to "More" on the bottom right */}
      <div className="mt-3 pt-2 border-t border-[#202028] flex items-center justify-between text-xs text-[#8e8e93]">
        <span className="text-[11px] text-[#6b6b76] hidden sm:inline">
          Tip: Click any square to toggle check-in
        </span>
        <div className="flex items-center gap-1.5 ml-auto text-[11px]">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-[2px] border border-[#2e2e3a]"
              style={{ backgroundColor: UNFILLED_COLOR }}
              title="No activity"
            />
            {theme.levels.map((lvlColor, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: lvlColor }}
                title={`Activity Level ${idx + 1}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
