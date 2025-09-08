"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import OutlineContent from "./OutlineContent";
import LayoutSelection from "./LayoutSelection";
import EmptyStateView from "./EmptyStateView";
import GenerateButton from "./GenerateButton";

import { TABS, LayoutGroup } from "../types/index";
import { useOutlineStreaming } from "../hooks/useOutlineStreaming";
import { useOutlineManagement } from "../hooks/useOutlineManagement";
import { usePresentationGeneration } from "../hooks/usePresentationGeneration";

const OutlinePage: React.FC = () => {
  const { presentation_id, outlines } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  const [activeTab, setActiveTab] = useState<string>(TABS.OUTLINE);
  const [selectedLayoutGroup, setSelectedLayoutGroup] = useState<LayoutGroup | null>(null);
  // Custom hooks
  const streamState = useOutlineStreaming(presentation_id);
  const { handleDragEnd, handleAddSlide } = useOutlineManagement(outlines);
  const { loadingState, handleSubmit } = usePresentationGeneration(
    presentation_id,
    outlines,
    selectedLayoutGroup,
    setActiveTab
  );
  if (!presentation_id) {
    return <EmptyStateView />;
  }


  return (
    <div className="min-h-[calc(100vh-72px)] h-full">
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
      />

      <Wrapper className="h-full flex flex-col w-full">
        <div className="flex-grow overflow-y-hidden w-full max-w-[1200px] px-4 sm:px-6 mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full sm:w-[80%] md:w-[60%] lg:w-[50%] mx-auto my-2 sm:my-4 grid-cols-2">
              <TabsTrigger value={TABS.OUTLINE} className="text-sm sm:text-base">Outline & Content</TabsTrigger>
              <TabsTrigger value={TABS.LAYOUTS} className="text-sm sm:text-base">Select Template</TabsTrigger>
            </TabsList>

            <div className="flex-grow w-full overflow-y-auto custom_scrollbar">
              <TabsContent value={TABS.OUTLINE} className="px-0 sm:px-2">
                <div>
                  <OutlineContent
                    outlines={outlines}
                    isLoading={streamState.isLoading}
                    isStreaming={streamState.isStreaming}
                    activeSlideIndex={streamState.activeSlideIndex}
                    highestActiveIndex={streamState.highestActiveIndex}
                    onDragEnd={handleDragEnd}
                    onAddSlide={handleAddSlide}
                  />
                </div>
              </TabsContent>

              <TabsContent value={TABS.LAYOUTS}>
                <div className="px-0 sm:px-2">
                  <LayoutSelection
                    selectedLayoutGroup={selectedLayoutGroup}
                    onSelectLayoutGroup={setSelectedLayoutGroup}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Fixed Button */}
        <div className="py-3 sm:py-4 border-t border-gray-200">
          <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
            <GenerateButton
              loadingState={loadingState}
              streamState={streamState}
              selectedLayoutGroup={selectedLayoutGroup}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default OutlinePage;