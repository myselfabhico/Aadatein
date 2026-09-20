'use client';

import React, { useState } from 'react';
import { Habit } from '@/types/habit';
import { getTodayKey } from '@/lib/date-utils';
import { X, Copy, Check, Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, habits }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportData = {
    version: 1,
    app: 'Aadatein',
    exportedAt: new Date().toISOString(),
    habitsCount: habits.length,
    habits,
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aadatein-habits-${getTodayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[#272733] bg-[#16161c] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#262633]">
          <div>
            <h2 className="text-lg font-bold text-white">Export Habit Data</h2>
            <p className="text-xs text-[#8e8e93] mt-0.5">
              Backup your local habits and contribution history
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

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5 text-xs text-[#8e8e93]">
            <span>JSON Payload ({habits.length} habits)</span>
            <span className="text-[11px] text-[#52525c]">Stored locally via cookies</span>
          </div>

          <pre className="w-full h-48 p-3 rounded-lg bg-[#0f0f13] border border-[#262633] text-[11px] font-mono text-[#a1a1aa] overflow-auto select-all scrollbar-thin scrollbar-thumb-[#252530]">
            {jsonString}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[#262633]">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-[#333342] bg-[#202028] text-white hover:bg-[#282834] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8e8e93]" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-[#e4e4e7] transition-all cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
