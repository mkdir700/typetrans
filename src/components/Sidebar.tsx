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
    <aside className="w-[220px] bg-muted/20 border-r border-border flex flex-col pt-6 pb-4">
      {/* Header */}
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          TypeTrans
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
            AI-Powered Translation
        </p>
      </div>

      <Separator className="bg-border mb-4 mx-4 w-auto" />

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
                    isActive ? "shadow-sm bg-accent" : ""
                 )
              }
            >
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 font-medium",
                    isActive 
                        ? "text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
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
          <p className="text-[10px] text-center text-muted-foreground/60">
             v0.1.0-beta
          </p>
       </div>
    </aside>
  );
}
