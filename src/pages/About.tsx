import { useTranslation } from "react-i18next";
import { Sparkles, Globe, Zap, Copy, Keyboard, Eye } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  const features = [
    { icon: Keyboard, key: "globalShortcut" },
    { icon: Eye, key: "smartText" },
    { icon: Eye, key: "floatingWindow" },
    { icon: Globe, key: "multiLanguage" },
    { icon: Zap, key: "realtime" },
    { icon: Copy, key: "quickCopy" },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="text-blue-500" size={32} strokeWidth={2} />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              {t("about.title")}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t("about.description")}
          </p>
        </div>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            {t("about.usage.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {step}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {t(`about.usage.step${step}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            {t("about.features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-5 border border-white/50 dark:border-slate-700/30 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                      <Icon
                        className="text-blue-600 dark:text-blue-400"
                        size={20}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {t(`about.features.${feature.key}`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
