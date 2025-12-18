import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info, Settings, Keyboard } from "lucide-react";

export default function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    {
      to: "/about",
      icon: Info,
      label: t("navigation.about"),
    },
    {
      to: "/model-settings",
      icon: Settings,
      label: t("navigation.modelSettings"),
    },
    {
      to: "/shortcut-settings",
      icon: Keyboard,
      label: t("navigation.shortcutSettings"),
    },
  ];

  return (
    <aside className="w-56 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-r border-white/20 dark:border-slate-700/30 flex flex-col">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/20 dark:border-slate-700/30">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          TypeTrans
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t("about.description")}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
