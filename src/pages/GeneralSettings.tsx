import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { Monitor, Moon, Sun, Languages, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

export default function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div className="h-full bg-transparent p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
             <Settings className="text-primary" size={32} strokeWidth={2} />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {t("general.title")}
            </h1>
          </div>
        </div>

        {/* Theme Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Monitor size={20} />
              {t("general.theme.label")}
            </CardTitle>
            <CardDescription>
              Select your preferred appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="mb-2" size={24} />
                  <span className="font-semibold">{t("general.theme.light")}</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                   className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="mb-2" size={24} />
                  <span className="font-semibold">{t("general.theme.dark")}</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                   className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                    theme === "system"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Monitor className="mb-2" size={24} />
                  <span className="font-semibold">{t("general.theme.system")}</span>
                </button>
             </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Languages size={20} />
              {t("general.language")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Label htmlFor="language-select">Interface Language</Label>
              <Select
                value={i18n.language}
                onValueChange={changeLanguage}
              >
                <SelectTrigger id="language-select" className="w-[180px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (English)</SelectItem>
                  <SelectItem value="zh">中文 (Chinese)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
