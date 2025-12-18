import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Save } from "lucide-react";

export default function ShortcutSettings() {
  const { t } = useTranslation();
  const [shortcut, setShortcut] = useState("Alt+T");
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    setShortcut("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;

    e.preventDefault();
    const keys: string[] = [];

    if (e.metaKey) keys.push("Cmd");
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");

    if (e.key && !["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
      keys.push(e.key.toUpperCase());
    }

    if (keys.length > 1) {
      setShortcut(keys.join("+"));
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    // TODO: Implement actual shortcut save logic via Tauri invoke
    console.log("Saving shortcut:", shortcut);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <Keyboard className="text-blue-500" size={32} strokeWidth={2} />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              {t("shortcutSettings.title")}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t("shortcutSettings.description")}
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 dark:border-slate-700/30 shadow-xl">
          <label className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-3 block">
            {t("shortcutSettings.currentShortcut")}
          </label>

          <div
            onClick={handleStartRecording}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className={`w-full h-24 px-6 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
              isRecording
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-500/20"
                : "border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
          >
            {shortcut ? (
              <div className="flex items-center space-x-2">
                {shortcut.split("+").map((key, index) => (
                  <span key={index}>
                    <kbd className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-base font-bold shadow-sm text-slate-800 dark:text-slate-100">
                      {key}
                    </kbd>
                    {index < shortcut.split("+").length - 1 && (
                      <span className="text-slate-400 mx-1">+</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-sm">
                {t("shortcutSettings.placeholder")}
              </span>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Click the box above and press your desired key combination
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/30 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!shortcut || isRecording}
              className={`flex items-center space-x-2 h-12 px-6 rounded-xl text-sm font-semibold transition-all ${
                shortcut && !isRecording
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:scale-105 active:scale-95"
                  : "bg-slate-200/70 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              }`}
            >
              <Save size={16} />
              <span>{t("shortcutSettings.save")}</span>
            </button>
          </div>

          {saved && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                ✓ {t("settings.status.saved")}
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-md rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/30">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use modifier keys (Cmd, Ctrl, Alt, Shift) for better compatibility</li>
            <li>• Avoid system shortcuts to prevent conflicts</li>
            <li>• Press ESC to cancel recording</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
