import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

interface UseWindowShortcutsProps {
    updateSettings: () => Promise<void>;
    inputText: string;
    translatedText: string;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    clearContent: () => void;
}

export const useWindowShortcuts = ({
    updateSettings,
    inputText,
    translatedText,
    inputRef,
    clearContent,
}: UseWindowShortcutsProps) => {
    // Global Shortcut Listener
    useEffect(() => {
        const unlisten = listen("global-shortcut-triggered", async () => {
            try {
                await updateSettings();
                await invoke("show_translator_window");
                setTimeout(() => inputRef.current?.focus(), 100);
            } catch (error) {
                console.error("Error showing window:", error);
            }
        });
        return () => {
            unlisten.then((fn) => fn());
        };
    }, [updateSettings, inputRef]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === "Enter") {
                e.preventDefault();
                const text = translatedText || inputText;
                if (text) {
                    invoke("paste_translation", { text });
                    clearContent();
                }
                return;
            }

            if (e.key === "Escape") {
                invoke("hide_translator_window");
                clearContent();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [translatedText, inputText]);
};
