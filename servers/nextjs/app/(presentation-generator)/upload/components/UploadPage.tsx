/**
 * UploadPage Component
 * 
 * This component handles the presentation generation upload process, allowing users to:
 * - Configure presentation settings (slides, language)
 * - Input prompts
 * - Upload supporting documents
 * 
 * @component
 */

"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearOutlines, setPresentationId } from "@/store/slices/presentationGeneration";
import { ConfigurationSelects } from "./ConfigurationSelects";
import { PromptInput } from "./PromptInput";
import { LanguageType, PresentationConfig } from "../type";
import SupportingDoc from "./SupportingDoc";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import { setPptGenUploadState } from "@/store/slices/presentationGenUpload";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { getHeader } from "../../services/api/header";
import Link from "next/link";

// Types for loading state
interface LoadingState {
  isLoading: boolean;
  message: string;
  duration?: number;
  showProgress?: boolean;
  extra_info?: string;
}

const UploadPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // State management
  const [files, setFiles] = useState<File[]>([]);
  const [config, setConfig] = useState<PresentationConfig>({
    slides: "5",
    language: LanguageType.English,
    prompt: "",
  });
  const [remainingSlides, setRemainingSlides] = useState<number | null>(null);
  const [remainingPresentations, setRemainingPresentations] = useState<number | null>(null);

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "",
    duration: 4,
    showProgress: false,
    extra_info: "",
  });

  /**
   * Updates the presentation configuration
   * @param key - Configuration key to update
   * @param value - New value for the configuration
   */
  const handleConfigChange = (key: keyof PresentationConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Validates the current configuration and files
   * @returns boolean indicating if the configuration is valid
   */
  const validateConfiguration = (): boolean => {
    if (!config.language || !config.slides) {
      toast.error("Please select number of Slides & Language");
      return false;
    }

    if (!config.prompt.trim() && files.length === 0) {
      toast.error("No Prompt or Document Provided");
      return false;
    }
    return true;
  };

  // Fetch current usage to cap slides client-side
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const headers = await getHeader();
        const base = (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")) || (typeof window !== "undefined" ? window.location.origin : "");
        const res = await fetch(`${base}/api/v1/ppt/user/usage`, { headers, cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const remaining = Math.max(0, (data?.slides_monthly_max ?? 0) - (data?.slides_used ?? 0));
        if (Number.isFinite(remaining)) {
          setRemainingSlides(remaining);
          // If current selection exceeds remaining, clamp it
          const current = parseInt(config.slides || "0", 10) || 0;
          if (remaining > 0 && current > remaining) {
            setConfig((prev) => ({ ...prev, slides: String(remaining) }));
          }
        }
        const maxPres = data?.presentations_total_max;
        const presRemaining = maxPres == null ? null : Math.max(0, (maxPres || 0) - (data?.presentations_used ?? 0));
        setRemainingPresentations(presRemaining);
      } catch (_) {
        // ignore if backend unavailable
      }
    };
    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles the presentation generation process
   */
  const handleGeneratePresentation = async () => {
    if (!validateConfiguration()) return;

    try {
      const hasUploadedAssets = files.length > 0;

      if (hasUploadedAssets) {
        await handleDocumentProcessing();
      } else {
        await handleDirectPresentationGeneration();
      }
    } catch (error) {
      handleGenerationError(error);
    }
  };

  /**
   * Handles document processing
   */
  const handleDocumentProcessing = async () => {
    setLoadingState({
      isLoading: true,
      message: "Processing documents...",
      showProgress: true,
      duration: 90,
      extra_info: files.length > 0 ? "It might take a few minutes for large documents." : "",
    });

    let documents = [];

    if (files.length > 0) {
      trackEvent(MixpanelEvent.Upload_Upload_Documents_API_Call);
      const uploadResponse = await PresentationGenerationApi.uploadDoc(files);
      documents = uploadResponse;
    }

    const promises: Promise<any>[] = [];

    if (documents.length > 0) {
      trackEvent(MixpanelEvent.Upload_Decompose_Documents_API_Call);
      promises.push(PresentationGenerationApi.decomposeDocuments(documents));
    }
    const responses = await Promise.all(promises);
    dispatch(setPptGenUploadState({
      config,
      files: responses,
    }));
    dispatch(clearOutlines())
    trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/documents-preview" });
    router.push("/documents-preview");
  };

  /**
   * Handles direct presentation generation without documents
   */
  const handleDirectPresentationGeneration = async () => {
    setLoadingState({
      isLoading: true,
      message: "Generating outlines...",
      showProgress: true,
      duration: 30,
    });

    // Use the first available layout group for direct generation
    trackEvent(MixpanelEvent.Upload_Create_Presentation_API_Call);
    const noSlidesLeft = remainingSlides != null && remainingSlides <= 0;
    const noPresentationsLeft = remainingPresentations !== null && remainingPresentations <= 0;
    if (noSlidesLeft || noPresentationsLeft) {
      setLoadingState({ isLoading: false, message: "", duration: 0, showProgress: false });
      const reason = noSlidesLeft ? "No slides left this month" : "Presentation limit reached";
      toast.error("Upgrade required", { description: `${reason}. Please upgrade to continue.` });
      return;
    }
    const requested = config?.slides ? parseInt(config.slides) : 0;
    const capped = remainingSlides != null ? Math.max(1, Math.min(requested || 1, remainingSlides)) : (requested || 1);
    const createResponse = await PresentationGenerationApi.createPresentation({
      prompt: config?.prompt ?? "",
      n_slides: capped,
      file_paths: [],
      language: config?.language ?? "",
    });

    dispatch(setPresentationId(createResponse.id));
    dispatch(clearOutlines())
    trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/outline" });
    router.push("/outline");
  };

  /**
   * Handles errors during presentation generation
   */
  const handleGenerationError = (error: any) => {
    console.error("Error in upload page", error);
    setLoadingState({
      isLoading: false,
      message: "",
      duration: 0,
      showProgress: false,
    });
    toast.error("Error", {
      description: error.message || "Error in upload page.",
    });
  };

  return (
    <Wrapper className="pb-10 lg:max-w-[70%] xl:max-w-[65%]">
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
        extra_info={loadingState.extra_info}
      />
      <div className="flex flex-col gap-4 md:items-center md:flex-row justify-between py-4">
        <p></p>
        <ConfigurationSelects
          config={config}
          onConfigChange={handleConfigChange}
          remainingSlides={remainingSlides}
        />
      </div>

      <div className="relative">
        <PromptInput
          value={config.prompt}
          onChange={(value) => handleConfigChange("prompt", value)}
          data-testid="prompt-input"
        />
      </div>
      <SupportingDoc
        files={[...files]}
        onFilesChange={setFiles}
        data-testid="file-upload-input"
      />
      <div className="space-y-2">
        <Button
          onClick={handleGeneratePresentation}
          className="w-full rounded-[32px] flex items-center justify-center py-6 bg-[#5141e5] text-white font-instrument_sans font-semibold text-xl hover:bg-[#5141e5]/80 transition-colors duration-300 disabled:opacity-60 disabled:hover:bg-[#5141e5]"
          data-testid="next-button"
          disabled={(remainingSlides != null && remainingSlides <= 0) || (remainingPresentations !== null && remainingPresentations <= 0)}
        >
          <span>Next</span>
          <ChevronRight className="!w-6 !h-6" />
        </Button>
        {((remainingSlides != null && remainingSlides <= 0) || (remainingPresentations !== null && remainingPresentations <= 0)) && (
          <div className="text-center text-sm text-slate-600">
            {remainingSlides != null && remainingSlides <= 0 && (<span>You have no slides left this month. </span>)}
            {remainingPresentations !== null && remainingPresentations <= 0 && (<span>Presentation limit reached. </span>)}
            <Link href="/pricing" className="text-indigo-600 font-medium hover:underline">Upgrade to continue</Link>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default UploadPage;
