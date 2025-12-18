import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useTranslation } from "react-i18next";
import Translator from "./Translator";
import PermissionCheck from "./PermissionCheck";
import SettingsPage from "./SettingsPage";
import "./App.css";

function App() {
  const { t } = useTranslation();
  const [windowLabel, setWindowLabel] = useState<string>("");

  useEffect(() => {
    // Get current window label to determine which component to render
    const currentWindow = getCurrentWebviewWindow();
    console.log("Current window label:", currentWindow.label);
    setWindowLabel(currentWindow.label);
  }, []);

  console.log("Rendering App with windowLabel:", windowLabel);

  // Render different components based on window label
  if (windowLabel === "translator") {
    console.log("Rendering Translator component");
    return <Translator />;
  }

  if (windowLabel === "settings") {
    console.log("Rendering Settings component");
    return <SettingsPage />;
  }

  // Show loading state while determining window label
  if (windowLabel === "") {
    return <div>Loading...</div>;
  }

  // Main window - can be used for settings or hidden
  console.log("Rendering main window");
  return (
    <div className="main-container">
      <h1>{t("dashboard.title")}</h1>

      {/* macOS Permission Check */}
      <PermissionCheck />

      <div className="info-section">
        <h2>{t("dashboard.instructions.title")}</h2>
        <ul>
          <li>{t("dashboard.instructions.step1")}</li>
          <li>{t("dashboard.instructions.step2")}</li>
          <li>{t("dashboard.instructions.step3")}</li>
          <li>{t("dashboard.instructions.step4")}</li>
        </ul>

        <h2>{t("dashboard.languages.title")}</h2>
        <ul>
          <li>{t("dashboard.languages.zh")}</li>
          <li>{t("dashboard.languages.en")}</li>
          <li>{t("dashboard.languages.ja")}</li>
        </ul>

        <div className="note">
          <strong>{t("dashboard.note.title")}</strong> {t("dashboard.note.body")}
        </div>
      </div>
    </div>
  );
}

export default App;
