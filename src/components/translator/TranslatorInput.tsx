import { forwardRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { Textarea } from "../ui/textarea";

interface TranslatorInputProps {
  inputText: string;
  setInputText: (text: string) => void;
}

export const TranslatorInput = forwardRef<HTMLTextAreaElement, TranslatorInputProps>(
  ({ inputText, setInputText }, ref) => {
    const { t } = useTranslation();

    const adjustTextareaHeight = useCallback(() => {
        const textarea = (ref as React.RefObject<HTMLTextAreaElement>).current;
        if (!textarea) return;
    
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 120); // Max height limit
        textarea.style.height = `${Math.max(40, newHeight)}px`; // Min height 40px
      }, [ref]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputText, adjustTextareaHeight]);

    return (
      <Textarea 
        ref={ref}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={t("translator.placeholder", "Type to translate...")}
        spellCheck={false}
        className={cn(
          "min-h-[40px] w-full resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-1 bg-transparent",
          "text-lg font-medium leading-relaxed placeholder:text-muted-foreground/40",
          "custom-scrollbar"
        )}
        autoFocus
      />
    );
  }
);

TranslatorInput.displayName = "TranslatorInput";
