import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const useWindowControls = () => {
    const [isPinned, setIsPinned] = useState(false);

    const handleTogglePin = async () => {
        const newPinState = !isPinned;
        setIsPinned(newPinState);
        try {
            await invoke("toggle_translator_pin", { pinned: newPinState });
        } catch {
            setIsPinned(!newPinState);
        }
    };

    const handleDrag = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Allow dragging only if not clicking interactive elements
        if (e.buttons === 1 && !target.closest("button") && !target.closest("[role='menuitem']")) {
            getCurrentWindow().startDragging();
        }
    };

    const openSettings = () => {
        invoke("show_main_window");
    };

    return {
        isPinned,
        handleTogglePin,
        handleDrag,
        openSettings,
    };
};
