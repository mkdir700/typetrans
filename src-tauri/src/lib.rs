use arboard::Clipboard;
use chrono::Utc;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use hex;
use hmac::{Hmac, Mac};
use log::{debug, error, info, warn};
// use mouse_position::mouse_position::Mouse;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::PathBuf;
use std::{thread, time};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
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

#[derive(Debug, Serialize, Deserialize)]
#[serde(default)]
struct AppSettings {
    zhipu_api_key: Option<String>,
    tencent_secret_id: Option<String>,
    tencent_secret_key: Option<String>,
    tencent_region: Option<String>,
    active_engine: String, // "zhipu" or "tencent"
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            zhipu_api_key: None,
            tencent_secret_id: None,
            tencent_secret_key: None,
            tencent_region: Some("ap-guangzhou".to_string()),
            active_engine: "zhipu".to_string(),
        }
    }
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
    settings.zhipu_api_key = if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    };
    write_app_settings(&app, &settings).await
}

#[tauri::command]
async fn set_tencent_config(
    app: AppHandle,
    secret_id: String,
    secret_key: String,
    region: String,
) -> Result<(), String> {
    let mut settings = read_app_settings(&app).await.unwrap_or_default();

    let secret_id = secret_id.trim().to_string();
    settings.tencent_secret_id = if secret_id.is_empty() {
        None
    } else {
        Some(secret_id)
    };

    let secret_key = secret_key.trim().to_string();
    settings.tencent_secret_key = if secret_key.is_empty() {
        None
    } else {
        Some(secret_key)
    };

    let region = region.trim().to_string();
    settings.tencent_region = if region.is_empty() {
        Some("ap-guangzhou".to_string())
    } else {
        Some(region)
    };

    write_app_settings(&app, &settings).await
}

#[tauri::command]
async fn set_active_engine(app: AppHandle, engine: String) -> Result<(), String> {
    let mut settings = read_app_settings(&app).await.unwrap_or_default();
    match engine.as_str() {
        "zhipu" | "tencent" => {
            settings.active_engine = engine;
            write_app_settings(&app, &settings).await
        }
        _ => Err("Invalid engine name".to_string()),
    }
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

// --- Tencent Cloud Implementation ---

#[derive(Serialize)]
#[allow(non_snake_case)]
struct TencentRequest<'a> {
    SourceText: &'a str,
    Source: &'a str,
    Target: &'a str,
    ProjectId: i64,
}

#[derive(Deserialize)]
struct TencentResponse {
    #[serde(rename = "Response")]
    response: TencentResponseData,
}

#[derive(Deserialize)]
struct TencentResponseData {
    #[serde(rename = "TargetText")]
    target_text: String,
    #[serde(rename = "Error")]
    error: Option<TencentError>,
}

#[derive(Deserialize)]
struct TencentError {
    #[serde(rename = "Code")]
    code: String,
    #[serde(rename = "Message")]
    message: String,
}

