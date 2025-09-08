"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { DotsVerticalIcon, TrashIcon, StarIcon } from "@radix-ui/react-icons";
import { Heart, Lock, Play, FileText } from "lucide-react";
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

interface EnhancedPresentationCardProps {
  presentation: EnhancedPresentation;
  onDeleted?: (presentationId: string) => void;
  onToggleFavorite?: (presentationId: string) => void;
}

export const EnhancedPresentationCard: React.FC<EnhancedPresentationCardProps> = ({
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

    // Simulate API call
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
    <Card
      onClick={handlePreview}
      className="group bg-white rounded-lg cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="space-y-4 p-4">
        {/* Header with date and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-medium-gray">
              <Lock className="w-3 h-3" />
              <span>{presentation.privacy}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
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
                className="p-1.5 rounded-full text-medium-gray hover:text-deep-navy hover:bg-light-gray/50 transition-colors" 
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

        {/* Thumbnail */}
        <div className="relative overflow-hidden rounded-lg aspect-video bg-gradient-to-br from-light-gray to-medium-gray/20">
          {/* Placeholder thumbnail with gradient background */}
          <div className={cn("absolute inset-0 flex items-center justify-center", presentation.thumbnail)}>
            <div className="text-center text-white">
              {presentation.type === 'video' ? (
                <Play className="w-12 h-12 mx-auto mb-2 opacity-80" />
              ) : (
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-80" />
              )}
              <p className="text-sm font-medium opacity-90">{presentation.title}</p>
              {presentation.n_slides && (
                <p className="text-xs opacity-70">{presentation.n_slides} slides</p>
              )}
              {presentation.duration && (
                <p className="text-xs opacity-70">{presentation.duration}</p>
              )}
            </div>
          </div>
          
          {/* Play button overlay for videos */}
          {presentation.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-white/90 rounded-full p-3">
                <Play className="w-6 h-6 text-deep-navy" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-2">
          <h3 className="font-medium text-deep-navy line-clamp-2 text-sm leading-tight">
            {presentation.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-medium-gray">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-deep-navy text-white rounded-full flex items-center justify-center text-xs font-medium">
                U
              </div>
              <span>Created by you</span>
            </div>
          </div>
          <p className="text-xs text-medium-gray">
            Last viewed {formatTimeAgo(presentation.last_viewed)}
          </p>
        </div>
      </div>
    </Card>
  );
};
