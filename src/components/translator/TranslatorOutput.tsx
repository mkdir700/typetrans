import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 py-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

interface TranslatorOutputProps {
  translatedText: string;
  isTranslating: boolean;
}

export const TranslatorOutput: React.FC<TranslatorOutputProps> = ({
  translatedText,
  isTranslating,
}) => {
  if (!isTranslating && !translatedText) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <Separator className="my-2 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      <div className="relative">
        {/* Visual bar */}
        <div className={cn(
            "absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all",
            isTranslating ? "bg-primary animate-pulse" : "bg-primary/50"
        )} />

        <ScrollArea className="h-full w-full pl-3 pr-1 max-h-[200px]">
          <div className="text-sm font-medium leading-relaxed text-foreground whitespace-pre-wrap py-1">
            {isTranslating && !translatedText ? (
              <ThinkingIndicator />
            ) : (
              translatedText
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
