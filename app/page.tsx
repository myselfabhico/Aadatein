'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Habit, HabitColor, ActiveTab } from '@/types/habit';
import { saveHabits, subscribeHabits, getHabitsSnapshot, getServerHabitsSnapshot } from '@/lib/storage';
import { getTodayKey } from '@/lib/date-utils';
import { Header } from '@/components/Header';
import { HabitCard } from '@/components/HabitCard';
import { MatrixView } from '@/components/MatrixView';
import { StatisticsView } from '@/components/StatisticsView';
import { ManageView } from '@/components/ManageView';
import { AddEditModal } from '@/components/AddEditModal';
import { ExportModal } from '@/components/ExportModal';
import { ImportModal } from '@/components/ImportModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { LayoutGrid, Grid3X3, Plus } from 'lucide-react';

export default function AadateinApp() {
  const habits = useSyncExternalStore(subscribeHabits, getHabitsSnapshot, getServerHabitsSnapshot);
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [fullView, setFullView] = useState(false);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Save changes to cookies whenever habits change
  const updateHabits = useCallback((newHabits: Habit[]) => {
    saveHabits(newHabits);
  }, []);

  // Toggle today's status for a habit
  const handleToggleToday = useCallback(
    (habitId: string) => {
      const todayKey = getTodayKey();
      const next = habits.map((h) => {
        if (h.id !== habitId) return h;
        const completedSet = new Set(h.completedDates);
        if (completedSet.has(todayKey)) {
          completedSet.delete(todayKey);
          showToast(`Unchecked "${h.title}" for today`);
        } else {
          completedSet.add(todayKey);
          showToast(`Completed "${h.title}" for today! 🔥`);
        }
        return {
          ...h,
          completedDates: Array.from(completedSet).sort(),
        };
      });
      saveHabits(next);
    },
    [habits]
  );

  // Toggle specific date for a habit (e.g. from the Heatmap cell or Matrix square)
  const handleToggleDate = useCallback(
    (habitId: string, dateKey: string) => {
      const next = habits.map((h) => {
        if (h.id !== habitId) return h;
        const completedSet = new Set(h.completedDates);
        if (completedSet.has(dateKey)) {
          completedSet.delete(dateKey);
        } else {
          completedSet.add(dateKey);
        }
        return {
          ...h,
          completedDates: Array.from(completedSet).sort(),
        };
      });
      saveHabits(next);
    },
    [habits]
  );

  // Save (Create or Edit) a habit
  const handleSaveHabit = (data: {
    id?: string;
    title: string;
    emoji: string;
    category: string;
    targetDaysPerWeek: number;
    color: HabitColor;
  }) => {
    if (data.id) {
      // Edit existing
      const updated = habits.map((h) => {
        if (h.id === data.id) {
          return {
            ...h,
            title: data.title,
            emoji: data.emoji,
            category: data.category,
            targetDaysPerWeek: data.targetDaysPerWeek,
            color: data.color,
          };
        }
        return h;
      });
      updateHabits(updated);
      showToast(`Updated "${data.title}"`);
    } else {
      // Create new
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        title: data.title,
        emoji: data.emoji,
        category: data.category,
        targetDaysPerWeek: data.targetDaysPerWeek,
        color: data.color,
        completedDates: [],
        createdAt: new Date().toISOString(),
        order: habits.length + 1,
      };
      updateHabits([...habits, newHabit]);
      showToast(`Added habit "${data.title}"`);
    }
  };

  // Delete habit trigger (opens in-app confirmation modal, avoiding iframe window.confirm blocks)
  const handleDeleteHabit = (habitId: string) => {
    const habitToDelete = habits.find((h) => h.id === habitId);
    if (habitToDelete) {
      setDeletingHabit(habitToDelete);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingHabit) return;
    const habitId = deletingHabit.id;
    const habitTitle = deletingHabit.title;
    const filtered = habits.filter((h) => h.id !== habitId);
    updateHabits(filtered);
    setDeletingHabit(null);
    showToast(`Deleted habit "${habitTitle}"`);
  };

  // Reorder habit up/down
  const handleMoveHabit = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= habits.length) return;

    const newHabits = [...habits];
    const temp = newHabits[index];
    newHabits[index] = newHabits[targetIndex];
    newHabits[targetIndex] = temp;

    // update orders
    newHabits.forEach((h, idx) => {
      h.order = idx + 1;
    });

    updateHabits(newHabits);
  };

  // Import habits
  const handleImport = (importedHabits: Habit[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      updateHabits(importedHabits);
      showToast(`Replaced with ${importedHabits.length} imported habits`);
    } else {
      const existingIds = new Set(habits.map((h) => h.id));
      const newItems = importedHabits.filter((h) => !existingIds.has(h.id));
      const combined = [...habits, ...newItems];
      updateHabits(combined);
      showToast(`Merged ${newItems.length} new habits`);
    }
  };

  // Open modal for editing
  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddEditOpen(true);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingHabit(null);
    setIsAddEditOpen(true);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        if (e.key === 'Escape') {
          setIsAddEditOpen(false);
          setIsExportOpen(false);
          setIsImportOpen(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        setIsAddEditOpen(false);
        setIsExportOpen(false);
        setIsImportOpen(false);
        setDeletingHabit(null);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenAdd();
      } else if (e.key === 'f' || e.key === 'F') {
        if (activeTab === 'calendar') {
          e.preventDefault();
          setFullView((prev) => !prev);
        }
      } else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (habits[index]) {
          e.preventDefault();
          handleToggleToday(habits[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [habits, activeTab, handleToggleToday]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#f4f4f5] antialiased flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Persistent Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenImportModal={() => setIsImportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 rounded-full bg-[#1e1e26] border border-[#353545] text-xs font-semibold text-white shadow-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Calendar View */}
        {activeTab === 'calendar' && (
          <section id="calendar-view-section" className="space-y-4">
            {/* Header Controls: Sub-header with "Full View" toggle switch */}
            <div className="flex items-center justify-between gap-4 pb-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Habits</span>
                  <span className="text-xs font-normal text-[#8e8e93] px-2.5 py-0.5 rounded-full bg-[#18181f] border border-[#252530]">
                    {habits.length} tracked
                  </span>
                </h1>
                <p className="text-xs text-[#8e8e93] mt-0.5">
                  {fullView
                    ? 'Matrix mode: High-density 30-day activity comparison'
                    : 'Yearly view: 52-week GitHub-style contribution heatmaps'}
                </p>
              </div>

              {/* "Compact View" Toggle Switch */}
              <div className="flex items-center gap-2 bg-[#16161c] px-3 py-1.5 rounded-full border border-[#262630]">
                <span className="text-xs font-medium text-[#d4d4d8] select-none flex items-center gap-1.5">
                  {fullView ? (
                    <LayoutGrid className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Grid3X3 className="w-3.5 h-3.5 text-[#8e8e93]" />
                  )}
                  Compact View
                </span>
                <button
                  id="full-view-toggle-switch"
                  type="button"
                  role="switch"
                  aria-checked={fullView}
                  onClick={() => setFullView((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    fullView ? 'bg-white' : 'bg-[#292936]'
                  }`}
                  title="Toggle Compact View (Shortcut: F)"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0d0d0f] shadow-lg ring-0 transition duration-200 ease-in-out ${
                      fullView ? 'translate-x-4 bg-black' : 'translate-x-0 bg-[#8e8e93]'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Content Rendering: Matrix Mode vs Yearly Cards */}
            {habits.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-[#262633] bg-[#141419]">
                <p className="text-sm text-[#8e8e93] mb-3">No habits tracked yet.</p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Your First Habit</span>
                </button>
              </div>
            ) : fullView ? (
              /* View 2: Full View / Matrix Mode */
              <MatrixView
                habits={habits}
                onToggleDate={handleToggleDate}
                onEditHabit={handleOpenEdit}
              />
            ) : (
              /* View 1: Distinct Habit Card Modules with Full Yearly Heatmap */
              <div className="space-y-4">
                {habits.map((habit, index) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    habitIndex={index}
                    onToggleToday={handleToggleToday}
                    onToggleDate={handleToggleDate}
                    onEditHabit={handleOpenEdit}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Statistics View */}
        {activeTab === 'statistics' && (
          <section id="statistics-view-section">
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Performance Analytics
              </h1>
              <p className="text-xs text-[#8e8e93] mt-0.5">
                Detailed streaks, 30-day rates, and 12-week consistency grids.
              </p>
            </div>

            <StatisticsView
              habits={habits}
              onToggleDate={handleToggleDate}
              onEditHabit={handleOpenEdit}
            />
          </section>
        )}

        {/* Tab 3: Manage View */}
        {activeTab === 'manage' && (
          <section id="manage-view-section">
            <ManageView
              habits={habits}
              onEditHabit={handleOpenEdit}
              onDeleteHabit={handleDeleteHabit}
              onMoveHabit={handleMoveHabit}
              onOpenAddModal={handleOpenAdd}
            />
          </section>
        )}
      </main>

      {/* Modals */}
      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        habits={habits}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />

      <DeleteConfirmModal
        isOpen={!!deletingHabit}
        habitTitle={deletingHabit?.title || ''}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