async fn translate_tencent(
    settings: AppSettings,
    text: String,
    target_lang: String,
) -> Result<String, String> {
    let secret_id = settings.tencent_secret_id.ok_or("未配置腾讯云 SecretId")?;
    let secret_key = settings
        .tencent_secret_key
        .ok_or("未配置腾讯云 SecretKey")?;
    let region = settings
        .tencent_region
        .unwrap_or_else(|| "ap-guangzhou".to_string());

    let host = "tmt.tencentcloudapi.com";
    let service = "tmt";
    let action = "TextTranslate";
    let version = "2018-03-21";
    let timestamp = Utc::now().timestamp();
    let date = Utc::now().format("%Y-%m-%d").to_string();

    let target = match target_lang.to_ascii_lowercase().as_str() {
        "zh" | "zh-cn" => "zh",
        "en" | "en-us" => "en",
        "ja" | "jp" => "ja",
        "ko" | "kr" => "ko",
        _ => &target_lang,
    };

    let payload = TencentRequest {
        SourceText: &text,
        Source: "auto",
        Target: target,
        ProjectId: 0,
    };
    let payload_str = serde_json::to_string(&payload).map_err(|e| e.to_string())?;

    // Signature V3
    let canonical_headers = format!("content-type:application/json\nhost:{}\n", host);
    let signed_headers = "content-type;host";
    let hashed_request_payload = hex::encode(Sha256::digest(payload_str.as_bytes()));
    let canonical_request = format!(
        "POST\n/\n\n{}\n{}\n{}",
        canonical_headers, signed_headers, hashed_request_payload
    );

    let credential_scope = format!("{}/{}/tc3_request", date, service);
    let hashed_canonical_request = hex::encode(Sha256::digest(canonical_request.as_bytes()));
    let string_to_sign = format!(
        "TC3-HMAC-SHA256\n{}\n{}\n{}",
        timestamp, credential_scope, hashed_canonical_request
    );

    let k_secret = format!("TC3{}", secret_key);
    let k_date = hmac_sha256(k_secret.as_bytes(), date.as_bytes());
    let k_service = hmac_sha256(&k_date, service.as_bytes());
    let k_signing = hmac_sha256(&k_service, "tc3_request".as_bytes());
    let signature = hex::encode(hmac_sha256(&k_signing, string_to_sign.as_bytes()));

    let authorization = format!(
        "TC3-HMAC-SHA256 Credential={}/{}, SignedHeaders={}, Signature={}",
        secret_id, credential_scope, signed_headers, signature
    );

    let client = reqwest::Client::new();
    let res = client
        .post(format!("https://{}", host))
        .header("Content-Type", "application/json")
        .header("Authorization", authorization)
        .header("Host", host)
        .header("X-TC-Action", action)
        .header("X-TC-Version", version)
        .header("X-TC-Timestamp", timestamp.to_string())
        .header("X-TC-Region", region)
        .body(payload_str)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let resp_data: TencentResponse = res
        .json()
        .await
        .map_err(|e| format!("Parse error: {}", e))?;

    if let Some(err) = resp_data.response.error {
        return Err(format!("Tencent API Error ({}): {}", err.code, err.message));
    }

    Ok(resp_data.response.target_text)
}

fn hmac_sha256(key: &[u8], data: &[u8]) -> Vec<u8> {
    type HmacSha256 = Hmac<Sha256>;
    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC can take any key length");
    mac.update(data);
    mac.finalize().into_bytes().to_vec()
}

// Get translation from Active Engine
#[tauri::command]
async fn get_translation(
    app: AppHandle,
    text: String,
    target_lang: String,
    tone: String,
) -> Result<String, String> {
    let settings = read_app_settings(&app).await.unwrap_or_default();

    if settings.active_engine == "tencent" {
        return translate_tencent(settings, text, target_lang).await;
    }

    // Default to Zhipu (GLM)
    info!(
        "[get_translation] Using Zhipu AI. Text length: {}, target: {}, tone: {}",
        text.len(),
        target_lang,
        tone
    );

    let api_key = settings
        .zhipu_api_key
        .or_else(|| std::env::var("ZHIPU_API_KEY").ok())
        .ok_or_else(|| {
            error!("[get_translation] No API key configured");
            "未配置智谱 AI API Key：请在设置页配置".to_string()
        })?;

    let target = normalize_target_language(&target_lang);

    // Adjust the instruction based on the tone
    let tone_instruction = match tone.as_str() {
        "Formal" => "Use a professional, formal, and polite tone suitable for business contexts.",
        "Casual" => "Use a casual, natural, and conversational tone as used in daily life.",
        "Academic" => "Use an academic, rigorous, and objective tone with appropriate terminology.",
        "Creative" => {
            "Use a creative, vivid, and expressive tone with literary devices if appropriate."
        }
        _ => "Use a natural and fluent tone.",
    };

    let system_prompt = format!(
        "You are a professional translation engine. Translate the provided text into {target}. {tone_instruction} Requirements: Output ONLY the translated text without explanations, quotes, Markdown, numbering, or extra content. Preserve original line breaks and formatting as much as possible.",
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
    info!("[get_selected_text] Called");

    // Read from clipboard directly - user should copy text first (Cmd+C)
    debug!("[get_selected_text] Reading from clipboard");
    let mut clipboard = Clipboard::new().map_err(|e| {
        error!("[get_selected_text] Failed to create clipboard: {}", e);
        format!("Failed to access clipboard: {}", e)
    })?;

    let text = clipboard.get_text().unwrap_or_default();

    if text.trim().is_empty() {
        warn!("[get_selected_text] Clipboard is empty");
        return Err(
            "No text in clipboard. Please copy text first (Cmd+C), then use Alt+T.".to_string(),
        );
    }

    info!(
        "[get_selected_text] Got text from clipboard, length: {}",
        text.len()
    );
    Ok(text)
}

// Copy text to clipboard
#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())
}

