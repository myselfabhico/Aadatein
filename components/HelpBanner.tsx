'use client';

import React from 'react';
import { Cookie, Keyboard, CheckCircle2, X } from 'lucide-react';

interface HelpBannerProps {
  onClose: () => void;
}

export const HelpBanner: React.FC<HelpBannerProps> = ({ onClose }) => {
  return (
    <div
      id="help-banner-container"
      className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-1"
    >
      <div className="relative rounded-xl border border-[#272733] bg-[#141419] p-4 text-xs text-[#a1a1aa] shadow-lg">
        <button
          id="dismiss-help-banner-button"
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[#71717a] hover:text-white p-1 rounded-md transition-colors"
          aria-label="Close help message"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#1e1e26] border border-[#2d2d38] text-white">
              <Cookie className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">Local & Cookie Stored</p>
              <p className="text-[#8e8e93] leading-relaxed">
                Zero login required. Habits and daily check-ins persist securely in your browser cookies and local storage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#1e1e26] border border-[#2d2d38] text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">Interactive Contribution Grid</p>
              <p className="text-[#8e8e93] leading-relaxed">
                Click today&apos;s circular status button or click any square in the yearly heatmap matrix to toggle check-ins.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#1e1e26] border border-[#2d2d38] text-white">
              <Keyboard className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">Speed Shortcuts</p>
              <p className="text-[#8e8e93] leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#202028] text-white border border-[#333342] font-mono text-[10px]">N</kbd> for new habit, <kbd className="px-1.5 py-0.5 rounded bg-[#202028] text-white border border-[#333342] font-mono text-[10px]">1-5</kbd> to toggle, <kbd className="px-1.5 py-0.5 rounded bg-[#202028] text-white border border-[#333342] font-mono text-[10px]">F</kbd> for Full View.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
