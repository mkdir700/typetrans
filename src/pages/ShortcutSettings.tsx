import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

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
    <div className="h-full bg-transparent p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <Keyboard className="text-blue-500" size={32} strokeWidth={2} />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {t("shortcutSettings.title")}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t("shortcutSettings.description")}
          </p>
        </div>

        {/* Settings Card */}
        <Card className="border-white/20 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm">
           <CardHeader>
               <CardTitle>{t("shortcutSettings.currentShortcut")}</CardTitle>
                <CardDescription>
                   Click the box below and press your desired key combination
                </CardDescription>
           </CardHeader>
          <CardContent className="space-y-6">
            <div
                onClick={handleStartRecording}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className={`w-full h-24 px-6 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all outline-none ${
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

            <div className="flex justify-end gap-4">
                 {saved && (
                    <div className="flex items-center px-3 text-emerald-600 dark:text-emerald-400">
                         ✓ {t("settings.status.saved")}
                    </div>
                 )}
                 <Button
                    onClick={handleSave}
                    disabled={!shortcut || isRecording}
                    className="gap-2"
                >
                    <Save size={16} />
                    <span>{t("shortcutSettings.save")}</span>
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30 dark:border-blue-700/20">
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