// Show translator window at cursor position
#[tauri::command]
async fn show_translator_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("translator")
        .ok_or("Translator window not found")?;

    // Calculate center position
    let mut final_x = 0;
    let mut final_y = 0;

    if let Some(monitor) = window.current_monitor().map_err(|e| e.to_string())? {
        let screen_size = monitor.size();
        let screen_pos = monitor.position();
        let window_size = window.outer_size().map_err(|e| e.to_string())?;

        final_x = screen_pos.x + (screen_size.width as i32 - window_size.width as i32) / 2;
        final_y = screen_pos.y + (screen_size.height as i32 - window_size.height as i32) / 2;
    }

    /*
    // PREVIOUS LOGIC (Preserved): Show near cursor
    // Get mouse position
    let position = Mouse::get_mouse_position();
    let (mut mouse_x, mut mouse_y) = match position {
        Mouse::Position { x, y } => (x, y),
        Mouse::Error => {
            warn!("Failed to get mouse position, using default");
            (0, 0) // Default fallback, though ideally center or cached
        }
    };

    // Get monitor info to handle boundaries
    if let Some(monitor) = window.current_monitor().map_err(|e| e.to_string())? {
        let screen_size = monitor.size();
        let screen_pos = monitor.position();
        let _scale_factor = monitor.scale_factor();

        // Window size (physical)
        let window_size = window.outer_size().map_err(|e| e.to_string())?;

        // Logical to physical might be needed if mouse is in logical?
        // Mouse::get_mouse_position usually returns physical coordinates on screen?
        // It depends on the OS. On macOS, it's often logical points or physical pixels.
        // We'll assume physical for now regarding collision with monitor bounds,
        // but `window.set_position` takes PhysicalPosition.

        let win_w = window_size.width as i32;
        let win_h = window_size.height as i32;
        let screen_w = screen_size.width as i32;
        let screen_h = screen_size.height as i32;
        let screen_x = screen_pos.x;
        let screen_y = screen_pos.y;

        // Add a small offset so it doesn't appear exactly under the cursor (blocking view)
        mouse_x += 10;
        mouse_y += 10;

        // Boundary checks
        // Right edge
        if mouse_x + win_w > screen_x + screen_w {
            mouse_x = screen_x + screen_w - win_w - 10;
        }
        // Bottom edge
        if mouse_y + win_h > screen_y + screen_h {
            mouse_y = mouse_y - win_h - 20; // Show above cursor if no space below
        }
        // Left edge (unlikely with mouse_x + 10, but good practice)
        if mouse_x < screen_x {
            mouse_x = screen_x + 10;
        }
        // Top edge
        if mouse_y < screen_y {
            mouse_y = screen_y + 10;
        }
    }
    */

    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: final_x,
            y: final_y,
        }))
        .map_err(|e| e.to_string())?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

