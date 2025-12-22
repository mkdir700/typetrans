import { useRef } from "react";
import { cn } from "./lib/utils";
import { useTranslatorState } from "./hooks/useTranslatorState";
import { useWindowControls } from "./hooks/useWindowControls";
import { useWindowShortcuts } from "./hooks/useWindowShortcuts";
import { TranslatorHeader } from "./components/translator/TranslatorHeader";
import { TranslatorInput } from "./components/translator/TranslatorInput";
import { TranslatorOutput } from "./components/translator/TranslatorOutput";

function Translator() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    inputText,
    setInputText,
    translatedText,
    isTranslating,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    currentTone,
    setCurrentTone,
    activeEngine,
    updateSettings,
    toggleLanguages,
    clearContent,
  } = useTranslatorState();

  const {
    isPinned,
    handleTogglePin,
    handleDrag,
    openSettings,
  } = useWindowControls();

  useWindowShortcuts({
    updateSettings,
    inputText,
    translatedText,
    inputRef,
    clearContent,
  });

  return (
    <div 
      className="h-screen w-screen flex flex-col p-1 bg-transparent"
    >
      <div 
        className={cn(
          "flex flex-col w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
          "glass-container"
        )}
      >
        <TranslatorHeader
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          toggleLanguages={toggleLanguages}
          currentTone={currentTone}
          setCurrentTone={setCurrentTone}
          activeEngine={activeEngine}
          isPinned={isPinned}
          handleTogglePin={handleTogglePin}
          openSettings={openSettings}
          handleDrag={handleDrag}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-3 gap-2 overflow-hidden">
          <TranslatorInput
            ref={inputRef}
            inputText={inputText}
            setInputText={setInputText}
          />

          <TranslatorOutput
            translatedText={translatedText}
            isTranslating={isTranslating}
          />
        </div>
      </div>
    </div>
  );
}

export default Translator;
