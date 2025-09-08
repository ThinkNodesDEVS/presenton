import React from "react";
import { Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewType = "grid" | "list";

interface ViewToggleProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  activeView,
  onViewChange,
  className
}) => {
  return (
    <div className={cn("flex items-center bg-gray-100 rounded-lg p-1", className)}>
      <button
        onClick={() => onViewChange("grid")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
          "hover:bg-white hover:shadow-sm",
          activeView === "grid"
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-500 hover:text-gray-700"
        )}
        aria-label="Grid view"
        title="Grid view"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
          "hover:bg-white hover:shadow-sm",
          activeView === "list"
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-500 hover:text-gray-700"
        )}
        aria-label="List view"
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};
