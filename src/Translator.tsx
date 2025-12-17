import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import "./Translator.css";

function Translator() {
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("ZH"); // Default to Chinese

  useEffect(() => {
    // Listen for global shortcut trigger
    const unlisten = listen("global-shortcut-triggered", async () => {
      console.log("Global shortcut triggered, getting selected text...");

      try {
        // Get selected text from clipboard
        const text = await invoke<string>("get_selected_text");
        console.log("Selected text:", text);

        if (text && text.trim()) {
          setOriginalText(text);
          setTranslatedText("");
          setIsLoading(true);

          // Show translator window
          await invoke("show_translator_window");

          // Get translation
          try {
            const translation = await invoke<string>("get_translation", {
              text: text,
              targetLang: targetLang,
            });
            setTranslatedText(translation);
          } catch (error) {
            console.error("Translation error:", error);
            setTranslatedText(`Translation error: ${error}`);
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error getting selected text:", error);
        setIsLoading(false);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [targetLang]);

  const handleCopy = async () => {
    try {
      await invoke("copy_to_clipboard", { text: translatedText });
      console.log("Copied to clipboard");
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const handleClose = async () => {
    try {
      await invoke("hide_translator_window");
      setOriginalText("");
      setTranslatedText("");
    } catch (error) {
      console.error("Close error:", error);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setTargetLang(lang);
  };

  return (
    <div className="translator-container">
      <div className="translator-header">
        <div className="language-selector">
          <button
            className={targetLang === "ZH" ? "active" : ""}
            onClick={() => handleLanguageChange("ZH")}
          >
            中文
          </button>
          <button
            className={targetLang === "EN" ? "active" : ""}
            onClick={() => handleLanguageChange("EN")}
          >
            English
          </button>
          <button
            className={targetLang === "JA" ? "active" : ""}
            onClick={() => handleLanguageChange("JA")}
          >
            日本語
          </button>
        </div>
        <button className="close-btn" onClick={handleClose}>
          ✕
        </button>
      </div>

      <div className="translator-content">
        <div className="text-section">
          <div className="section-label">Original</div>
          <div className="text-box original-text">{originalText}</div>
        </div>

        <div className="divider">→</div>

        <div className="text-section">
          <div className="section-label">Translation</div>
          <div className="text-box translated-text">
            {isLoading ? (
              <div className="loading">Translating...</div>
            ) : (
              translatedText
            )}
          </div>
        </div>
      </div>

      <div className="translator-footer">
        <button
          className="copy-btn"
          onClick={handleCopy}
          disabled={!translatedText || isLoading}
        >
          Copy Translation
        </button>
      </div>
    </div>
  );
}

export default Translator;
