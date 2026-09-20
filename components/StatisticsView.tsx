'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Habit } from '@/types/habit';
import { COLOR_THEMES, UNFILLED_COLOR } from '@/lib/color-themes';
import {
  computeHabitStats,
  buildTwelveWeekStrip,
  getTodayKey,
  DateRangeType,
  computeHabitRangeStats,
  getDateRangeDays,
} from '@/lib/date-utils';
import { toPng } from 'html-to-image';
import { Download, Loader2, Calendar, ChevronDown, Check } from 'lucide-react';

interface StatisticsViewProps {
  habits: Habit[];
  onToggleDate: (habitId: string, dateKey: string) => void;
  onEditHabit: (habit: Habit) => void;
}

const DATE_RANGE_OPTIONS: { id: DateRangeType; label: string; shortLabel: string }[] = [
  { id: '30d', label: 'Last 30 Days', shortLabel: '30 Days' },
  { id: '90d', label: 'Last 90 Days', shortLabel: '90 Days' },
  { id: 'ytd', label: 'Year-to-Date', shortLabel: 'YTD' },
];

export const StatisticsView: React.FC<StatisticsViewProps> = ({ habits, onToggleDate, onEditHabit }) => {
  const twelveWeeks = useMemo(() => buildTwelveWeekStrip(), []);
  const reportRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<DateRangeType>('30d');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const rangeInfo = useMemo(() => getDateRangeDays(selectedRange), [selectedRange]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Overall aggregate stats with date range filtering
  const overallStats = useMemo(() => {
    let totalCompletionsInPeriod = 0;
    let allTimeCompletions = 0;
    let maxBestStreak = 0;
    let completedTodayCount = 0;

    habits.forEach((h) => {
      const s = computeHabitStats(h.completedDates);
      const rangeStats = computeHabitRangeStats(h.completedDates, selectedRange);

      totalCompletionsInPeriod += rangeStats.periodCompletions;
      allTimeCompletions += s.totalCompletions;
      if (s.longestStreak > maxBestStreak) maxBestStreak = s.longestStreak;
      if (s.isCompletedToday) completedTodayCount++;
    });

    const completionRateToday = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;
    const possibleOpportunities = habits.length * rangeInfo.days;
    const overallPeriodRate = possibleOpportunities > 0
      ? Math.round((totalCompletionsInPeriod / possibleOpportunities) * 100)
      : 0;

    return {
      totalHabits: habits.length,
      totalCompletionsInPeriod,
      allTimeCompletions,
      maxBestStreak,
      completedTodayCount,
      completionRateToday,
      overallPeriodRate,
    };
  }, [habits, selectedRange, rangeInfo.days]);

  const handleExportReport = async () => {
    if (!reportRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setExportError(null);

      // Render image with html-to-image
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High DPI for crystal clear presentation quality
        backgroundColor: '#0d0d12',
      });

      // Trigger browser download
      const link = document.createElement('a');
      const dateStr = getTodayKey();
      link.download = `aadatein-performance-report-${selectedRange}-${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export statistics report as image:', err);
      setExportError('Unable to generate image. Please try again.');
      setTimeout(() => setExportError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="statistics-view-container" className="space-y-6">
      {/* Action & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Performance Analytics</span>
            <span className="text-xs font-normal text-[#8e8e93] px-2 py-0.5 rounded-full bg-[#1e1e26] border border-[#2d2d38]">
              {habits.length} Habits Tracked
            </span>
          </h2>
          <p className="text-xs text-[#8e8e93] mt-0.5">
            Tracking completion consistency and streaks across {rangeInfo.label.toLowerCase()} ({rangeInfo.days} days).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Dropdown */}
          <div ref={dropdownRef} id="statistics-range-dropdown-container" className="relative">
            <button
              id="statistics-range-dropdown-button"
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141418] border border-[#2d2d38] hover:border-[#404050] text-white text-xs font-semibold shadow-inner transition-all cursor-pointer select-none"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              title="Filter statistics by date range"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8e8e93]" />
              <span>{rangeInfo.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8e8e93] transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="statistics-range-dropdown-menu"
                className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-48 rounded-xl bg-[#18181f] border border-[#2e2e3a] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                role="listbox"
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                  Select Period
                </div>
                {DATE_RANGE_OPTIONS.map((opt) => {
                  const isSelected = selectedRange === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`range-option-${opt.id}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedRange(opt.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black font-semibold'
                          : 'text-[#d4d4d8] hover:bg-[#23232c] hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <div className="flex items-center gap-2">
            {exportError && (
              <span className="text-xs text-red-400 animate-fade-in">{exportError}</span>
            )}
            <button
              id="export-report-button"
              type="button"
              onClick={handleExportReport}
              disabled={isExporting || habits.length === 0}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer ${
                isExporting
                  ? 'bg-[#282834] text-[#a0a0b0] cursor-wait'
                  : 'bg-white text-black hover:bg-neutral-200 active:scale-95'
              }`}
              title="Download high-resolution image of your performance statistics"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Image...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Export Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Target element captured for image download */}
      <div ref={reportRef} id="statistics-report-card" className="p-3 sm:p-5 rounded-2xl bg-[#0d0d12] space-y-6">
        {/* Brand watermark included in the exported report */}
        <div className="flex items-center justify-between border-b border-[#23232c] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#22222b] text-base">
              📊
            </span>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">Aadatein</span>
              <span className="text-[11px] text-[#8e8e93] ml-2">Performance Snapshot • {rangeInfo.label}</span>
            </div>
          </div>
          <span className="text-xs text-[#71717a] font-mono">
            {getTodayKey()}
          </span>
        </div>

        {/* Top Aggregate Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 text-center">
            <span className="text-[11px] font-semibold tracking-wider text-[#8e8e93] uppercase">
              Active Habits
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {overallStats.totalHabits}
            </p>
          </div>

          <div className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 text-center">
            <span className="text-[11px] font-semibold tracking-wider text-[#8e8e93] uppercase">
              Today&apos;s Progress
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
              {overallStats.completedTodayCount}/{overallStats.totalHabits}
              <span className="text-xs text-[#8e8e93] font-normal ml-1">
                ({overallStats.completionRateToday}%)
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 text-center">
            <span className="text-[11px] font-semibold tracking-wider text-[#8e8e93] uppercase">
              {selectedRange === '30d' ? '30-Day Rate' : selectedRange === '90d' ? '90-Day Rate' : 'YTD Rate'}
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400 mt-1">
              {overallStats.overallPeriodRate}%
              <span className="text-xs text-[#8e8e93] font-normal ml-1">
                avg
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-4 text-center">
            <span className="text-[11px] font-semibold tracking-wider text-[#8e8e93] uppercase">
              Period Check-ins
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
              {overallStats.totalCompletionsInPeriod}
              <span className="text-xs text-[#8e8e93] font-normal ml-1">
                /{overallStats.allTimeCompletions} total
              </span>
            </p>
          </div>
        </div>

        {/* Individual Habit Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {habits.map((habit) => {
            const theme = COLOR_THEMES[habit.color] || COLOR_THEMES.blue;
            const stats = computeHabitStats(habit.completedDates);
            const rangeStats = computeHabitRangeStats(habit.completedDates, selectedRange);
            const completedSet = new Set(habit.completedDates);

            return (
              <div
                key={habit.id}
                id={`stat-card-${habit.id}`}
                className="rounded-xl border border-[#23232c] bg-[#1a1a1f] p-5 shadow-lg shadow-black/20 flex flex-col justify-between hover:border-[#32323f] transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#252530]">
                  {/* Top Left: Habit icon and bold title */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#22222b] text-xl shrink-0"
                      role="img"
                      aria-label={habit.title}
                    >
                      {habit.emoji}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => onEditHabit(habit)}
                        className="text-base sm:text-lg font-bold text-white hover:underline text-left cursor-pointer"
                      >
                        {habit.title}
                      </button>
                      <p className="text-xs text-[#8e8e93]">
                        Target: {habit.targetDaysPerWeek} days / week
                      </p>
                    </div>
                  </div>

                  {/* Top Right: Category classification tag */}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#24242f] text-[#d4d4d8] border border-[#2e2e3a] whitespace-nowrap shrink-0">
                    {habit.category}
                  </span>
                </div>

                {/* Metric Blocks: Three large dark gray metric boxes side-by-side */}
                <div className="grid grid-cols-3 gap-3 my-5">
                  {/* 1. Current Streak */}
                  <div className="rounded-xl bg-[#141418] border border-[#272733] p-3 text-center flex flex-col justify-between">
                    <div
                      className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono"
                      style={{ color: theme.accent }}
                    >
                      {stats.currentStreak}
                    </div>
                    <span className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider mt-1.5">
                      CURRENT STREAK
                    </span>
                  </div>

                  {/* 2. Longest Streak */}
                  <div className="rounded-xl bg-[#141418] border border-[#272733] p-3 text-center flex flex-col justify-between">
                    <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                      {stats.longestStreak}
                    </div>
                    <span className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider mt-1.5">
                      LONGEST STREAK
                    </span>
                  </div>

                  {/* 3. Range-Specific Completion Rate */}
                  <div className="rounded-xl bg-[#141418] border border-[#272733] p-3 text-center flex flex-col justify-between">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                      {rangeStats.periodRate}%
                    </div>
                    {/* Visual horizontal progress fill bar */}
                    <div className="w-full bg-[#252530] h-1.5 rounded-full overflow-hidden mt-1 mb-1">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, rangeStats.periodRate))}%`,
                          backgroundColor: theme.accent,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider">
                      {selectedRange === '30d' ? '30-DAY RATE' : selectedRange === '90d' ? '90-DAY RATE' : 'YTD RATE'}
                    </span>
                  </div>
                </div>

                {/* Mini Activity Strip: 12-week horizontal block grid */}
                <div className="pt-4 border-t border-[#23232c]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-xs font-semibold text-[#8e8e93]">
                      Activity ({rangeInfo.label})
                    </span>
                    <span className="text-[11px] text-[#71717a]">
                      {rangeStats.periodCompletions} in {rangeInfo.days} days ({rangeStats.periodRate}%)
                    </span>
                  </div>

                  {/* 12 weeks horizontal grid (7 rows x 12 cols) */}
                  <div className="overflow-x-auto pb-1">
                    <div className="flex gap-1 min-w-fit">
                      {Array.from({ length: 12 }).map((_, weekIdx) => {
                        const weekDays = twelveWeeks.slice(weekIdx * 7, (weekIdx + 1) * 7);
                        return (
                          <div key={weekIdx} className="flex flex-col gap-1">
                            {weekDays.map((day) => {
                              const isCompleted = completedSet.has(day.dateKey);
                              return (
                                <button
                                  key={day.dateKey}
                                  type="button"
                                  onClick={() => onToggleDate(habit.id, day.dateKey)}
                                  className={`w-3 h-3 rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${
                                    day.isToday ? 'ring-1 ring-white' : ''
                                  }`}
                                  style={{
                                    backgroundColor: isCompleted ? theme.bgFill : UNFILLED_COLOR,
                                  }}
                                  title={`${habit.title}: ${day.dateKey} (${
                                    isCompleted ? 'Completed' : 'No activity'
                                  })`}
                                />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
