import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { Monitor, Moon, Sun, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { SettingsLayout } from "../components/SettingsLayout";

export default function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <SettingsLayout
      title={t("general.title")}
      description="Manage your preferences and interface settings."
    >
      {/* Theme Settings Section */}
      <section>
          <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  {t("general.theme.label")}
              </h2>
              <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application.
              </p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                  theme === "light"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-transparent bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground"
                )}
              >
                <Sun className="mb-3 w-8 h-8 transition-transform group-hover:scale-110 duration-300" />
                <span className="font-medium">{t("general.theme.light")}</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                 className={cn(
                  "group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                  theme === "dark"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-transparent bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground"
                )}
              >
                <Moon className="mb-3 w-8 h-8 transition-transform group-hover:scale-110 duration-300" />
                <span className="font-medium">{t("general.theme.dark")}</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                 className={cn(
                  "group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                  theme === "system"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-transparent bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground"
                )}
              >
                <Monitor className="mb-3 w-8 h-8 transition-transform group-hover:scale-110 duration-300" />
                <span className="font-medium">{t("general.theme.system")}</span>
              </button>
           </div>
      </section>

      <Separator />

      {/* Language Settings Section */}
      <section>
          <div className="flex flex-col gap-1 mb-6">
               <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  {t("general.language")}
               </h2>
               <p className="text-sm text-muted-foreground">
                  Select the language for the user interface.
               </p>
          </div>

          <div className="flex items-center justify-between max-w-lg p-1">
            <Label htmlFor="language-select" className="text-base font-medium text-foreground">
              Interface Language
            </Label>
            <Select
              value={i18n.language}
              onValueChange={changeLanguage}
            >
              <SelectTrigger id="language-select" className="w-[240px] bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (English)</SelectItem>
                <SelectItem value="zh">中文 (Chinese)</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </section>
    </SettingsLayout>
  );
}
