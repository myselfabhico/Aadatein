'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Habit, HabitColor } from '@/types/habit';
import { COLOR_THEMES } from '@/lib/color-themes';
import { X, Check, Search, Sparkles } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    id?: string;
    title: string;
    emoji: string;
    category: string;
    targetDaysPerWeek: number;
    color: HabitColor;
  }) => void;
  initialHabit?: Habit | null;
}

export const ALL_HABIT_EMOJIS: { emoji: string; label: string }[] = [
  // Health, Fitness & Vitality
  { emoji: '🏃', label: 'Running' },
  { emoji: '🏋️', label: 'Workout' },
  { emoji: '🚴', label: 'Cycling' },
  { emoji: '🚶', label: 'Walking' },
  { emoji: '🧘', label: 'Yoga' },
  { emoji: '🏊', label: 'Swimming' },
  { emoji: '🧗', label: 'Climbing' },
  { emoji: '💧', label: 'Hydration' },
  { emoji: '🥗', label: 'Healthy Meal' },
  { emoji: '🍎', label: 'Nutrition' },
  { emoji: '🥑', label: 'Diet' },
  { emoji: '💊', label: 'Vitamins' },
  { emoji: '🫁', label: 'Breathwork' },
  { emoji: '💤', label: 'Sleep' },
  { emoji: '🛌', label: 'Rest' },
  // Mindset, Focus & Mindfulness
  { emoji: '🧠', label: 'Brain Training' },
  { emoji: '📝', label: 'Journaling' },
  { emoji: '🕯️', label: 'Reflection' },
  { emoji: '🌿', label: 'Nature' },
  { emoji: '🍵', label: 'Tea Ritual' },
  { emoji: '📵', label: 'Digital Detox' },
  { emoji: '🎯', label: 'Focus' },
  { emoji: '⏳', label: 'Pomodoro' },
  { emoji: '🌅', label: 'Morning Routine' },
  { emoji: '🌌', label: 'Evening Routine' },
  { emoji: '✨', label: 'Gratitude' },
  // Learning, Skills & Work
  { emoji: '📚', label: 'Reading' },
  { emoji: '💻', label: 'Coding' },
  { emoji: '✍️', label: 'Writing' },
  { emoji: '🎓', label: 'Studying' },
  { emoji: '🗣️', label: 'Languages' },
  { emoji: '🔬', label: 'Research' },
  { emoji: '🎧', label: 'Audiobooks' },
  { emoji: '💡', label: 'Idea' },
  { emoji: '♟️', label: 'Chess' },
  { emoji: '📖', label: 'Literature' },
  // Arts & Creativity
  { emoji: '🎨', label: 'Art / Painting' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎸', label: 'Guitar' },
  { emoji: '🎹', label: 'Piano' },
  { emoji: '📷', label: 'Photography' },
  { emoji: '🎬', label: 'Video' },
  { emoji: '🧶', label: 'Crafts' },
  { emoji: '🪴', label: 'Plants' },
  // Productivity & Daily Routine
  { emoji: '☕', label: 'Coffee' },
  { emoji: '✅', label: 'Checklist' },
  { emoji: '🧹', label: 'Tidying' },
  { emoji: '💰', label: 'Saving' },
  { emoji: '📈', label: 'Finances' },
  { emoji: '📫', label: 'Inbox Zero' },
  { emoji: '📅', label: 'Planning' },
  { emoji: '🤝', label: 'Connection' },
  { emoji: '☀️', label: 'Early Wakeup' },
  { emoji: '⚡', label: 'Energy' },
];

const CATEGORIES = [
  'Productivity',
  'Health & Fitness',
  'Mindfulness',
  'Learning',
  'Creative',
  'Personal',
  'Lifestyle'
];

interface AddEditModalFormProps {
  initialHabit?: Habit | null;
  onClose: () => void;
  onSave: (habitData: {
    id?: string;
    title: string;
    emoji: string;
    category: string;
    targetDaysPerWeek: number;
    color: HabitColor;
  }) => void;
}

const AddEditModalForm: React.FC<AddEditModalFormProps> = ({
  initialHabit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialHabit ? initialHabit.title : '');
  const [emoji, setEmoji] = useState(initialHabit ? initialHabit.emoji : '📝');
  const [category, setCategory] = useState(initialHabit ? initialHabit.category : 'Productivity');
  const [targetDays, setTargetDays] = useState(initialHabit ? initialHabit.targetDaysPerWeek : 7);
  const [color, setColor] = useState<HabitColor>(initialHabit ? initialHabit.color : 'blue');
  const [error, setError] = useState('');
  const [emojiSearch, setEmojiSearch] = useState<string>('');

  // All emojis displayed in one unified grid, filtered by search query if present
  const displayedEmojis = useMemo(() => {
    if (!emojiSearch.trim()) {
      return ALL_HABIT_EMOJIS;
    }
    const q = emojiSearch.toLowerCase().trim();
    return ALL_HABIT_EMOJIS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.emoji.includes(q)
    );
  }, [emojiSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a habit title');
      return;
    }

    onSave({
      id: initialHabit ? initialHabit.id : undefined,
      title: title.trim(),
      emoji: emoji.trim() || '📝',
      category: category.trim() || 'General',
      targetDaysPerWeek: targetDays,
      color,
    });
    onClose();
  };

  return (
    <div className="relative w-full max-w-lg rounded-2xl border border-[#272733] bg-[#16161c] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#262633]">
        <h2 className="text-lg font-bold text-white">
          {initialHabit ? 'Edit Habit' : 'Create New Habit'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#8e8e93] hover:text-white rounded-lg hover:bg-[#202028] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Title and Active Emoji Preview */}
        <div>
          <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
            Habit Title & Emoji
          </label>
          <div className="flex gap-2.5 items-center">
            {/* Enhanced Active Emoji Display Badge */}
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className="w-12 h-11 flex items-center justify-center text-2xl rounded-xl bg-[#20202a] border-2 border-[#363645] shadow-inner text-white select-none transition-transform hover:scale-105"
                title={`Active Emoji: ${emoji}`}
              >
                {emoji}
              </div>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. TouchType for 10 minutes daily"
              className="flex-1 h-11 px-3.5 rounded-xl bg-[#202028] border border-[#2e2e3a] text-white text-sm placeholder-[#555562] focus:outline-hidden focus:border-white transition-colors"
              autoFocus
            />
          </div>

          {/* Enhanced Emoji Selector Panel - Unified in one place without categories or scrollbars */}
          <div className="mt-3 p-3 rounded-xl bg-[#121217] border border-[#242430]">
            {/* Panel Top Row: Summary & Search */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#22222d]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">Select Habit Icon</span>
                <span className="text-[11px] text-[#71717a] font-mono">
                  ({displayedEmojis.length} available)
                </span>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  placeholder="Filter icons..."
                  className="w-32 sm:w-40 pl-8 pr-2.5 py-1 text-xs rounded-lg bg-[#1c1c24] border border-[#2c2c38] text-white placeholder-[#60606d] focus:outline-hidden focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* All Emojis In One Place - Clean Grid without ugly sliders */}
            <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 gap-1.5 pt-2.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
              {displayedEmojis.length > 0 ? (
                displayedEmojis.map((em) => {
                  const isSelected = emoji === em.emoji;
                  return (
                    <button
                      key={`${em.emoji}-${em.label}`}
                      type="button"
                      onClick={() => setEmoji(em.emoji)}
                      title={`${em.emoji} - ${em.label}`}
                      className={`group relative h-9 rounded-lg flex items-center justify-center text-lg transition-all transform-gpu hover:scale-115 active:scale-95 cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#2e2e3f] ring-2 ring-white scale-105 shadow-md'
                          : 'bg-[#181820] hover:bg-[#262633]'
                      }`}
                    >
                      <span className="group-hover:animate-bounce-short">{em.emoji}</span>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center text-xs text-[#71717a]">
                  No matching icons found for &quot;{emojiSearch}&quot;
                </div>
              )}
            </div>

            {/* Custom Emoji Input & Active Status */}
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#20202a] text-[11px] text-[#71717a]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Icon: <strong className="text-white text-xs font-mono">{emoji}</strong></span>
              </span>
              <div className="flex items-center gap-1.5">
                <span>Or enter custom:</span>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="✨"
                  maxLength={4}
                  className="w-12 text-center py-1 rounded-md bg-[#1c1c24] border border-[#2e2e3c] text-white text-xs focus:outline-hidden focus:border-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category & Target Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#202028] border border-[#2e2e3a] text-white text-sm focus:outline-hidden focus:border-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1a1a22]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
              Target Frequency
            </label>
            <select
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-[#202028] border border-[#2e2e3a] text-white text-sm focus:outline-hidden focus:border-white cursor-pointer"
            >
              <option value={7} className="bg-[#1a1a22]">7 days / week (Daily)</option>
              <option value={6} className="bg-[#1a1a22]">6 days / week</option>
              <option value={5} className="bg-[#1a1a22]">5 days / week (Weekdays)</option>
              <option value={4} className="bg-[#1a1a22]">4 days / week</option>
              <option value={3} className="bg-[#1a1a22]">3 days / week</option>
              <option value={2} className="bg-[#1a1a22]">2 days / week (Weekends)</option>
              <option value={1} className="bg-[#1a1a22]">1 day / week</option>
            </select>
          </div>
        </div>

        {/* Color Theme Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
            Heatmap Theme Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(COLOR_THEMES) as HabitColor[]).map((colKey) => {
              const item = COLOR_THEMES[colKey];
              const isSelected = color === colKey;

              return (
                <button
                  key={colKey}
                  type="button"
                  onClick={() => setColor(colKey)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white bg-[#22222d]'
                      : 'border-[#262633] bg-[#1a1a22] hover:bg-[#202028]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.accent }}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                  </span>
                  <span className="text-[11px] font-medium text-white truncate">
                    {item.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262633]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-[#e4e4e7] transition-all cursor-pointer shadow-md"
          >
            {initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="add-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <AddEditModalForm
        key={initialHabit ? initialHabit.id : 'new-habit'}
        initialHabit={initialHabit}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
};
