'use client';

import React, { useState } from 'react';
import { Habit } from '@/types/habit';
import { X, Upload, FileCheck, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedHabits: Habit[], mode: 'replace' | 'merge') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [mode, setMode] = useState<'merge' | 'replace'>('replace');
  const [error, setError] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleValidate = (text: string) => {
    setJsonText(text);
    setError('');
    if (!text.trim()) {
      setPreviewCount(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const habitsArray = Array.isArray(parsed) ? parsed : parsed.habits;
      if (!Array.isArray(habitsArray)) {
        throw new Error('Expected an array of habits or an object with "habits" array.');
      }
      // Check minimal schema
      const valid = habitsArray.every(
        (h) => typeof h.id === 'string' && typeof h.title === 'string' && Array.isArray(h.completedDates)
      );
      if (!valid) {
        throw new Error('Each habit must contain an id, title, and completedDates array.');
      }
      setPreviewCount(habitsArray.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON format';
      setError(msg);
      setPreviewCount(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidate(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const habitsArray: Habit[] = Array.isArray(parsed) ? parsed : parsed.habits;
      if (!Array.isArray(habitsArray) || habitsArray.length === 0) {
        setError('No valid habits found to import.');
        return;
      }
      onImport(habitsArray, mode);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import JSON';
      setError(msg);
    }
  };

  return (
    <div
      id="import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[#272733] bg-[#16161c] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#262633]">
          <div>
            <h2 className="text-lg font-bold text-white">Import Habit Data</h2>
            <p className="text-xs text-[#8e8e93] mt-0.5">
              Restore habits and contribution data from a JSON file
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8e8e93] hover:text-white rounded-lg hover:bg-[#202028] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewCount !== null && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>Detected {previewCount} valid habits ready to import!</span>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
              Upload JSON File
            </label>
            <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-[#353545] bg-[#111116] hover:bg-[#181820] hover:border-[#4d4d60] transition-colors cursor-pointer text-xs text-[#d4d4d8]">
              <Upload className="w-4 h-4 text-[#8e8e93]" />
              <span>Click to select .json file</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Direct Paste */}
          <div>
            <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
              Or Paste JSON
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => handleValidate(e.target.value)}
              placeholder="Paste exported JSON here..."
              rows={5}
              className="w-full p-3 rounded-lg bg-[#111116] border border-[#262633] text-xs font-mono text-[#d4d4d8] placeholder-[#555562] focus:outline-hidden focus:border-white"
            />
          </div>

          {/* Import mode */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-1.5">
              Import Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('replace')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                  mode === 'replace'
                    ? 'border-white bg-[#22222d] text-white'
                    : 'border-[#262633] bg-[#141419] text-[#8e8e93] hover:text-white'
                }`}
              >
                <span className="block font-semibold">Replace Existing</span>
                <span className="text-[10px] opacity-75">Overwrites your current habits list</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('merge')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                  mode === 'merge'
                    ? 'border-white bg-[#22222d] text-white'
                    : 'border-[#262633] bg-[#141419] text-[#8e8e93] hover:text-white'
                }`}
              >
                <span className="block font-semibold">Merge</span>
                <span className="text-[10px] opacity-75">Adds new habits without deleting existing</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[#262633]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={previewCount === null || previewCount === 0}
            onClick={handleExecuteImport}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-[#e4e4e7] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
};
