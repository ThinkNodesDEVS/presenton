import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageType, PresentationConfig } from "../type";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Types
interface ConfigurationSelectsProps {
  config: PresentationConfig;
  onConfigChange: (key: keyof PresentationConfig, value: string) => void;
  remainingSlides?: number | null;
}

type SlideOption = "5" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20";

// Constants
const SLIDE_OPTIONS: SlideOption[] = ["5", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

/**
 * Renders a select component for slide count
 */
const SlideCountSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
  remainingSlides?: number | null;
}> = ({ value, onValueChange, remainingSlides }) => {
  const [customInput, setCustomInput] = useState(
    value && !SLIDE_OPTIONS.includes(value as SlideOption) ? value : ""
  );

  const sanitizeToPositiveInteger = (raw: string): string => {
    const digitsOnly = raw.replace(/\D+/g, "");
    if (!digitsOnly) return "";
    // Remove leading zeros
    const noLeadingZeros = digitsOnly.replace(/^0+/, "");
    return noLeadingZeros;
  };

  const applyCustomValue = () => {
    const sanitized = sanitizeToPositiveInteger(customInput);
    if (sanitized && Number(sanitized) > 0) {
      onValueChange(sanitized);
    }
  };

  const canSelect = (opt: string) => {
    if (remainingSlides == null) return true;
    const num = Number(opt);
    return Number.isFinite(num) && num <= remainingSlides;
  };

  return (
    <Select value={value || ""} onValueChange={onValueChange} name="slides">
      <SelectTrigger
        className="w-[180px] font-instrument_sans font-medium bg-blue-100 border-blue-200 focus-visible:ring-blue-300"
        data-testid="slides-select"
      >
        <SelectValue placeholder="Select Slides" />
      </SelectTrigger>
      <SelectContent className="font-instrument_sans">
        {/* Sticky custom input at the top */}
        <div
          className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-2 border-b"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              value={customInput}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const next = sanitizeToPositiveInteger(e.target.value);
                // If remainingSlides known, clamp custom input visually
                if (remainingSlides != null && next) {
                  const asNum = Number(next);
                  if (Number.isFinite(asNum) && asNum > remainingSlides) {
                    setCustomInput(String(remainingSlides));
                  } else {
                    setCustomInput(next);
                  }
                } else {
                  setCustomInput(next);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCustomValue();
                }
              }}
              onBlur={applyCustomValue}
              placeholder="X"
              className="h-8 w-16 px-2 text-sm"
            />
            <span className="text-sm font-medium">slides</span>
          </div>
          {typeof remainingSlides === "number" && (
            <div className="mt-1 text-[11px] text-slate-500">
              {remainingSlides} left this month. {remainingSlides < 20 && (
                <Link href="/pricing" className="text-indigo-600 hover:underline">Upgrade</Link>
              )}
            </div>
          )}
        </div>

        {/* Hidden item to allow SelectValue to render custom selection */}
        {value && !SLIDE_OPTIONS.includes(value as SlideOption) && (
          <SelectItem value={value} className="hidden">
            {value} slides
          </SelectItem>
        )}

        {SLIDE_OPTIONS.map((option) => {
          const disabled = !canSelect(option);
          return (
            <SelectItem
              key={option}
              value={option}
              className={`font-instrument_sans text-sm font-medium ${disabled ? "opacity-40 pointer-events-none" : ""}`}
              role="option"
              disabled={disabled}
            >
              {option} slides {disabled && <span className="ml-1 text-[10px] text-slate-500">(Upgrade)</span>}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

/**
 * Renders a language selection component with search functionality
 */
const LanguageSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ value, onValueChange, open, onOpenChange }) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        name="language"
        data-testid="language-select"
        aria-expanded={open}
        className="w-[200px] justify-between font-instrument_sans font-semibold overflow-hidden bg-blue-100 hover:bg-blue-100 border-blue-200 focus-visible:ring-blue-300 border-none"
      >
        <p className="text-sm font-medium truncate">
          {value || "Select language"}
        </p>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[300px] p-0" align="end">
      <Command>
        <CommandInput
          placeholder="Search language..."
          className="font-instrument_sans"
        />
        <CommandList>
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {Object.values(LanguageType).map((language) => (
              <CommandItem
                key={language}
                value={language}
                role="option"
                onSelect={(currentValue) => {
                  onValueChange(currentValue);
                  onOpenChange(false);
                }}
                className="font-instrument_sans"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === language ? "opacity-100" : "opacity-0"
                  )}
                />
                {language}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export function ConfigurationSelects({
  config,
  onConfigChange,
  remainingSlides,
}: ConfigurationSelectsProps) {
  const [openLanguage, setOpenLanguage] = useState(false);

  return (
    <div className="flex flex-wrap order-1 gap-4">
      <SlideCountSelect
        value={config.slides}
        onValueChange={(value) => onConfigChange("slides", value)}
        remainingSlides={remainingSlides}
      />
      <LanguageSelect
        value={config.language}
        onValueChange={(value) => onConfigChange("language", value)}
        open={openLanguage}
        onOpenChange={setOpenLanguage}
      />
    </div>
  );
}
