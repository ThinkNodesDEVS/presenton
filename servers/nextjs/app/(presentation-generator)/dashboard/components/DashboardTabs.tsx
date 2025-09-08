"use client";

import React from 'react';
import { DashboardTab } from '../types';
import { cn } from '@/lib/utils';

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  counts?: Record<DashboardTab, number>;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const tabs: { key: DashboardTab; label: string; icon?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'recent', label: 'Recently viewed' },
    { key: 'created', label: 'Created by you' },
    { key: 'favorites', label: 'Favorites' }
  ];

  return (
    <div className="flex items-center gap-1 bg-light-gray/30 rounded-lg p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out whitespace-nowrap",
            "hover:bg-white/60 hover:text-deep-navy",
            activeTab === tab.key
              ? "bg-white text-deep-navy shadow-sm"
              : "text-medium-gray hover:text-deep-navy"
          )}
        >
          <span className="relative z-10">
            {tab.label}
          </span>
          {counts && counts[tab.key] > 0 && (
            <span className={cn(
              "ml-2 inline-flex items-center justify-center h-5 w-5 text-xs rounded-full",
              activeTab === tab.key
                ? "bg-electric-orange text-white"
                : "bg-medium-gray/20 text-medium-gray"
            )}>
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
