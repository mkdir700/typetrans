import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { Check, Eye, EyeOff, KeyRound, Server, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { SettingsLayout } from "../components/SettingsLayout";

type AppSettings = {
  zhipu_api_key?: string | null;
  tencent_secret_id?: string | null;
  tencent_secret_key?: string | null;
  tencent_region?: string | null;
  active_engine?: string;
};

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export default function ServiceSettings() {
  const { t } = useTranslation();
  
  // State
  const [activeEngine, setActiveEngine] = useState("zhipu");
  const [zhipuKey, setZhipuKey] = useState("");
  const [tencentId, setTencentId] = useState("");
  const [tencentKey, setTencentKey] = useState("");
  const [tencentRegion, setTencentRegion] = useState("ap-guangzhou");
  
  const [showKey, setShowKey] = useState(false); // For Zhipu
  const [showTencentKey, setShowTencentKey] = useState(false); // For Tencent SecretKey

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const settings = await invoke<AppSettings>("get_app_settings");
        setZhipuKey(settings?.zhipu_api_key ?? "");
        setTencentId(settings?.tencent_secret_id ?? "");
        setTencentKey(settings?.tencent_secret_key ?? "");
        setTencentRegion(settings?.tencent_region ?? "ap-guangzhou");
        setActiveEngine(settings?.active_engine ?? "zhipu");
      } catch (e) {
        setError(normalizeError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSave = useMemo(() => {
    if (saving || loading) return false;
    if (activeEngine === "zhipu") {
        return zhipuKey.trim().length > 0;
    }
    if (activeEngine === "tencent") {
        return tencentId.trim().length > 0 && tencentKey.trim().length > 0;
    }
    return false;
  }, [activeEngine, zhipuKey, tencentId, tencentKey, loading, saving]);

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      // Save configurations
      await invoke("set_zhipu_api_key", { apiKey: zhipuKey });
      await invoke("set_tencent_config", { 
          secretId: tencentId, 
          secretKey: tencentKey, 
          region: tencentRegion 
      });
      await invoke("set_active_engine", { engine: activeEngine });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title={t("modelSettings.title")}
      description={t("modelSettings.description")}
    >
        {/* Engine Selection */}
        <section>
             <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    {t("settings.engine.label")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Choose the AI model provider for translations.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveEngine("zhipu")}
                    className={cn(
                        "group relative flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                        activeEngine === "zhipu"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-transparent bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground"
                    )}
                >
                    <span className="font-semibold text-lg">{t("settings.engine.zhipu")}</span>
                </button>
                <button
                    onClick={() => setActiveEngine("tencent")}
                    className={cn(
                        "group relative flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                        activeEngine === "tencent"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-transparent bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground"
                    )}
                >
                    <span className="font-semibold text-lg">{t("settings.engine.tencent")}</span>
                </button>
            </div>
        </section>

        <Separator />

        {/* Configuration Fields */}
        <section>
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    {t("settings.title")}
                </h2>
                 <p className="text-sm text-muted-foreground">
                    Configure authentication credentials for the selected provider.
                </p>
            </div>

            <div className="max-w-xl">
                {activeEngine === "zhipu" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <Label className="text-base">{t("settings.apiKey.label")}</Label>
                        <div className="flex items-center gap-3">
                            <Input
                            value={zhipuKey}
                            onChange={(e) => setZhipuKey(e.target.value)}
                            type={showKey ? "text" : "password"}
                            placeholder={t("settings.apiKey.placeholder")}
                            className="flex-1 bg-background/50 backdrop-blur-sm"
                            spellCheck={false}
                            disabled={loading}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowKey((v) => !v)}
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("settings.apiKey.note")}
                        </p>
                    </div>
                )}

                {activeEngine === "tencent" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* SecretId */}
                        <div className="space-y-2">
                            <Label className="text-base">{t("settings.tencent.secretId")}</Label>
                            <Input
                                value={tencentId}
                                onChange={(e) => setTencentId(e.target.value)}
                                type="text"
                                placeholder={t("settings.tencent.placeholderId")}
                                spellCheck={false}
                                disabled={loading}
                                className="bg-background/50 backdrop-blur-sm"
                            />
                        </div>

                        {/* SecretKey */}
                        <div className="space-y-2">
                            <Label className="text-base">{t("settings.tencent.secretKey")}</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    value={tencentKey}
                                    onChange={(e) => setTencentKey(e.target.value)}
                                    type={showTencentKey ? "text" : "password"}
                                    placeholder={t("settings.tencent.placeholderKey")}
                                    className="flex-1 bg-background/50 backdrop-blur-sm"
                                    spellCheck={false}
                                    disabled={loading}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowTencentKey((v) => !v)}
                                >
                                    {showTencentKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Button>
                            </div>
                        </div>

                        {/* Region */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-base">
                                {t("settings.tencent.region")}
                                <Globe size={14} className="text-muted-foreground"/>
                            </Label>
                           
                            <Input
                                value={tencentRegion}
                                onChange={(e) => setTencentRegion(e.target.value)}
                                type="text"
                                placeholder="e.g. ap-guangzhou"
                                spellCheck={false}
                                disabled={loading}
                                className="bg-background/50 backdrop-blur-sm"
                            />
                        </div>
                        
                        <p className="text-xs text-muted-foreground pt-2">
                            {t("settings.tencent.note")}
                        </p>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4 pt-8">
                <Button
                    onClick={handleSave}
                    disabled={!canSave}
                    size="lg"
                    className={cn(
                        "w-32",
                        !canSave ? "bg-muted text-muted-foreground" : ""
                    )}
                >
                     {saving ? t("settings.saving") : t("settings.save")}
                </Button>

                <div className="min-h-[24px] text-sm">
                    {loading ? (
                        <span className="text-muted-foreground">
                        {t("settings.status.loading")}
                        </span>
                    ) : error ? (
                        <span className="text-destructive">
                        {error}
                        </span>
                    ) : saved ? (
                        <span className="inline-flex items-center gap-1.5 text-green-500 font-medium animate-in fade-in slide-in-from-left-2">
                        <Check size={18} /> {t("settings.status.saved")}
                        </span>
                    ) : null}
                </div>
            </div>
        </section>
    </SettingsLayout>
  );
}
