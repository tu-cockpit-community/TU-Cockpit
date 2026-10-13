pub mod plugin_gateway;
pub mod plugin_downloader;
pub mod embedded_portals;
pub mod portal_proxy;
pub mod totp_vault;
pub mod native_webview;
pub mod deadline_aggregator;
pub mod offline_vault;

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
use native_webview::{
    create_or_show_native_portal, hide_native_portal, resize_native_portal, navigate_native_portal,
    orchestrate_split_portals, detach_portal_window,
};
use deadline_aggregator::{
    sync_tuwel_deadlines, get_student_deadlines, toggle_deadline_completed,
    add_student_deadline, export_local_ics_feed, check_deadline_notifications,
};
use offline_vault::{
    cache_course_pdf, search_offline_slides, get_cached_vault_files, read_vault_pdf_bytes,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    let _ = check_deadline_notifications(&handle);
                    tokio::time::sleep(tokio::time::Duration::from_secs(300)).await;
                }
            });
            Ok(())
        })
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
            clear_vault_credentials,
            create_or_show_native_portal,
            hide_native_portal,
            resize_native_portal,
            navigate_native_portal,
            orchestrate_split_portals,
            detach_portal_window,
            sync_tuwel_deadlines,
            get_student_deadlines,
            toggle_deadline_completed,
            add_student_deadline,
            export_local_ics_feed,
            cache_course_pdf,
            search_offline_slides,
            get_cached_vault_files,
            read_vault_pdf_bytes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
