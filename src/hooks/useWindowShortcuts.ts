import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useShortcutStore } from "../store/shortcutStore";
import { matchShortcut } from "../lib/shortcutUtils";

interface UseWindowShortcutsProps {
    updateSettings: () => Promise<void>;
    inputText: string;
    translatedText: string;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    clearContent: () => void;
    handleTogglePin: () => void;
    openSettings: () => void;
}

export const useWindowShortcuts = ({
    updateSettings,
    inputText,
    translatedText,
    inputRef,
    clearContent,
    handleTogglePin,
    openSettings,
}: UseWindowShortcutsProps) => {
    const { shortcuts } = useShortcutStore();

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
            // Paste Translation
            if (matchShortcut(e, shortcuts.paste_translation)) {
                e.preventDefault();
                const text = translatedText || inputText;
                if (text) {
                    invoke("paste_translation", { text });
                    clearContent();
                }
                return;
            }

            // Pin Window
            if (matchShortcut(e, shortcuts.pin_window)) {
                e.preventDefault();
                handleTogglePin();
                return;
            }

            // Open Settings
            if (matchShortcut(e, shortcuts.open_settings)) {
                e.preventDefault();
                openSettings();
                return;
            }

            // Hide Window
            if (matchShortcut(e, shortcuts.hide_translator_window || "Escape")) { // Default: Escape
                e.preventDefault();
                getCurrentWindow().hide().catch((error) => {
                    console.error("Failed to hide window:", error);
                });
                clearContent();
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);
        return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, [translatedText, inputText, handleTogglePin, openSettings, clearContent, shortcuts]);
};
