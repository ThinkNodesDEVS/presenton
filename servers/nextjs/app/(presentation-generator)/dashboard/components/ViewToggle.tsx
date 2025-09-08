"use client";

import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { ViewMode } from '../types';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex items-center gap-1 bg-light-gray/30 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={cn(
          "p-2 rounded-md transition-all duration-200 ease-in-out",
          "hover:bg-white/60 hover:text-deep-navy",
          viewMode === 'grid'
            ? "bg-white text-deep-navy shadow-sm"
            : "text-medium-gray hover:text-deep-navy"
        )}
        aria-label="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={cn(
          "p-2 rounded-md transition-all duration-200 ease-in-out",
          "hover:bg-white/60 hover:text-deep-navy",
          viewMode === 'list'
            ? "bg-white text-deep-navy shadow-sm"
            : "text-medium-gray hover:text-deep-navy"
        )}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
};