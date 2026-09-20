'use client';

import React from 'react';

interface GlobalFooterProps {
  onOpenAddModal: () => void;
  onToggleFullView: () => void;
  onToggleHelp: () => void;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  onOpenAddModal,
  onToggleFullView,
  onToggleHelp,
}) => {
  return (
    <footer
      id="global-footer-shortcuts"
      className="fixed bottom-4 right-4 z-20 pointer-events-auto"
    >
      <div className="flex items-center gap-2 bg-[#121216]/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#262633] shadow-2xl text-[11px] text-[#8e8e93]">
        {/* N New habit */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Press N to create a habit"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-[#1e1e26] text-white border border-[#333342] font-mono font-semibold text-[10px]">
            N
          </kbd>
          <span className="hidden sm:inline">New</span>
        </button>

        <span className="text-[#3a3a46]">|</span>

        {/* 1 - 5 Toggle */}
        <div className="flex items-center gap-1" title="Press numbers 1 through 5 to toggle today">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1e1e26] text-white border border-[#333342] font-mono font-semibold text-[10px]">
            1–5
          </kbd>
          <span className="hidden sm:inline">Toggle</span>
        </div>

        <span className="text-[#3a3a46]">|</span>

        {/* F Full View */}
        <button
          type="button"
          onClick={onToggleFullView}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Press F to switch full view / matrix mode"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-[#1e1e26] text-white border border-[#333342] font-mono font-semibold text-[10px]">
            F
          </kbd>
          <span className="hidden sm:inline">Matrix</span>
        </button>

        <span className="text-[#3a3a46]">|</span>

        {/* ? Help */}
        <button
          type="button"
          onClick={onToggleHelp}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Toggle help banner"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-[#1e1e26] text-white border border-[#333342] font-mono font-semibold text-[10px]">
            ?
          </kbd>
          <span className="hidden sm:inline">Help</span>
        </button>
      </div>
    </footer>
  );
};
