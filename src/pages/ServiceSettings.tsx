import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { Check, Eye, EyeOff, KeyRound, Settings as SettingsIcon, Server, Globe } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,

} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

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
    <div className="h-full bg-transparent p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <SettingsIcon className="text-blue-500" size={32} strokeWidth={2} />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {t("modelSettings.title")}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t("modelSettings.description")}
          </p>
        </div>

        {/* Settings Card */}
        <Card className="border-white/20 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
                <Server size={20} strokeWidth={1.8} />
                {t("settings.engine.label")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Engine Selection */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveEngine("zhipu")}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        activeEngine === "zhipu"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-600 dark:text-slate-400"
                    }`}
                >
                    <span className="font-semibold">{t("settings.engine.zhipu")}</span>
                </button>
                <button
                    onClick={() => setActiveEngine("tencent")}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        activeEngine === "tencent"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-600 dark:text-slate-400"
                    }`}
                >
                    <span className="font-semibold">{t("settings.engine.tencent")}</span>
                </button>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700/50" />

            {/* Configuration Fields */}
            <div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-6">
                    <KeyRound size={20} strokeWidth={1.8} />
                    <h2 className="text-xl font-semibold">{t("settings.title")}</h2>
                </div>

                {activeEngine === "zhipu" && (
                    <div className="space-y-4">
                        <Label>{t("settings.apiKey.label")}</Label>
                        <div className="flex items-center gap-3">
                            <Input
                            value={zhipuKey}
                            onChange={(e) => setZhipuKey(e.target.value)}
                            type={showKey ? "text" : "password"}
                            placeholder={t("settings.apiKey.placeholder")}
                            className="flex-1 bg-white/80 dark:bg-slate-900/40"
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t("settings.apiKey.note")}
                        </p>
                    </div>
                )}

                {activeEngine === "tencent" && (
                    <div className="space-y-6">
                        {/* SecretId */}
                        <div className="space-y-2">
                            <Label>{t("settings.tencent.secretId")}</Label>
                            <Input
                                value={tencentId}
                                onChange={(e) => setTencentId(e.target.value)}
                                type="text"
                                placeholder={t("settings.tencent.placeholderId")}
                                className="bg-white/80 dark:bg-slate-900/40"
                                spellCheck={false}
                                disabled={loading}
                            />
                        </div>

                        {/* SecretKey */}
                        <div className="space-y-2">
                            <Label>{t("settings.tencent.secretKey")}</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    value={tencentKey}
                                    onChange={(e) => setTencentKey(e.target.value)}
                                    type={showTencentKey ? "text" : "password"}
                                    placeholder={t("settings.tencent.placeholderKey")}
                                    className="flex-1 bg-white/80 dark:bg-slate-900/40"
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
                            <Label className="flex items-center gap-2">
                                {t("settings.tencent.region")}
                                <Globe size={14} className="text-slate-400"/>
                            </Label>
                           
                            <Input
                                value={tencentRegion}
                                onChange={(e) => setTencentRegion(e.target.value)}
                                type="text"
                                placeholder="e.g. ap-guangzhou"
                                className="bg-white/80 dark:bg-slate-900/40"
                                spellCheck={false}
                                disabled={loading}
                            />
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                            {t("settings.tencent.note")}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/30">
                <div className="min-h-[24px] text-sm">
                {loading ? (
                    <span className="text-slate-400 dark:text-slate-500">
                    {t("settings.status.loading")}
                    </span>
                ) : error ? (
                    <span className="text-rose-600 dark:text-rose-400">
                    {error}
                    </span>
                ) : saved ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check size={16} /> {t("settings.status.saved")}
                    </span>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500">
                    &nbsp;
                    </span>
                )}
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!canSave}
                    className={canSave ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                >
                     {saving ? t("settings.saving") : t("settings.save")}
                </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
