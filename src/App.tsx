import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Translator from "./Translator";
import SettingsPage from "./SettingsPage";
import Home from "./Home";
import About from "./pages/About";
import ModelSettings from "./pages/ModelSettings";
import ShortcutSettings from "./pages/ShortcutSettings";
import "./App.css";

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

  // Main window - use React Router for navigation
  console.log("Rendering main window with routing");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Navigate to="/about" replace />} />
          <Route path="about" element={<About />} />
          <Route path="model-settings" element={<ModelSettings />} />
          <Route path="shortcut-settings" element={<ShortcutSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

