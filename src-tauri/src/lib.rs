pub mod plugin_gateway;
pub mod plugin_downloader;
pub mod embedded_portals;
pub mod portal_proxy;
pub mod totp_vault;

use plugin_gateway::execute_plugin_network_request;
use plugin_downloader::install_plugin_from_github;
use embedded_portals::{
    get_portal_url, navigate_portal, reload_portal, portal_go_back, portal_go_forward, inject_theme_css,
};
use portal_proxy::fetch_portal_page;
use totp_vault::{
    generate_totp_code, save_vault_credentials, get_vault_status, get_vault_credentials,
    get_autofill_payload, clear_vault_credentials,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            execute_plugin_network_request,
            install_plugin_from_github,
            get_portal_url,
            navigate_portal,
            reload_portal,
            portal_go_back,
            portal_go_forward,
            inject_theme_css,
            fetch_portal_page,
            generate_totp_code,
            save_vault_credentials,
            get_vault_status,
            get_vault_credentials,
            get_autofill_payload,
            clear_vault_credentials
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
