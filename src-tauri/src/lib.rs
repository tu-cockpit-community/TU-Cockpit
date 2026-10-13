pub mod plugin_gateway;
pub mod plugin_downloader;

use plugin_gateway::execute_plugin_network_request;
use plugin_downloader::install_plugin_from_github;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            execute_plugin_network_request,
            install_plugin_from_github
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
