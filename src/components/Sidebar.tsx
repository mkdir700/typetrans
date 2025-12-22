import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, Keyboard, Server } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

export default function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    {
      to: "/general",
      icon: Settings,
      label: t("navigation.general"),
    },
    {
      to: "/service-settings",
      icon: Server,
      label: t("navigation.serviceSettings"),
    },
    {
      to: "/shortcut-settings",
      icon: Keyboard,
      label: t("navigation.shortcutSettings"),
    },
  ];

  return (
    <aside className="w-[220px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-r border-white/20 dark:border-slate-700/30 flex flex-col pt-6 pb-4">
      {/* Header */}
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          TypeTrans
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            AI-Powered Translation
        </p>
      </div>

      <Separator className="bg-slate-200/50 dark:bg-slate-700/50 mb-4 mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                 cn(
                     "block rounded-lg transition-all duration-200",
                    isActive ? "shadow-md" : ""
                 )
              }
            >
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 font-medium",
                    isActive 
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Button>
              )}
            </NavLink>
          );
        })}
      </nav>
      
       <div className="px-6 mt-auto">
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-600">
             v0.1.0-beta
          </p>
       </div>
    </aside>
  );
}
