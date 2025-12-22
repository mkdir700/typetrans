import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
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
            <Keyboard className="text-primary" size={32} strokeWidth={2} />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {t("shortcutSettings.title")}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("shortcutSettings.description")}
          </p>
        </div>

        {/* Settings Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm">
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
                className={cn(
                    "w-full h-24 px-6 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all outline-none",
                    isRecording
                    ? "border-primary bg-primary/5 ring-4 ring-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50"
                )}
            >
                {shortcut ? (
                <div className="flex items-center space-x-2">
                    {shortcut.split("+").map((key, index) => (
                    <span key={index}>
                        <kbd className="px-3 py-2 rounded-lg bg-muted border border-border text-base font-bold shadow-sm text-foreground">
                        {key}
                        </kbd>
                        {index < shortcut.split("+").length - 1 && (
                        <span className="text-muted-foreground mx-1">+</span>
                        )}
                    </span>
                    ))}
                </div>
                ) : (
                <span className="text-muted-foreground text-sm">
                    {t("shortcutSettings.placeholder")}
                </span>
                )}
            </div>

            <div className="flex justify-end gap-4">
                 {saved && (
                    <div className="flex items-center px-3 text-green-600 dark:text-green-500">
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
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-primary/10">
          <h3 className="text-sm font-semibold text-primary mb-2">
            💡 Tips
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use modifier keys (Cmd, Ctrl, Alt, Shift) for better compatibility</li>
            <li>• Avoid system shortcuts to prevent conflicts</li>
            <li>• Press ESC to cancel recording</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
