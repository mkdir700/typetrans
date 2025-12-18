import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { Check, Eye, EyeOff, KeyRound, Settings as SettingsIcon } from "lucide-react";

type AppSettings = {
  zhipu_api_key?: string | null;
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

export default function ModelSettings() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const settings = await invoke<AppSettings>("get_app_settings");
        setApiKey(settings?.zhipu_api_key ?? "");
      } catch (e) {
        setError(normalizeError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSave = useMemo(() => {
    if (saving || loading) return false;
    return apiKey.trim().length > 0;
  }, [apiKey, loading, saving]);

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      await invoke("set_zhipu_api_key", { apiKey });
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
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 dark:border-slate-700/30 shadow-xl">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-6">
            <KeyRound size={20} strokeWidth={1.8} />
            <h2 className="text-xl font-semibold">{t("settings.title")}</h2>
          </div>

          <label className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-2 block">
            {t("settings.apiKey.label")}
          </label>

          <div className="flex items-center gap-3 mb-4">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showKey ? "text" : "password"}
              placeholder={t("settings.apiKey.placeholder")}
              className="flex-1 h-12 px-4 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              spellCheck={false}
              autoFocus
              disabled={loading}
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="h-12 w-12 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hover:bg-slate-500/10 dark:hover:bg-slate-400/10 border border-slate-200/70 dark:border-slate-700/60"
              aria-label={showKey ? "Hide API Key" : "Show API Key"}
              disabled={loading}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 mb-6">
            {t("settings.apiKey.note")}
          </p>

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
