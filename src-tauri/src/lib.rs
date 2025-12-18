use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[derive(Debug, Serialize)]
struct GlmChatCompletionRequest {
    model: String,
    messages: Vec<GlmMessage>,
    temperature: f32,
    top_p: f32,
    stream: bool,
    do_sample: bool,
    response_format: GlmResponseFormat,
}

#[derive(Debug, Serialize)]
struct GlmResponseFormat {
    #[serde(rename = "type")]
    kind: String,
}

#[derive(Debug, Serialize)]
struct GlmMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct GlmChatCompletionResponse {
    choices: Vec<GlmChoice>,
}

#[derive(Debug, Deserialize)]
struct GlmChoice {
    message: GlmAssistantMessage,
}

#[derive(Debug, Deserialize)]
struct GlmAssistantMessage {
    content: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(default)]
struct AppSettings {
    zhipu_api_key: Option<String>,
}

fn app_settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to resolve app config dir: {}", e))?;
    Ok(dir.join("settings.json"))
}

async fn read_app_settings(app: &AppHandle) -> Result<AppSettings, String> {
    let path = app_settings_path(app)?;
    let data = match tokio::fs::read_to_string(&path).await {
        Ok(data) => data,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(AppSettings::default()),
        Err(e) => return Err(format!("Failed to read settings: {}", e)),
    };

    serde_json::from_str(&data).map_err(|e| format!("Failed to parse settings: {}", e))
}

async fn write_app_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), String> {
    let path = app_settings_path(app)?;
    if let Some(dir) = path.parent() {
        tokio::fs::create_dir_all(dir)
            .await
            .map_err(|e| format!("Failed to create settings dir: {}", e))?;
    }
    let data = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    tokio::fs::write(&path, data)
        .await
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn get_app_settings(app: AppHandle) -> Result<AppSettings, String> {
    read_app_settings(&app).await
}

#[tauri::command]
async fn set_zhipu_api_key(app: AppHandle, api_key: String) -> Result<(), String> {
    let mut settings = read_app_settings(&app).await.unwrap_or_default();
    let trimmed = api_key.trim().to_string();
    settings.zhipu_api_key = if trimmed.is_empty() { None } else { Some(trimmed) };
    write_app_settings(&app, &settings).await
}

fn normalize_target_language(target_lang: &str) -> String {
    let normalized = target_lang.trim().to_ascii_uppercase();
    match normalized.as_str() {
        "ZH" | "ZH-CN" | "ZH_CN" | "ZH-HANS" | "CHINESE" => "中文".to_string(),
        "EN" | "EN-US" | "EN_GB" | "EN-GB" | "ENGLISH" => "英文".to_string(),
        "JA" | "JP" | "JAPANESE" => "日文".to_string(),
        _ => target_lang.trim().to_string(),
    }
}

fn strip_code_fences(text: &str) -> String {
    let trimmed = text.trim();
    if trimmed.starts_with("```") && trimmed.ends_with("```") {
        let without_start = trimmed.trim_start_matches("```");
        let without_lang = without_start
            .trim_start_matches(|c: char| c.is_ascii_alphanumeric() || c == '-')
            .trim_start_matches(|c: char| c == '\n' || c == '\r' || c == ' ');
        let without_end = without_lang.trim_end_matches("```").trim();
        return without_end.to_string();
    }
    trimmed.to_string()
}

// Get translation from Zhipu AI (GLM) API
#[tauri::command]
async fn get_translation(app: AppHandle, text: String, target_lang: String) -> Result<String, String> {
    let settings = read_app_settings(&app).await.unwrap_or_default();
    let api_key = settings
        .zhipu_api_key
        .or_else(|| std::env::var("ZHIPU_API_KEY").ok())
        .ok_or_else(|| "未配置智谱 AI API Key：请在设置页填写或设置环境变量 ZHIPU_API_KEY".to_string())?;

    let target = normalize_target_language(&target_lang);
    let system_prompt = format!(
        "你是一个专业翻译引擎。请将用户提供的文本翻译成{target}。要求：仅输出译文纯文本，不要添加解释、引号、Markdown、编号或多余内容；尽量保留原文换行与格式。",
    );

    let payload = GlmChatCompletionRequest {
        model: "glm-4.6".to_string(),
        messages: vec![
            GlmMessage {
                role: "system".to_string(),
                content: system_prompt,
            },
            GlmMessage {
                role: "user".to_string(),
                content: text,
            },
        ],
        temperature: 0.2,
        top_p: 0.9,
        stream: false,
        do_sample: false,
        response_format: GlmResponseFormat {
            kind: "text".to_string(),
        },
    };

    let client = reqwest::Client::new();
    let res = client
        .post("https://open.bigmodel.cn/api/paas/v4/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!("接口返回错误 ({}): {}", status, body));
    }

    let data: GlmChatCompletionResponse = res
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    let content = data
        .choices
        .first()
        .map(|c| c.message.content.clone())
        .unwrap_or_else(|| "翻译失败：未返回内容".to_string());

    Ok(strip_code_fences(&content))
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

// Show settings window
#[tauri::command]
async fn show_settings_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("settings")
        .ok_or("Settings window not found")?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

// Hide settings window
#[tauri::command]
async fn hide_settings_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("settings")
        .ok_or("Settings window not found")?;

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

            // 为 settings 窗口应用 macOS 原生模糊效果
            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("settings") {
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
            get_app_settings,
            set_zhipu_api_key,
            get_translation,
            get_selected_text,
            copy_to_clipboard,
            show_translator_window,
            hide_translator_window,
            show_settings_window,
            hide_settings_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
