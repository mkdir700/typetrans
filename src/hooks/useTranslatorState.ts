import { useState, useRef, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export type Tone = "Formal" | "Casual" | "Academic" | "Creative";

export interface Language {
    code: string;
    name: string;
}

export const LANGUAGES: Language[] = [
    { code: "zh", name: "Chinese" },
    { code: "en", name: "English" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
];

export const TONES: Tone[] = ["Formal", "Casual", "Academic", "Creative"];

type AppSettings = {
    active_engine?: string;
};

export const useTranslatorState = () => {
    const [inputText, setInputText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [sourceLang, setSourceLang] = useState<Language>(LANGUAGES[0]);
    const [targetLang, setTargetLang] = useState<Language>(LANGUAGES[1]);
    const [currentTone, setCurrentTone] = useState<Tone>("Casual");
    const [activeEngine, setActiveEngine] = useState("zhipu");

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const translateRequestId = useRef(0);

    const updateSettings = useCallback(async () => {
        try {
            const settings = await invoke<AppSettings>("get_app_settings");
            setActiveEngine(settings.active_engine ?? "zhipu");
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    }, []);

    useEffect(() => {
        updateSettings();
    }, [updateSettings]);

    const handleTranslate = useCallback(
        async (text: string) => {
            const requestId = ++translateRequestId.current;

            if (!text.trim()) {
                setTranslatedText("");
                setIsTranslating(false);
                return;
            }

            setIsTranslating(true);

            try {
                const translation = await invoke<string>("get_translation", {
                    text: text,
                    targetLang: targetLang.code.toUpperCase(),
                    tone: currentTone,
                });

                if (requestId === translateRequestId.current) {
                    setTranslatedText(translation);
                }
            } catch (error) {
                if (requestId === translateRequestId.current) {
                    setTranslatedText(`Error: ${error}`);
                }
            } finally {
                if (requestId === translateRequestId.current) {
                    setIsTranslating(false);
                }
            }
        },
        [targetLang, currentTone]
    );

    useEffect(() => {
        if (!inputText.trim()) {
            setTranslatedText("");
            setIsTranslating(false);
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            handleTranslate(inputText);
        }, 500);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [inputText, handleTranslate]);

    const toggleLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText(translatedText);
        setTranslatedText("");
    };

    return {
        inputText,
        setInputText,
        translatedText,
        setTranslatedText,
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
    };
};
