import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";
import { Button } from "../components/ui/button";
import { Loader2, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsLayout } from "../components/SettingsLayout";

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
    <SettingsLayout
        title={t("about.title", "About TypeTrans")}
        description={t("about.description", "AI-Powered Translation Tool")}
    >
        <section className="flex flex-col gap-8">
            <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Info size={32} />
                </div>
                <div>
                     <h3 className="text-xl font-semibold mb-1">TypeTrans</h3>
                     <p className="text-muted-foreground">
                        Your intelligent translation assistant.
                     </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                     <h3 className="text-lg font-medium">Version Information</h3>
                     <p className="text-sm text-muted-foreground">Current installed version and update status.</p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-transparent hover:border-border/50 transition-colors">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Current Version</span>
                        <span className="text-2xl font-bold tracking-tight">v{version}</span>
                    </div>
                    
                     <Button 
                        variant="outline" 
                        onClick={checkForUpdates}
                        disabled={checking}
                        className="gap-2"
                    >
                        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {t("about.checkButton", "Check for Updates")}
                    </Button>
                </div>
                
                {updateStatus && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md animate-in fade-in">
                        {updateStatus}
                    </div>
                )}
            </div>

            <div className="text-xs text-center text-muted-foreground pt-12">
            &copy; {new Date().getFullYear()} TypeTrans. All rights reserved.
            </div>
        </section>
    </SettingsLayout>
  );
}
