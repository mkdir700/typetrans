import { forwardRef, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { Textarea } from "../ui/textarea";
import { getCaretCoordinates } from "../../lib/caret";
import { StarrySky, StarrySkyRef } from "../effects/StarrySky";

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

    const starryRef = useRef<StarrySkyRef>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);

      // Trigger particle effect
      if (starryRef.current) {
        // We use a small timeout to ensure the caret position is updated after the change
        requestAnimationFrame(() => {
          const { top, left } = getCaretCoordinates(e.target, e.target.selectionEnd);
          
          // Adjust for scroll position
          const x = left - e.target.scrollLeft;
          const y = top - e.target.scrollTop;
          
          starryRef.current?.explode(x, y);
        });
      }
    };

    return (
      <div className="relative w-full group">
        <StarrySky ref={starryRef} />
        <Textarea 
          ref={ref}
          value={inputText}
          onChange={handleChange}
          placeholder={t("translator.placeholder", "Type to translate...")}
          spellCheck={false}
          className={cn(
            "min-h-[40px] w-full resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-1 bg-transparent",
            "text-lg font-medium leading-relaxed placeholder:text-muted-foreground/40",
            "relative z-10"
          )}
          autoFocus
        />
      </div>
    );
  }
);

TranslatorInput.displayName = "TranslatorInput";
