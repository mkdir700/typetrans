import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Command, CornerDownLeft, Settings, Pin, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useShortcutStore, ShortcutAction } from "../store/shortcutStore";

interface ShortcutDef {
  id: ShortcutAction;
  description: string;
  scope: string;
  icon: React.ReactNode;
}

export default function ShortcutSettings() {
  const { t } = useTranslation();
  const { 
    shortcuts, 
    updateShortcut, 
    isRecording, 
    recordingAction, 
    startRecording, 
    stopRecording, 
    resetToDefaults 
  } = useShortcutStore();

  const shortcutDefs: ShortcutDef[] = [
    {
      id: "toggle_translator_window",
      description: "Toggle Translator Window",
      scope: "Global",
      icon: <Keyboard className="h-4 w-4" />,
    },
    {
      id: "paste_translation",
      description: "Paste translation to previous app",
      scope: "Translator",
      icon: <CornerDownLeft className="h-4 w-4" />,
    },
    {
      id: "pin_window",
      description: "Pin/Unpin Translator Window",
      scope: "Translator",
      icon: <Pin className="h-4 w-4" />,
    },
    {
      id: "open_settings",
      description: "Open Settings",
      scope: "Translator",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "hide_translator_window",
      description: "Hide Translator Window",
      scope: "Translator",
      icon: <Command className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRecording || !recordingAction) return;

      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.metaKey) keys.push("Cmd");
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");

      if (e.key && !["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        // Handle special keys
        if (e.key === " ") keys.push("Space");
        else if (e.key === "Escape") keys.push("Escape");
        else if (e.key === "Enter") keys.push("Enter");
        else keys.push(e.key.toUpperCase());
      }

      if (keys.length > 0) {
        // Don't save if only modifiers are pressed
        if (keys.every(k => ["Cmd", "Ctrl", "Alt", "Shift"].includes(k))) return;
        
        const shortcutString = keys.join("+");
        updateShortcut(recordingAction, shortcutString);
        stopRecording();
      }
    };

    if (isRecording) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRecording, recordingAction, updateShortcut, stopRecording]);

  // Click outside to stop recording
  useEffect(() => {
     const handleClick = () => {
         if (isRecording) stopRecording();
     }
     if (isRecording) {
         window.addEventListener('click', handleClick);
     }
     return () => window.removeEventListener('click', handleClick);
  }, [isRecording, stopRecording]);


  return (
    <div className="h-full bg-transparent p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
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
            <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset Defaults
            </Button>
        </div>

        {/* Shortcuts List */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm">
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Click on a shortcut to record a new key combination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shortcut</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Scope</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortcutDefs.map((def) => {
                    const isRowRecording = isRecording && recordingAction === def.id;
                    const keys = shortcuts[def.id] ? shortcuts[def.id].split("+") : [];

                    return (
                        <TableRow key={def.id}>
                            <TableCell>
                            <div 
                                className={cn(
                                    "flex items-center gap-1 p-2 rounded-md transition-all cursor-pointer border",
                                    isRowRecording 
                                        ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                                        : "border-transparent hover:bg-muted hover:border-border"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startRecording(def.id);
                                }}
                            >
                                {isRowRecording ? (
                                    <span className="text-primary text-sm font-medium animate-pulse">Recording...</span>
                                ) : (
                                    keys.map((key, kIndex) => (
                                    <span key={kIndex} className="flex items-center">
                                        <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[12px] font-medium text-foreground opacity-100">
                                        {key}
                                        </kbd>
                                        {kIndex < keys.length - 1 && (
                                        <span className="mx-1 text-muted-foreground">+</span>
                                        )}
                                    </span>
                                    ))
                                )}
                            </div>
                            </TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                {def.icon}
                                <span>{def.description}</span>
                            </div>
                            </TableCell>
                            <TableCell>
                            <Badge variant="secondary">{def.scope}</Badge>
                            </TableCell>
                        </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
