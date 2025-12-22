import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion).catch(console.error);
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    setUpdateStatus(t("about.checking", "Checking for updates..."));
    
    try {
      const update = await check();
      
      if (update?.available) {
        setUpdateStatus(t("about.available", "Update available: v{{version}}", { version: update.version }));
        
        const yes = await ask(
          t("about.updateDialog.message", "Update to {{version}} is available!\n\nRelease notes: {{notes}}", { 
            version: update.version, 
            notes: update.body 
          }), 
          {
            title: t("about.updateDialog.title", "Update Available"),
            kind: 'info',
            okLabel: t("about.updateDialog.update", "Update"),
            cancelLabel: t("about.updateDialog.cancel", "Cancel")
          }
        );

        if (yes) {
          await update.downloadAndInstall();
          // Restart the app after the update is installed
          await relaunch();
        }
      } else {
        setUpdateStatus(t("about.uptodate", "You are on the latest version."));
      }
    } catch (error) {
      console.error(error);
      setUpdateStatus(t("about.error", "Failed to check for updates."));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("about.title", "About TypeTrans")}</h2>
        <p className="text-muted-foreground">
          {t("about.description", "AI-Powered Translation Tool")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("about.version.title", "Version Information")}</CardTitle>
          <CardDescription>
            {t("about.version.description", "Current installed version and update status")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("about.version.current", "Current Version")}</span>
            <span className="text-sm text-muted-foreground">v{version}</span>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {updateStatus}
            </div>
            <Button 
              variant="outline" 
              onClick={checkForUpdates}
              disabled={checking}
            >
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("about.checkButton", "Check for Updates")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-muted-foreground pt-8">
        &copy; {new Date().getFullYear()} TypeTrans. All rights reserved.
      </div>
    </div>
  );
}
