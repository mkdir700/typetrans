import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";
import { Check, Eye, EyeOff, KeyRound, X } from "lucide-react";

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

export default function SettingsPage() {
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

  const handleClose = async () => {
    try {
      await getCurrentWindow().hide();
    } catch {
      await getCurrentWindow().close();
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col font-sans select-none rounded-2xl"
      style={{ background: "transparent" }}
    >
      <header
        onMouseDown={(e) => {
          const target = e.target as HTMLElement | null;
          if (e.buttons === 1 && !target?.closest("button")) {
            getCurrentWindow().startDragging();
          }
        }}
        className="flex items-center justify-between px-3 py-1.5 shrink-0 cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-slate-400/50 dark:bg-slate-500/50" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-500/10 dark:hover:bg-slate-400/10"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-3 px-3 pb-3 min-h-0">
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-4">
            <KeyRound size={18} strokeWidth={1.8} />
            <h2 className="text-[15px] font-semibold m-0">{t("settings.title")}</h2>
          </div>

          <label className="text-[13px] text-slate-600 dark:text-slate-300 font-medium mb-2">
            {t("settings.apiKey.label")}
          </label>

          <div className="flex items-center gap-2">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showKey ? "text" : "password"}
              placeholder={t("settings.apiKey.placeholder")}
              className="flex-1 h-10 px-3 rounded-xl bg-white/60 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-700/60 outline-none text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              spellCheck={false}
              autoFocus
              disabled={loading}
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hover:bg-slate-500/10 dark:hover:bg-slate-400/10"
              aria-label={showKey ? "Hide API Key" : "Show API Key"}
              disabled={loading}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <p className="mt-3 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
            {t("settings.apiKey.note")}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <div className="min-h-[20px] text-[12px]">
              {loading ? (
                <span className="text-slate-400 dark:text-slate-500">
                  {t("settings.status.loading")}
                </span>
              ) : error ? (
                <span className="text-rose-600 dark:text-rose-400">
                  {error}
                </span>
              ) : saved ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check size={14} /> {t("settings.status.saved")}
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
              className={`h-10 px-4 rounded-xl text-[13px] font-semibold transition-all ${
                canSave
                  ? "bg-blue-600 text-white hover:bg-blue-700"
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
