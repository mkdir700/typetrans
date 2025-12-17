use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

// Translation response structure
#[derive(Debug, Serialize, Deserialize)]
struct TranslationResponse {
    translations: Vec<Translation>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Translation {
    text: String,
}

// Get translation from DeepL API
#[tauri::command]
async fn get_translation(text: String, target_lang: String) -> Result<String, String> {
    // TODO: Replace with your actual API key or load from environment variable
    let api_key = std::env::var("DEEPL_API_KEY").unwrap_or_else(|_| "YOUR_API_KEY".to_string());

    let client = reqwest::Client::new();
    let res = client
        .post("https://api-free.deepl.com/v2/translate")
        .header("Authorization", format!("DeepL-Auth-Key {}", api_key))
        .form(&[
            ("text", text.as_str()),
            ("target_lang", target_lang.as_str()),
        ])
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let translation_response: TranslationResponse = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(translation_response
        .translations
        .first()
        .map(|t| t.text.clone())
        .unwrap_or_else(|| "Translation failed".to_string()))
}

// Get selected text from clipboard
#[tauri::command]
async fn get_selected_text() -> Result<String, String> {
    // Simulate Ctrl+C to copy selected text
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    // Press Ctrl+C (or Cmd+C on macOS)
    #[cfg(target_os = "macos")]
    {
        enigo.key(Key::Meta, Direction::Press).map_err(|e| e.to_string())?;
        enigo.key(Key::Unicode('c'), Direction::Click).map_err(|e| e.to_string())?;
        enigo.key(Key::Meta, Direction::Release).map_err(|e| e.to_string())?;
    }

    #[cfg(not(target_os = "macos"))]
    {
        enigo.key(Key::Control, Direction::Press).map_err(|e| e.to_string())?;
        enigo.key(Key::Unicode('c'), Direction::Click).map_err(|e| e.to_string())?;
        enigo.key(Key::Control, Direction::Release).map_err(|e| e.to_string())?;
    }

    // Wait for clipboard to update
    std::thread::sleep(std::time::Duration::from_millis(100));

    // Read from clipboard
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.get_text().map_err(|e| e.to_string())
}

// Copy text to clipboard
#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())
}

// Show translator window
#[tauri::command]
async fn show_translator_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("translator")
        .ok_or("Translator window not found")?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

// Hide translator window
#[tauri::command]
async fn hide_translator_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("translator")
        .ok_or("Translator window not found")?;

    window.hide().map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();

            // Register global shortcut Alt+T
            let shortcut = "Alt+T";

            app.global_shortcut()
                .on_shortcut(shortcut, move |_app, _event, _shortcut| {
                    println!("Global shortcut '{}' triggered", shortcut);

                    // Emit event to trigger translation workflow
                    handle.emit("global-shortcut-triggered", ()).unwrap();
                })
                .unwrap();

            app.global_shortcut().register(shortcut).unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_translation,
            get_selected_text,
            copy_to_clipboard,
            show_translator_window,
            hide_translator_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
