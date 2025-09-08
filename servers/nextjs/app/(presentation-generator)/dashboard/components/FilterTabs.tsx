import React from "react";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "recent" | "created" | "favorites";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  presentationCounts: Record<FilterType, number>;
  className?: string;
}

const filterConfig: Record<FilterType, { label: string; icon?: React.ReactNode }> = {
  all: { label: "All" },
  recent: { label: "Recently viewed" },
  created: { label: "Created by you" },
  favorites: { label: "Favorites" }
};

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  presentationCounts,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Object.entries(filterConfig).map(([key, config]) => {
        const filterKey = key as FilterType;
        const count = presentationCounts[filterKey] || 0;
        const isActive = activeFilter === filterKey;
        
        return (
          <button
            key={filterKey}
            onClick={() => onFilterChange(filterKey)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
              "hover:bg-gray-100 active:scale-[0.98]",
              isActive
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {config.icon}
            <span>{config.label}</span>
            {count > 0 && (
              <span 
                className={cn(
                  "ml-1 px-2 py-0.5 text-xs rounded-full font-medium",
                  isActive
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