/// Hide the application to return focus to the previous app
/// On macOS, uses native `NSApplication hide:`
/// On other platforms, hides the main window to ensure focus yields
fn hide_application(_app: &AppHandle) {
    #[cfg(target_os = "macos")]
    {
        use objc::{class, msg_send, sel, sel_impl};
        unsafe {
            let ns_app: *mut objc::runtime::Object =
                msg_send![class!(NSApplication), sharedApplication];
            let _: () = msg_send![ns_app, hide: std::ptr::null::<objc::runtime::Object>()];
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        if let Some(window) = _app.get_webview_window("main") {
            let _ = window.hide();
        }
    }
}

// Paste translation to the previous active window
#[tauri::command]
async fn paste_translation(app: AppHandle, text: String) -> Result<(), String> {
    // 1. Copy text to clipboard
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())?;

    // 2. Hide translator window
    if let Some(translator_window) = app.get_webview_window("translator") {
        let _ = translator_window.hide();
    }

    // 3. Hide application properly to return focus
    hide_application(&app);

    // Use std::thread::spawn instead of tokio spawn to avoid issues with
    // blocking operations (Enigo) in async context
    std::thread::spawn(move || {
        // Wait for app to hide and focus to switch to previous app
        thread::sleep(time::Duration::from_millis(300));

        // 4. Simulate Cmd+V
        match Enigo::new(&Settings::default()) {
            Ok(mut enigo) => {
                info!("Starting paste sequence");
                #[cfg(target_os = "macos")]
                {
                    // macOS keycode for 'V' is 9
                    const V_KEYCODE: u16 = 9;

                    debug!("macOS: Pressing Cmd");
                    // Cmd Press
                    if let Err(e) = enigo.key(Key::Meta, Direction::Press) {
                        error!("Failed to press Meta: {:?}", e);
                        return;
                    }
                    thread::sleep(time::Duration::from_millis(50));

                    debug!("macOS: Pressing V (raw keycode {})", V_KEYCODE);
                    // V Press using raw keycode
                    if let Err(e) = enigo.raw(V_KEYCODE, Direction::Press) {
                        error!("Failed to press V: {:?}", e);
                        // Try to release Meta before returning
                        let _ = enigo.key(Key::Meta, Direction::Release);
                        return;
                    }
                    thread::sleep(time::Duration::from_millis(50));

                    debug!("macOS: Releasing V (raw keycode {})", V_KEYCODE);
                    // V Release using raw keycode
                    if let Err(e) = enigo.raw(V_KEYCODE, Direction::Release) {
                        error!("Failed to release V: {:?}", e);
                    }
                    thread::sleep(time::Duration::from_millis(50));

                    debug!("macOS: Releasing Cmd");
                    // Cmd Release
                    if let Err(e) = enigo.key(Key::Meta, Direction::Release) {
                        error!("Failed to release Meta: {:?}", e);
                    }
                }

                #[cfg(not(target_os = "macos"))]
                {
                    debug!("Non-macOS: Pressing Control");
                    if let Err(e) = enigo.key(Key::Control, Direction::Press) {
                        error!("Failed to press Control: {:?}", e);
                        return;
                    }
                    thread::sleep(time::Duration::from_millis(50));

                    debug!("Non-macOS: Clicking V");
                    if let Err(e) = enigo.key(Key::Unicode('v'), Direction::Click) {
                        error!("Failed to click V: {:?}", e);
                    }
                    thread::sleep(time::Duration::from_millis(50));

                    debug!("Non-macOS: Releasing Control");
                    if let Err(e) = enigo.key(Key::Control, Direction::Release) {
                        error!("Failed to release Control: {:?}", e);
                    }
                }
                info!("Paste sequence completed");
            }
            Err(e) => {
                error!("Failed to initialize Enigo for pasting: {}. Make sure Accessibility permissions are granted.", e);
            }
        }
    });

    Ok(())
}

// Hide translator window
#[tauri::command]
async fn hide_translator_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("translator")
        .ok_or("Translator window not found")?;

    window.hide().map_err(|e| e.to_string())?;
    hide_application(&app);

    Ok(())
}

