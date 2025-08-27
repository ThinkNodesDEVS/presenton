"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { handleSaveLLMConfig } from "@/utils/storeHelpers";
import LLMProviderSelection from "./LLMSelection";
import {
  checkIfSelectedOllamaModelIsPulled,
  pullOllamaModel,
} from "@/utils/providerUtils";
import { LLMConfig } from "@/types/llm_config";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { usePathname } from "next/navigation";

// Button state interface
interface ButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  text: string;
  showProgress: boolean;
  progressPercentage?: number;
  status?: string;
}

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const config = useSelector((state: RootState) => state.userConfig);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(config.llm_config);

  const [downloadingModel, setDownloadingModel] = useState<{
    name: string;
    size: number | null;
    downloaded: number | null;
    status: string;
    done: boolean;
  } | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [buttonState, setButtonState] = useState<ButtonState>({
    isLoading: false,
    isDisabled: false,
    text: "Save Configuration",
    showProgress: false,
  });

  const canChangeKeys = config.can_change_keys;
  const downloadProgress = useMemo(() => {
    if (
      downloadingModel &&
      downloadingModel.downloaded !== null &&
      downloadingModel.size !== null
    ) {
      return Math.round(
        (downloadingModel.downloaded / downloadingModel.size) * 100
      );
    }
    return 0;
  }, [downloadingModel?.downloaded, downloadingModel?.size]);

  const handleSaveConfig = async () => {
    trackEvent(MixpanelEvent.Home_SaveConfiguration_Button_Clicked, {
      pathname,
    });
    try {
      setButtonState((prev) => ({
        ...prev,
        isLoading: true,
        isDisabled: true,
        text: "Saving Configuration...",
      }));
      // API: save config
      trackEvent(MixpanelEvent.Home_SaveConfiguration_API_Call);
      await handleSaveLLMConfig(llmConfig);
      if (llmConfig.LLM === "ollama" && llmConfig.OLLAMA_MODEL) {
        // API: check model pulled
        trackEvent(MixpanelEvent.Home_CheckOllamaModelPulled_API_Call);
        const isPulled = await checkIfSelectedOllamaModelIsPulled(
          llmConfig.OLLAMA_MODEL
        );
        if (!isPulled) {
          setShowDownloadModal(true);
          // API: download model
          trackEvent(MixpanelEvent.Home_DownloadOllamaModel_API_Call);
          await handleModelDownload();
        }
      }
      toast.info("Configuration saved successfully");
      setButtonState((prev) => ({
        ...prev,
        isLoading: false,
        isDisabled: false,
        text: "Save Configuration",
      }));
      // Track navigation from -> to
      trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/upload" });
      router.push("/upload");
    } catch (error) {
      toast.info(
        error instanceof Error ? error.message : "Failed to save configuration"
      );
      setButtonState((prev) => ({
        ...prev,
        isLoading: false,
        isDisabled: false,
        text: "Save Configuration",
      }));
    }
  };

  const handleModelDownload = async () => {
    try {
      await pullOllamaModel(llmConfig.OLLAMA_MODEL!, setDownloadingModel);
    } finally {
      setDownloadingModel(null);
      setShowDownloadModal(false);
    }
  };

  useEffect(() => {
    if (
      downloadingModel &&
      downloadingModel.downloaded !== null &&
      downloadingModel.size !== null
    ) {
      const percentage = Math.round(
        (downloadingModel.downloaded / downloadingModel.size) * 100
      );
      setButtonState({
        isLoading: true,
        isDisabled: true,
        text: `Downloading Model (${percentage}%)`,
        showProgress: true,
        progressPercentage: percentage,
        status: downloadingModel.status,
      });
    }

    if (downloadingModel && downloadingModel.done) {
      setTimeout(() => {
        setShowDownloadModal(false);
        setDownloadingModel(null);
        toast.info("Model downloaded successfully!");
      }, 2000);
    }
  }, [downloadingModel]);

  useEffect(() => {
    if (!canChangeKeys) {
      router.push("/upload");
    }
  }, [canChangeKeys, router]);

  if (!canChangeKeys) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pure-white font-inter flex flex-col">
      <main className="flex-1 container mx-auto px-6 max-w-4xl flex flex-col">
        {/* Branding Header - Lots of white space */}
        <div className="text-center pt-24 pb-16 flex-shrink-0">
          <div className="mb-8">
            <h1 className="text-hero font-bold text-deep-navy mb-4">Decky</h1>
            <p className="text-body-large text-medium-gray mb-2">
              The AI Agent That Creates Impressive Presentations
            </p>
            <p className="text-body text-medium-gray">
              From idea to impressive in minutes
            </p>
          </div>
        </div>

        {/* Main Configuration Card */}
        <div className="flex-1 mb-16">
          <div className="card-decky max-w-2xl mx-auto">
            <LLMProviderSelection
              initialLLMConfig={llmConfig}
              onConfigChange={setLlmConfig}
              buttonState={buttonState}
              setButtonState={setButtonState}
            />
          </div>
        </div>
      </main>

      {/* Download Progress Modal */}
      {showDownloadModal && downloadingModel && (
        <div className="fixed inset-0 bg-deep-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            {/* Modal Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="mb-4">
                {downloadingModel.done ? (
                  <CheckCircle className="w-12 h-12 text-bright-teal mx-auto" />
                ) : (
                  <Download className="w-12 h-12 text-electric-orange mx-auto animate-pulse" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-component font-semibold text-deep-navy mb-2">
                {downloadingModel.done
                  ? "Download Complete!"
                  : "Downloading Model"}
              </h3>

              {/* Model Name */}
              <p className="text-body-small text-medium-gray mb-6">
                {llmConfig.OLLAMA_MODEL}
              </p>

              {/* Progress Bar */}
              {downloadProgress > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-light-gray rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-electric-orange h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-body-small text-medium-gray mt-2">
                    {downloadProgress}% Complete
                  </p>
                </div>
              )}

              {/* Status */}
              {downloadingModel.status && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-bright-teal" />
                  <span className="text-body-small font-medium text-bright-teal capitalize">
                    {downloadingModel.status}
                  </span>
                </div>
              )}

              {/* Status Message */}
              {downloadingModel.status &&
                downloadingModel.status !== "pulled" && (
                  <div className="text-caption text-medium-gray">
                    {downloadingModel.status === "downloading" &&
                      "Downloading model files..."}
                    {downloadingModel.status === "verifying" &&
                      "Verifying model integrity..."}
                    {downloadingModel.status === "pulling" &&
                      "Pulling model from registry..."}
                  </div>
                )}

              {/* Download Info */}
              {downloadingModel.downloaded && downloadingModel.size && (
                <div className="mt-4 p-4 bg-light-gray rounded-lg">
                  <div className="flex justify-between text-caption text-medium-gray">
                    <span>
                      Downloaded:{" "}
                      {(downloadingModel.downloaded / 1024 / 1024).toFixed(1)}{" "}
                      MB
                    </span>
                    <span>
                      Total: {(downloadingModel.size / 1024 / 1024).toFixed(1)}{" "}
                      MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Button */}
      <div className="flex-shrink-0 bg-pure-white border-t border-light-gray p-6">
        <div className="container mx-auto max-w-2xl">
          <button
            onClick={handleSaveConfig}
            disabled={buttonState.isDisabled}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 ${
              buttonState.isDisabled
                ? "bg-medium-gray cursor-not-allowed text-pure-white"
                : "btn-primary hover:transform hover:translate-y-[-2px] hover:shadow-lg"
            }`}
          >
            {buttonState.isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-body font-medium">
                  {buttonState.text}
                </span>
              </div>
            ) : (
              <span className="text-body font-medium">{buttonState.text}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
