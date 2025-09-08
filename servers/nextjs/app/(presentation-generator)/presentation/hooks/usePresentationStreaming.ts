import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearPresentationData,
  setPresentationData,
  setStreaming,
} from "@/store/slices/presentationGeneration";
import { jsonrepair } from "jsonrepair";
import { toast } from "sonner";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";
import { getHeader } from "@/app/(presentation-generator)/services/api/header";

export const usePresentationStreaming = (
  presentationId: string,
  stream: string | null,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void,
  fetchUserSlides: () => void
) => {
  const dispatch = useDispatch();
  const previousSlidesLength = useRef(0);

  useEffect(() => {
    let accumulatedChunks = "";
    const controller = new AbortController();

    const initializeStream = async () => {
      dispatch(setStreaming(true));
      dispatch(clearPresentationData());

      trackEvent(MixpanelEvent.Presentation_Stream_API_Call);
      const headers = await getHeader();
      (headers as any).Accept = "text/event-stream";
      const response = await fetch(`/api/v1/ppt/presentation/stream?presentation_id=${presentationId}`,
        { headers, signal: controller.signal }
      );
      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to the server");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const processEvent = (rawEvent: string) => {
        const lines = rawEvent.split("\n");
        const dataLine = lines.find(l => l.startsWith("data:"));
        if (!dataLine) return;
        const json = dataLine.slice(5).trim();
        const data = JSON.parse(json);

        switch (data.type) {
          case "chunk":
            accumulatedChunks += data.chunk;
            try {
              const repairedJson = jsonrepair(accumulatedChunks);
              const partialData = JSON.parse(repairedJson);

              if (partialData.slides) {
                if (
                  partialData.slides.length !== previousSlidesLength.current &&
                  partialData.slides.length > 0
                ) {
                  dispatch(
                    setPresentationData({
                      ...partialData,
                      slides: partialData.slides,
                    })
                  );
                  previousSlidesLength.current = partialData.slides.length;
                  setLoading(false);
                }
              }
            } catch (error) {
              // JSON isn't complete yet, continue accumulating
            }
            break;

          case "complete":
            try {
              dispatch(setPresentationData(data.presentation));
              dispatch(setStreaming(false));
              setLoading(false);
              controller.abort();

              // Remove stream parameter from URL
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete("stream");
              window.history.replaceState({}, "", newUrl.toString());
            } catch (error) {
              controller.abort();
              console.error("Error parsing accumulated chunks:", error);
            }
            accumulatedChunks = "";
            break;

          case "closing":
            dispatch(setPresentationData(data.presentation));
            setLoading(false);
            dispatch(setStreaming(false));
            controller.abort();

            // Remove stream parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("stream");
            window.history.replaceState({}, "", newUrl.toString());
            break;
          case "error":
            controller.abort();
            toast.error("Error in outline streaming", {
              description:
                data.detail ||
                "Failed to connect to the server. Please try again.",
            });
            setLoading(false);
            dispatch(setStreaming(false));
            setError(true);
            break;
        }
      };
      const pump = async (): Promise<void> => {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          if (part.trim()) processEvent(part);
        }
        await pump();
      };
      await pump();
    };

    if (stream) {
      initializeStream();
    } else {
      fetchUserSlides();
    }

    return () => {
      controller.abort();
    };
  }, [presentationId, stream, dispatch, setLoading, setError, fetchUserSlides]);
};
