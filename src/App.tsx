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
import { AccessibilityGuard } from "./components/AccessibilityGuard";
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

  // Main window - use React Router for navigation
  const [permissionGranted, setPermissionGranted] = useState<boolean | false>(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  useEffect(() => {
      // Only check details if we are in the main flow (not translator/settings/etc hidden windows)
      // Actually, we've already determined windowLabel checks above.
      // If we are here, we are likely 'main'.
      // But we need to check specifically if we should run the guard.
      
      const check = async () => {
          if (windowLabel !== "translator" && windowLabel !== "settings") {
              // Check if we need permission (macOS)
               if (navigator.userAgent.includes("Mac")) {
                   try {
                       // Robust check: Plugin first, then Custom
                       const { checkAccessibilityPermission } = await import("tauri-plugin-macos-permissions-api");
                       let granted = false;
                       try {
                           granted = await checkAccessibilityPermission();
                       } catch (e) {
                           console.warn("App: Plugin check failed", e);
                       }
                       
                       if (!granted) {
                           const { invoke } = await import("@tauri-apps/api/core");
                           granted = await invoke<boolean>("check_accessibility");
                       }

                       console.log("App: Accessibility Permission:", granted);
                       setPermissionGranted(granted);
                   } catch (e) {
                       console.error("Failed to check accessibility:", e);
                   }
               } else {
                   setPermissionGranted(true);
               }
          }
          setCheckingPermission(false);
      };
      
      if (windowLabel !== "") {
          check();
      }
  }, [windowLabel]);

  // If we are still determining window label, show loading
  if (windowLabel === "") {
    return <div>Loading...</div>;
  }

  // Translator Window
  if (windowLabel === "translator") {
    // ... (existing code, ensure it returns)
    console.log("Rendering Translator component");
    return (
        <>
            <ThemeInitializer />
            <Translator />
        </>
    );
  }

  // Settings Window (Legacy)
  if (windowLabel === "settings") {
      console.log("Rendering Settings component");
      return <SettingsPage />;
  }

  // For Main Window
  if (checkingPermission) {
      return null; // Or loading
  }

  if (!permissionGranted) {
      return (
          <>
            <ThemeInitializer />
            <AccessibilityGuard onPermissionGranted={() => setPermissionGranted(true)} />
          </>
      );
  }

  // Main App Content
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
