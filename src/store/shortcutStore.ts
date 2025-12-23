import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ShortcutAction =
    | 'toggle_translator_window'
    | 'paste_translation'
    | 'pin_window'
    | 'open_settings'
    | 'hide_translator_window';

export interface ShortcutState {
    shortcuts: Record<ShortcutAction, string>;
    isRecording: boolean;
    recordingAction: ShortcutAction | null;
    updateShortcut: (action: ShortcutAction, keys: string) => void;
    startRecording: (action: ShortcutAction) => void;
    stopRecording: () => void;
    resetToDefaults: () => void;
}

export const DEFAULT_SHORTCUTS: Record<ShortcutAction, string> = {
    toggle_translator_window: 'Alt+T',
    paste_translation: 'Alt+Enter',
    pin_window: 'Cmd+P',
    open_settings: 'Cmd+,',
    hide_translator_window: 'Escape',
};

export const useShortcutStore = create<ShortcutState>()(
    persist(
        (set, get) => ({
            shortcuts: DEFAULT_SHORTCUTS,
            isRecording: false,
            recordingAction: null,
            updateShortcut: async (action, keys) => {
                const state = get();
                const oldKeys = state.shortcuts[action];

                // If it's a global shortcut, verify/update backend first
                if (action === 'toggle_translator_window') {
                    try {
                        // Dynamically import invoke to avoid SSR/build issues if this file is imported early
                        const { invoke } = await import('@tauri-apps/api/core');
                        await invoke('update_global_shortcut', {
                            oldShortcut: oldKeys,
                            newShortcut: keys
                        });
                    } catch (error) {
                        console.error("Failed to update global shortcut:", error);
                        // We proceed anyway to keep UI in sync, or could return here.
                    }
                }

                set((state) => ({
                    shortcuts: { ...state.shortcuts, [action]: keys }
                }));
            },
            startRecording: (action) =>
                set({ isRecording: true, recordingAction: action }),
            stopRecording: () =>
                set({ isRecording: false, recordingAction: null }),
            resetToDefaults: () =>
                set({ shortcuts: DEFAULT_SHORTCUTS }),
        }),
        {
            name: 'shortcut-storage',
            merge: (persistedState, currentState) => {
                const persisted = persistedState as ShortcutState;
                return {
                    ...currentState,
                    ...persisted,
                    shortcuts: {
                        ...currentState.shortcuts,
                        ...(persisted.shortcuts || {}),
                    },
                };
            },
        }
    )
);
