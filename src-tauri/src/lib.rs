use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

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
    println!("get_selected_text called");

    // Simulate Ctrl+C to copy selected text
    println!("Creating Enigo instance...");
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| {
        eprintln!("Failed to create Enigo: {}", e);
        e.to_string()
    })?;
    println!("Enigo instance created");

    // Press Ctrl+C (or Cmd+C on macOS)
    #[cfg(target_os = "macos")]
    {
        println!("Simulating Cmd+C on macOS...");
        enigo.key(Key::Meta, Direction::Press).map_err(|e| {
            eprintln!("Failed to press Meta key: {}", e);
            e.to_string()
        })?;
        println!("Meta key pressed");

        enigo.key(Key::Unicode('c'), Direction::Click).map_err(|e| {
            eprintln!("Failed to click 'c' key: {}", e);
            e.to_string()
        })?;
        println!("'c' key clicked");

        enigo.key(Key::Meta, Direction::Release).map_err(|e| {
            eprintln!("Failed to release Meta key: {}", e);
            e.to_string()
        })?;
        println!("Meta key released");
    }

    #[cfg(not(target_os = "macos"))]
    {
        println!("Simulating Ctrl+C...");
        enigo.key(Key::Control, Direction::Press).map_err(|e| {
            eprintln!("Failed to press Control key: {}", e);
            e.to_string()
        })?;
        enigo.key(Key::Unicode('c'), Direction::Click).map_err(|e| {
            eprintln!("Failed to click 'c' key: {}", e);
            e.to_string()
        })?;
        enigo.key(Key::Control, Direction::Release).map_err(|e| {
            eprintln!("Failed to release Control key: {}", e);
            e.to_string()
        })?;
    }

    // Wait for clipboard to update
    println!("Waiting for clipboard to update...");
    std::thread::sleep(std::time::Duration::from_millis(100));

    // Read from clipboard
    println!("Reading from clipboard...");
    let mut clipboard = Clipboard::new().map_err(|e| {
        eprintln!("Failed to create clipboard: {}", e);
        e.to_string()
    })?;
    let text = clipboard.get_text().map_err(|e| {
        eprintln!("Failed to get text from clipboard: {}", e);
        e.to_string()
    })?;

    println!("Got text from clipboard: {}", text);
    Ok(text)
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
        .plugin(tauri_plugin_macos_permissions::init())
        .setup(|app| {
            let handle = app.handle().clone();

            // 为 translator 窗口应用 macOS 原生模糊效果
            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("translator") {
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(16.0))
                    .expect("Failed to apply vibrancy");
            }

            // Register global shortcut Alt+T
            let shortcut = "Alt+T";

            match app.global_shortcut()
                .on_shortcut(shortcut, move |_app, _event, _shortcut| {
                    println!("Global shortcut '{}' triggered", shortcut);

                    // Get translator window and emit event to it
                    if let Some(window) = handle.get_webview_window("translator") {
                        if let Err(e) = window.emit("global-shortcut-triggered", ()) {
                            eprintln!("Failed to emit event to translator window: {}", e);
                        } else {
                            println!("Event emitted to translator window");
                        }
                    } else {
                        eprintln!("Translator window not found");
                    }
                }) {
                Ok(_) => {
                    if let Err(e) = app.global_shortcut().register(shortcut) {
                        eprintln!("Failed to register global shortcut '{}': {}. Make sure the app has accessibility permissions.", shortcut, e);
                    } else {
                        println!("Global shortcut '{}' registered successfully", shortcut);
                    }
                }
                Err(e) => {
                    eprintln!("Failed to set up global shortcut handler '{}': {}. Make sure the app has accessibility permissions.", shortcut, e);
                }
            }

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
