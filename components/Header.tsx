'use client';

import React from 'react';
import Image from 'next/image';
import { ActiveTab } from '@/types/habit';
import { Download, Upload, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenExportModal,
  onOpenImportModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#1f1f26] px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {/* Left: App Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 flex items-center px-2 py-0.5 rounded-lg bg-black border border-[#272733] shadow-xs overflow-hidden">
            <Image
              src="/images/aadatein-logo.jpg"
              alt="Aadatein Logo"
              width={120}
              height={28}
              className="h-7 w-auto object-contain brightness-110 contrast-125"
              referrerPolicy="no-referrer"
              priority
            />
          </div>
        </div>

        {/* Center: Segmented navigation control with 3 pill tabs */}
        <div
          id="segmented-tab-control"
          className="order-3 sm:order-2 w-full sm:w-auto flex justify-center mt-2 sm:mt-0"
        >
          <div className="inline-flex items-center p-1 rounded-full bg-[#16161c] border border-[#262630] shadow-inner">
            <button
              id="tab-calendar"
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Calendar
            </button>
            <button
              id="tab-statistics"
              type="button"
              onClick={() => setActiveTab('statistics')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'statistics'
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Statistics
            </button>
            <button
              id="tab-manage"
              type="button"
              onClick={() => setActiveTab('manage')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Manage
            </button>
          </div>
        </div>

        {/* Right: Export, Import dark pills, and + Add primary high-contrast button */}
        <div className="order-2 sm:order-3 flex items-center gap-2">
          <button
            id="export-habits-button"
            type="button"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#2d2d38] bg-[#16161c] text-[#d4d4d8] hover:text-white hover:bg-[#202028] hover:border-[#3d3d4a] transition-all cursor-pointer"
            title="Export habit data to JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#8e8e93]" />
            <span>Export</span>
          </button>

          <button
            id="import-habits-button"
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#2d2d38] bg-[#16161c] text-[#d4d4d8] hover:text-white hover:bg-[#202028] hover:border-[#3d3d4a] transition-all cursor-pointer"
            title="Import habit data from JSON"
          >
            <Upload className="w-3.5 h-3.5 text-[#8e8e93]" />
            <span>Import</span>
          </button>

          <button
            id="add-habit-button"
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-black hover:bg-[#f0f0f5] active:scale-95 transition-all cursor-pointer shadow-md shadow-white/5"
            title="Create new habit (Press N)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
