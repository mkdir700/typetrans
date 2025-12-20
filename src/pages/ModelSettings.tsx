import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { Check, Eye, EyeOff, KeyRound, Settings as SettingsIcon, Server, Globe } from "lucide-react";

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

export default function TranslationSettings() {
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
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <SettingsIcon className="text-blue-500" size={32} strokeWidth={2} />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              {t("modelSettings.title")}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t("modelSettings.description")}
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 dark:border-slate-700/30 shadow-xl space-y-8">
          
          {/* Engine Selection */}
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-4">
               <Server size={20} strokeWidth={1.8} />
               <h2 className="text-xl font-semibold">{t("settings.engine.label")}</h2>
            </div>
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
          </div>

          <hr className="border-slate-200 dark:border-slate-700/50" />

          {/* Configuration Fields */}
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-6">
                <KeyRound size={20} strokeWidth={1.8} />
                <h2 className="text-xl font-semibold">{t("settings.title")}</h2>
            </div>

            {activeEngine === "zhipu" && (
                <div className="space-y-4">
                    <label className="text-sm text-slate-600 dark:text-slate-300 font-medium block">
                        {t("settings.apiKey.label")}
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                        value={zhipuKey}
                        onChange={(e) => setZhipuKey(e.target.value)}
                        type={showKey ? "text" : "password"}
                        placeholder={t("settings.apiKey.placeholder")}
                        className="flex-1 h-12 px-4 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-mono"
                        spellCheck={false}
                        disabled={loading}
                        />
                        <button
                        onClick={() => setShowKey((v) => !v)}
                        className="h-12 w-12 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hover:bg-slate-500/10 dark:hover:bg-slate-400/10 border border-slate-200/70 dark:border-slate-700/60"
                        >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
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
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-medium block">
                            {t("settings.tencent.secretId")}
                        </label>
                        <input
                            value={tencentId}
                            onChange={(e) => setTencentId(e.target.value)}
                            type="text"
                            placeholder={t("settings.tencent.placeholderId")}
                            className="w-full h-12 px-4 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-mono"
                            spellCheck={false}
                            disabled={loading}
                        />
                    </div>

                    {/* SecretKey */}
                    <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-medium block">
                            {t("settings.tencent.secretKey")}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                value={tencentKey}
                                onChange={(e) => setTencentKey(e.target.value)}
                                type={showTencentKey ? "text" : "password"}
                                placeholder={t("settings.tencent.placeholderKey")}
                                className="flex-1 h-12 px-4 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-mono"
                                spellCheck={false}
                                disabled={loading}
                            />
                            <button
                                onClick={() => setShowTencentKey((v) => !v)}
                                className="h-12 w-12 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hover:bg-slate-500/10 dark:hover:bg-slate-400/10 border border-slate-200/70 dark:border-slate-700/60"
                            >
                                {showTencentKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Region */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                             <label className="text-sm text-slate-600 dark:text-slate-300 font-medium block">
                                {t("settings.tencent.region")}
                            </label>
                            <Globe size={14} className="text-slate-400"/>
                        </div>
                       
                        <input
                            value={tencentRegion}
                            onChange={(e) => setTencentRegion(e.target.value)}
                            type="text"
                            placeholder="e.g. ap-guangzhou"
                            className="w-full h-12 px-4 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-mono"
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

            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`h-12 px-6 rounded-xl text-sm font-semibold transition-all ${
                canSave
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:scale-105 active:scale-95"
                  : "bg-slate-200/70 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              }`}
            >
              {saving ? t("settings.saving") : t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
