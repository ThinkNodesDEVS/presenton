"use client";

import React from "react";
import { DotsVerticalIcon, TrashIcon } from "@radix-ui/react-icons";
import { Heart, Lock, Play, FileText, Calendar } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EnhancedPresentation } from "../types";
import { formatTimeAgo } from "../utils/dummyData";
import { cn } from '@/lib/utils';

interface PresentationListViewProps {
  presentations: EnhancedPresentation[];
  onDeleted?: (presentationId: string) => void;
  onToggleFavorite?: (presentationId: string) => void;
}

interface PresentationListItemProps {
  presentation: EnhancedPresentation;
  onDeleted?: (presentationId: string) => void;
  onToggleFavorite?: (presentationId: string) => void;
}

const PresentationListItem: React.FC<PresentationListItemProps> = ({
  presentation,
  onDeleted,
  onToggleFavorite
}) => {
  const router = useRouter();

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/presentation?id=${presentation.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toast.success("Presentation deleted", {
      description: "The presentation has been deleted successfully",
    });
    
    if (onDeleted) {
      onDeleted(presentation.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggleFavorite) {
      onToggleFavorite(presentation.id);
      toast.success(
        presentation.is_favorite ? "Removed from favorites" : "Added to favorites"
      );
    }
  };

  return (
    <div 
      onClick={handlePreview}
      className="group flex items-center gap-4 p-4 bg-white rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-light-gray/10 border border-light-gray/50"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        <div className={cn(
          "w-16 h-12 rounded-lg flex items-center justify-center relative overflow-hidden",
          presentation.thumbnail
        )}>
          {presentation.type === 'video' ? (
            <div className="relative">
              <Play className="w-6 h-6 text-white opacity-80" />
              {presentation.duration && (
                <span className="absolute -bottom-1 -right-1 text-xs bg-black/50 text-white px-1 rounded">
                  {presentation.duration}
                </span>
              )}
            </div>
          ) : (
            <FileText className="w-6 h-6 text-white opacity-80" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-deep-navy line-clamp-2 text-sm mb-1">
              {presentation.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-medium-gray mb-1">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span className="capitalize">{presentation.privacy}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-deep-navy text-white rounded-full flex items-center justify-center text-xs font-medium">
                  U
                </div>
                <span>Created by you</span>
              </div>
              {presentation.n_slides && (
                <span>{presentation.n_slides} slides</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-medium-gray">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Last viewed {formatTimeAgo(presentation.last_viewed)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                presentation.is_favorite
                  ? "text-electric-orange hover:text-electric-orange/80"
                  : "text-medium-gray hover:text-electric-orange hover:bg-electric-orange/10"
              )}
              aria-label={presentation.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "w-4 h-4", 
                  presentation.is_favorite && "fill-current"
                )} 
              />
            </button>
            
            {/* More actions */}
            <Popover>
              <PopoverTrigger 
                className="p-2 rounded-full text-medium-gray hover:text-deep-navy hover:bg-light-gray/50 transition-colors" 
                onClick={(e) => e.stopPropagation()}
              >
                <DotsVerticalIcon className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent align="end" className="bg-white w-[200px] shadow-lg border">
                <button
                  className="flex items-center justify-between w-full px-3 py-2 hover:bg-light-gray/50 rounded-md text-sm transition-colors"
                  onClick={handleDelete}
                >
                  <span>Delete</span>
                  <TrashIcon className="w-4 h-4 text-error-red" />
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PresentationListView: React.FC<PresentationListViewProps> = ({
  presentations,
  onDeleted,
  onToggleFavorite
}) => {
  if (presentations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="w-12 h-12 text-medium-gray mb-4" />
        <h3 className="text-lg font-medium text-deep-navy mb-2">No presentations found</h3>
        <p className="text-medium-gray text-center max-w-md">
          You haven't created any presentations yet. Start by creating your first presentation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {presentations.map((presentation) => (
        <PresentationListItem
          key={presentation.id}
          presentation={presentation}
          onDeleted={onDeleted}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
