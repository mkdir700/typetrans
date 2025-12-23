export const formatShortcut = (keys: string[]): string => {
    return keys.join('+');
};

export const parseShortcut = (shortcut: string): string[] => {
    if (!shortcut) return [];
    return shortcut.split('+');
};

export const matchShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
    if (!shortcut) return false;

    const parts = parseShortcut(shortcut);
    const keys = new Set(parts.map(p => p.toLowerCase()));

    const eventMeta = event.metaKey;
    const eventCtrl = event.ctrlKey;
    const eventAlt = event.altKey;
    const eventShift = event.shiftKey;

    // Check Modifiers
    const hasMeta = keys.has('cmd') || keys.has('command') || keys.has('meta');
    const hasCtrl = keys.has('ctrl') || keys.has('control');
    const hasAlt = keys.has('alt') || keys.has('option');
    const hasShift = keys.has('shift');

    if (eventMeta !== hasMeta) return false;
    if (eventCtrl !== hasCtrl) return false;
    if (eventAlt !== hasAlt) return false;
    if (eventShift !== hasShift) return false;

    // Check Main Key
    // Filter out modifiers to find the main key
    const mainKeys = parts.filter(p => !['cmd', 'command', 'meta', 'ctrl', 'control', 'alt', 'option', 'shift'].includes(p.toLowerCase()));

    if (mainKeys.length === 0) return true; // Only modifiers (rare but possible)
    if (mainKeys.length > 1) return false; // Too many keys?

    const mainKey = mainKeys[0].toLowerCase();
    const eventKey = event.key.toLowerCase();

    // Special cases
    if (mainKey === 'enter' && eventKey === 'enter') return true;
    if (mainKey === 'escape' && (eventKey === 'escape' || eventKey === 'esc')) return true;
    if (mainKey === 'space' && eventKey === ' ') return true;

    return mainKey === eventKey;
};

export const getDisplayShortcut = (shortcut: string): string[] => {
    return parseShortcut(shortcut).map(k => {
        if (k.toLowerCase() === 'cmd') return '⌘';
        if (k.toLowerCase() === 'shift') return '⇧';
        if (k.toLowerCase() === 'alt') return '⌥';
        if (k.toLowerCase() === 'ctrl') return '⌃';
        if (k.toLowerCase() === 'enter') return '↵';
        return k;
    });
};
