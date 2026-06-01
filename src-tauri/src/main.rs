#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;

#[tauri::command]
async fn cloudflare_request(
    method: String,
    endpoint: String,
    email: String,
    api_key: String,
    body: Option<serde_json::Value>,
) -> Result<String, String> {
    let url = format!("https://api.cloudflare.com/client/v4{}", endpoint);
    
    let client = reqwest::Client::new();
    let mut request = client.request(
        reqwest::Method::from_bytes(method.as_bytes()).map_err(|e| e.to_string())?,
        &url,
    )
    .header("X-Auth-Email", email)
    .header("X-Auth-Key", api_key)
    .header("Content-Type", "application/json");
    
    if let Some(data) = body {
        request = request.json(&data);
    }
    
    let response = request.send().await.map_err(|e| e.to_string())?;
    let text = response.text().await.map_err(|e| e.to_string())?;
    
    Ok(text)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            cloudflare_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
