"use client";

import React from "react";
import { EnhancedPresentationCard } from "./EnhancedPresentationCard";
import { PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { EnhancedPresentation } from "../types";
import { FileText } from "lucide-react";

interface EnhancedPresentationGridProps {
  presentations: EnhancedPresentation[];
  type: "slide" | "video";
  isLoading?: boolean;
  error?: string | null;
  onPresentationDeleted?: (presentationId: string) => void;
  onToggleFavorite?: (presentationId: string) => void;
}

export const EnhancedPresentationGrid: React.FC<EnhancedPresentationGridProps> = ({
  presentations,
  type,
  isLoading = false,
  error = null,
  onPresentationDeleted,
  onToggleFavorite,
}) => {
  const router = useRouter();
  
  const handleCreateNewPresentation = () => {
    if (type === "slide") {
      router.push("/upload");
    } else {
      router.push("/editor");
    }
  };

  const ShimmerCard = () => (
    <div className="flex flex-col gap-4 min-h-[280px] bg-white rounded-lg p-4 animate-pulse shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-light-gray rounded w-16"></div>
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-light-gray rounded-full"></div>
          <div className="h-6 w-6 bg-light-gray rounded-full"></div>
        </div>
      </div>
      <div className="w-full h-32 bg-light-gray rounded-lg"></div>
      <div className="space-y-3">
        <div className="h-4 bg-light-gray rounded w-3/4"></div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-light-gray rounded w-24"></div>
          <div className="h-3 bg-light-gray rounded w-16"></div>
        </div>
        <div className="h-3 bg-light-gray rounded w-1/2"></div>
      </div>
    </div>
  );

  const CreateNewCard = () => (
    <div
      onClick={handleCreateNewPresentation}
      className="flex flex-col gap-4 min-h-[280px] cursor-pointer group border-2 border-dashed border-light-gray hover:border-electric-orange/40 bg-white hover:bg-light-gray/10 rounded-lg items-center justify-center transition-all duration-300 p-6"
    >
      <div className="rounded-full bg-light-gray/50 group-hover:bg-electric-orange/10 p-4 transition-all duration-300">
        <PlusIcon className="w-8 h-8 text-medium-gray group-hover:text-electric-orange transition-all duration-300" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-deep-navy group-hover:text-deep-navy mb-2 text-lg">
          Create {type === "slide" ? "New" : "Video"} Deck
        </h3>
        <p className="text-sm text-medium-gray group-hover:text-deep-navy/80 px-4 leading-relaxed">
          Start from scratch and bring your ideas to life
        </p>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <FileText className="w-16 h-16 text-medium-gray mb-4" />
      <h3 className="text-xl font-semibold text-deep-navy mb-2">No presentations found</h3>
      <p className="text-medium-gray text-center max-w-md mb-6">
        You haven't created any presentations yet. Start by creating your first presentation.
      </p>
      <button
        onClick={handleCreateNewPresentation}
        className="bg-electric-orange hover:bg-electric-orange/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Create Your First Presentation
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="flex flex-col gap-4 min-h-[280px] cursor-pointer group border-2 border-dashed border-light-gray bg-white rounded-lg items-center justify-center animate-pulse p-6">
          <div className="rounded-full bg-light-gray p-4">
            <div className="w-8 h-8" />
          </div>
          <div className="text-center space-y-2">
            <div className="h-5 bg-light-gray rounded w-32 mx-auto"></div>
            <div className="h-4 bg-light-gray rounded w-48 mx-auto"></div>
          </div>
        </div>
        {[...Array(7)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateNewCard />
        <div className="col-span-full flex items-center justify-center py-8">
          <div className="text-center text-medium-gray">
            <p className="mb-4 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-electric-orange hover:text-electric-orange/80 underline font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateNewCard />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <CreateNewCard />
      {presentations.map((presentation) => (
        <EnhancedPresentationCard
          key={presentation.id}
          presentation={presentation}
          onDeleted={onPresentationDeleted}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