// Toggle translator window always-on-top (pin)
#[tauri::command]
async fn toggle_translator_pin(app: AppHandle, pinned: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("translator")
        .ok_or("Translator window not found")?;

    window
        .set_always_on_top(pinned)
        .map_err(|e| e.to_string())?;

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

// Show main window
#[tauri::command]
async fn show_main_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn check_accessibility() -> bool {
    #[cfg(target_os = "macos")]
    {
        #[link(name = "ApplicationServices", kind = "framework")]
        extern "C" {
            fn AXIsProcessTrusted() -> bool;
        }
        unsafe { AXIsProcessTrusted() }
    }
    #[cfg(not(target_os = "macos"))]
    true
}

#[tauri::command]
async fn update_global_shortcut(
    app: AppHandle,
    old_shortcut: String,
    new_shortcut: String,
) -> Result<(), String> {
    info!(
        "[Global Shortcut] Updating from '{}' to '{}'",
        old_shortcut, new_shortcut
    );

    if old_shortcut == new_shortcut {
        return Ok(());
    }

    // Unregister old shortcut
    if !old_shortcut.is_empty() {
        if let Err(e) = app.global_shortcut().unregister(old_shortcut.as_str()) {
            warn!(
                "[Global Shortcut] Failed to unregister '{}': {}",
                old_shortcut, e
            );
        } else {
            info!("[Global Shortcut] Unregistered '{}'", old_shortcut);
        }
    }

    // Register new shortcut
    if !new_shortcut.is_empty() {
        let handle = app.clone();
        let shortcut_clone = new_shortcut.clone();

        match app.global_shortcut().on_shortcut(
            new_shortcut.as_str(),
            move |_app, _event, _shortcut| {
                info!("[Global Shortcut] '{}' triggered", shortcut_clone);
                // Get translator window and emit event
                if let Some(window) = handle.get_webview_window("translator") {
                    if let Err(e) = window.emit("global-shortcut-triggered", ()) {
                        error!("[Global Shortcut] Failed to emit event: {}", e);
                    }
                }
            },
        ) {
            Ok(_) => {
                if let Err(e) = app.global_shortcut().register(new_shortcut.as_str()) {
                    return Err(format!("Failed to register '{}': {}", new_shortcut, e));
                }
                info!("[Global Shortcut] Registered '{}'", new_shortcut);
            }
            Err(e) => {
                return Err(format!(
                    "Failed to setup handler for '{}': {}",
                    new_shortcut, e
                ));
            }
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir { file_name: None }),
                ])
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_macos_permissions::init())
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            info!("[Setup] Application starting");
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

            // Setup System Tray
            let show_i = MenuItem::with_id(app, "show", "Show Main Window", true, None::<&str>).unwrap();
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
            let menu = Menu::with_items(app, &[&show_i, &quit_i]).unwrap();

            // Check Accessiblity Permissions on startup (macOS only)
            #[cfg(target_os = "macos")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } => {
                         let app = tray.app_handle();
                         if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                         }
                    }
                    _ => {}
                })
                .build(app)
                .map_err(|e| format!("Failed to build tray icon: {}", e))?;

            // Register global shortcut Alt+T
            let shortcut = "Alt+T";

            match app.global_shortcut()
                .on_shortcut(shortcut, move |_app, _event, _shortcut| {
                    info!("[Global Shortcut] '{}' triggered", shortcut);

                    // Get translator window and emit event to it
                    if let Some(window) = handle.get_webview_window("translator") {
                        if let Err(e) = window.emit("global-shortcut-triggered", ()) {
                            error!("[Global Shortcut] Failed to emit event to translator window: {}", e);
                        } else {
                            debug!("[Global Shortcut] Event emitted to translator window");
                        }
                    } else {
                        error!("[Global Shortcut] Translator window not found");
                    }
                }) {
                Ok(_) => {
                    if let Err(e) = app.global_shortcut().register(shortcut) {
                        error!("[Global Shortcut] Failed to register '{}': {}. Make sure the app has accessibility permissions.", shortcut, e);
                    } else {
                        info!("[Global Shortcut] '{}' registered successfully", shortcut);
                    }
                }
                Err(e) => {
                    error!("[Global Shortcut] Failed to set up handler '{}': {}. Make sure the app has accessibility permissions.", shortcut, e);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_settings,
            set_zhipu_api_key,
            set_tencent_config,
            set_active_engine,
            get_translation,
            get_selected_text,
            copy_to_clipboard,
            show_translator_window,
            hide_translator_window,
            toggle_translator_pin,
            show_settings_window,
            hide_settings_window,
            paste_translation,
            show_main_window,
            check_accessibility,
            update_global_shortcut,

        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app: &AppHandle, event| {
            match event {
                tauri::RunEvent::Reopen { .. } => {
                    info!("[RunEvent] Reopen triggered");
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            }
        });
}
