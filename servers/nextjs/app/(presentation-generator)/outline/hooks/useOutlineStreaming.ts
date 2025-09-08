import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setOutlines } from "@/store/slices/presentationGeneration";
import { jsonrepair } from "jsonrepair";
import { RootState } from "@/store/store";
import { getHeader } from "@/app/(presentation-generator)/services/api/header";



export const useOutlineStreaming = (presentationId: string | null) => {
  const dispatch = useDispatch();
  const { outlines } = useSelector((state: RootState) => state.presentationGeneration);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const [highestActiveIndex, setHighestActiveIndex] = useState<number>(-1);
  const prevSlidesRef = useRef<{ content: string }[]>([]);
  const activeIndexRef = useRef<number>(-1);
  const highestIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!presentationId || outlines.length > 0) return;

    let accumulatedChunks = "";
    const controller = new AbortController();

    const initializeStream = async () => {
      setIsStreaming(true)
      setIsLoading(true)
      try {
        const headers = await getHeader();
        (headers as any).Accept = "text/event-stream";
        const response = await fetch(`/api/v1/ppt/outlines/stream?presentation_id=${presentationId}`,
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
                  const nextSlides: { content: string }[] = partialData.slides || [];
                  try {
                    const prev = prevSlidesRef.current || [];
                    let changedIndex: number | null = null;
                    const maxLen = Math.max(prev.length, nextSlides.length);
                    for (let i = 0; i < maxLen; i++) {
                      const prevContent = prev[i]?.content;
                      const nextContent = nextSlides[i]?.content;
                      if (nextContent !== prevContent) {
                        changedIndex = i;
                      }
                    }
                    const prevActive = activeIndexRef.current;
                    let nextActive = changedIndex ?? prevActive;
                    if (nextActive < prevActive) {
                      nextActive = prevActive;
                    }
                    activeIndexRef.current = nextActive;
                    setActiveSlideIndex(nextActive);
                    if (nextActive > highestIndexRef.current) {
                      highestIndexRef.current = nextActive;
                      setHighestActiveIndex(nextActive);
                    }
                  } catch {}
                  prevSlidesRef.current = nextSlides;
                  dispatch(setOutlines(nextSlides));
                  setIsLoading(false)
                }
              } catch (error) {
                // JSON isn't complete yet, continue accumulating
              }
              break;
            case "complete":
              try {
                const outlinesData: { content: string }[] = data.presentation.outlines.slides;
                dispatch(setOutlines(outlinesData));
                setIsStreaming(false)
                setIsLoading(false)
                setActiveSlideIndex(null)
                setHighestActiveIndex(-1)
                prevSlidesRef.current = outlinesData;
                activeIndexRef.current = -1;
                highestIndexRef.current = -1;
                controller.abort();
              } catch (error) {
                controller.abort();
                console.error("Error parsing accumulated chunks:", error);
                toast.error("Failed to parse presentation data");
              }
              accumulatedChunks = "";
              break;
            case "closing":
              setIsStreaming(false)
              setIsLoading(false)
              setActiveSlideIndex(null)
              setHighestActiveIndex(-1)
              activeIndexRef.current = -1;
              highestIndexRef.current = -1;
              controller.abort();
              break;
            case "error":
              controller.abort();
              setIsStreaming(false)
              setIsLoading(false)
              setActiveSlideIndex(null)
              setHighestActiveIndex(-1)
              activeIndexRef.current = -1;
              highestIndexRef.current = -1;
              toast.error('Error in outline streaming', {
                description: data.detail || 'Failed to connect to the server. Please try again.',
              });
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
      } catch (error) {
        
        setIsStreaming(false)
        setIsLoading(false)
        setActiveSlideIndex(null)
        setHighestActiveIndex(-1)
        activeIndexRef.current = -1;
        highestIndexRef.current = -1;
        toast.error("Failed to initialize connection");
      }
    };
    initializeStream();
    return () => {
      controller.abort();
    };
  }, [presentationId, dispatch]);

  return { isStreaming, isLoading, activeSlideIndex, highestActiveIndex };
}; 