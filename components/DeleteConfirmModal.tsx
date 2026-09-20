'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  habitTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  habitTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[#272733] bg-[#16161c] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8e8e93] hover:text-white rounded-lg hover:bg-[#202028] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Delete Habit</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">&quot;{habitTitle}&quot;</span>? This will permanently erase this habit and all its recorded check-in history.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#262633]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-button"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-all cursor-pointer shadow-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Habit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
