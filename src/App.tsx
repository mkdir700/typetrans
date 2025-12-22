import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Translator from "./Translator";
import SettingsPage from "./SettingsPage"; // Keep for backward compatibility if needed, or remove if unused
import Home from "./Home";
import GeneralSettings from "./pages/GeneralSettings";
import ServiceSettings from "./pages/ServiceSettings";
import ShortcutSettings from "./pages/ShortcutSettings";
import About from "./pages/About";
import { useTheme } from "./hooks/useTheme";
import "./App.css";

// Initialize theme
function ThemeInitializer() {
    useTheme();
    return null;
}

function App() {
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
    // Ensure theme is applied for translator window too if it uses the hook internally or we can wrap it
    return (
        <>
            <ThemeInitializer />
            <Translator />
        </>
    );
  }

  // Legacy settings window if it still exists
  if (windowLabel === "settings") {
    console.log("Rendering Settings component");
    return <SettingsPage />;
  }

  // Show loading state while determining window label
  if (windowLabel === "") {
    return <div>Loading...</div>;
  }

  // Main window - use React Router for navigation
  console.log("Rendering main window with routing");
  return (
    <>
        <ThemeInitializer />
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />}>
            <Route index element={<Navigate to="/general" replace />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="service-settings" element={<ServiceSettings />} />
            <Route path="shortcut-settings" element={<ShortcutSettings />} />
            <Route path="about" element={<About />} />
            </Route>
        </Routes>
        </BrowserRouter>
    </>
  );
}

export default App;
