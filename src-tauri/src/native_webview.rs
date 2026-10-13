use tauri::{AppHandle, Manager, WebviewBuilder, WebviewUrl, WebviewWindowBuilder, LogicalPosition, LogicalSize};

/// Sanitizes portal IDs (e.g. "tuwien.official.tuwel") into valid Tauri webview labels
/// since Tauri strictly forbids '.' characters in window and webview labels.
pub fn sanitize_portal_label(portal_id: &str) -> String {
    format!("portal_{}", portal_id.replace('.', "_"))
}

#[tauri::command]
pub async fn create_or_show_native_portal(
    app: AppHandle,
    portal_id: String,
    url: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Main window not found")?;
    let label = sanitize_portal_label(&portal_id);

    // Defensively hide any other portal child webviews
    let known_portals = [
        "portal_tuwien_official_tuwel",
        "portal_tuwien_official_tiss",
        "portal_tuwien_official_vowi",
        "portal_tuwien_official_tumaps",
    ];
    for other in known_portals {
        if other != label {
            if let Some(other_wv) = app.get_webview(other) {
                let _ = other_wv.hide();
            }
        }
    }

    // If webview already exists, reposition, resize and show
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.set_position(LogicalPosition::new(x, y));
        let _ = existing.set_size(LogicalSize::new(width, height));
        let _ = existing.show();
        return Ok(());
    }

    // Build native child webview attached to the main window
    let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
    let webview_url = WebviewUrl::External(parsed_url);
    let webview_builder = WebviewBuilder::new(&label, webview_url).auto_resize();

    let pos = LogicalPosition::new(x, y);
    let size = LogicalSize::new(width, height);

    window
        .add_child(webview_builder, pos, size)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn hide_native_portal(app: AppHandle, portal_id: String) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.hide();
    }
    Ok(())
}

#[tauri::command]
pub async fn resize_native_portal(
    app: AppHandle,
    portal_id: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.set_position(LogicalPosition::new(x, y));
        let _ = existing.set_size(LogicalSize::new(width, height));
    }
    Ok(())
}

#[tauri::command]
pub async fn navigate_native_portal(app: AppHandle, portal_id: String, url: String) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
        let _ = existing.navigate(parsed_url);
    }
    Ok(())
}

#[tauri::command]
pub async fn orchestrate_split_portals(
    app: AppHandle,
    portal_left: String,
    portal_right: String,
    split_ratio: f64,
    total_x: f64,
    total_y: f64,
    total_width: f64,
    total_height: f64,
) -> Result<(), String> {
    let ratio = split_ratio.clamp(0.1, 0.9);
    let left_label = sanitize_portal_label(&portal_left);
    let right_label = sanitize_portal_label(&portal_right);

    let left_width = (total_width * ratio).round();
    let right_width = (total_width - left_width).round();
    let right_x = total_x + left_width;

    // Defensively hide any other portal child webviews
    let known_portals = [
        "portal_tuwien_official_tuwel",
        "portal_tuwien_official_tiss",
        "portal_tuwien_official_vowi",
        "portal_tuwien_official_tumaps",
    ];
    for other in known_portals {
        if other != left_label && other != right_label {
            if let Some(other_wv) = app.get_webview(other) {
                let _ = other_wv.hide();
            }
        }
    }

    let window = app.get_window("main").ok_or("Main window not found")?;

    if let Some(left_wv) = app.get_webview(&left_label) {
        let _ = left_wv.set_position(LogicalPosition::new(total_x, total_y));
        let _ = left_wv.set_size(LogicalSize::new(left_width, total_height));
        let _ = left_wv.show();
    } else {
        let default_url = crate::embedded_portals::get_default_portal_url(&portal_left);
        if let Ok(parsed_url) = default_url.parse() {
            let builder = WebviewBuilder::new(&left_label, WebviewUrl::External(parsed_url)).auto_resize();
            let _ = window.add_child(builder, LogicalPosition::new(total_x, total_y), LogicalSize::new(left_width, total_height));
        }
    }

    if let Some(right_wv) = app.get_webview(&right_label) {
        let _ = right_wv.set_position(LogicalPosition::new(right_x, total_y));
        let _ = right_wv.set_size(LogicalSize::new(right_width, total_height));
        let _ = right_wv.show();
    } else {
        let default_url = crate::embedded_portals::get_default_portal_url(&portal_right);
        if let Ok(parsed_url) = default_url.parse() {
            let builder = WebviewBuilder::new(&right_label, WebviewUrl::External(parsed_url)).auto_resize();
            let _ = window.add_child(builder, LogicalPosition::new(right_x, total_y), LogicalSize::new(right_width, total_height));
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn detach_portal_window(
    app: AppHandle,
    portal_id: String,
    url: String,
) -> Result<(), String> {
    let detached_label = format!("detached_{}", portal_id.replace('.', "_"));

    // If window already exists, focus it
    if let Some(existing_window) = app.get_webview_window(&detached_label) {
        let _ = existing_window.show();
        let _ = existing_window.set_focus();
        return Ok(());
    }

    let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
    let webview_url = WebviewUrl::External(parsed_url);

    let window_title = format!("TU Cockpit - {}", portal_id);
    let builder = WebviewWindowBuilder::new(&app, &detached_label, webview_url)
        .title(&window_title)
        .inner_size(1024.0, 768.0);

    builder.build().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitized_label_validity() {
        let portal_ids = [
            "tuwien.official.tuwel",
            "tuwien.official.tiss",
            "tuwien.official.vowi",
            "tuwien.official.tumaps",
        ];

        for id in portal_ids {
            let sanitized = sanitize_portal_label(id);
            assert!(
                !sanitized.contains('.'),
                "Label must not contain dots: {}",
                sanitized
            );
            assert!(
                sanitized
                    .chars()
                    .all(|c| c.is_alphanumeric() || c == '-' || c == '/' || c == ':' || c == '_'),
                "Label '{}' must satisfy Tauri's is_label_valid constraints",
                sanitized
            );
        }
    }

    #[test]
    fn test_split_ratio_calculations() {
        let total_w = 1200.0;
        let ratio_50 = 0.5f64.clamp(0.1, 0.9);
        let left_w_50 = (total_w * ratio_50).round();
        let right_w_50 = (total_w - left_w_50).round();
        assert_eq!(left_w_50, 600.0);
        assert_eq!(right_w_50, 600.0);

        let ratio_70 = 0.7f64.clamp(0.1, 0.9);
        let left_w_70 = (total_w * ratio_70).round();
        let right_w_70 = (total_w - left_w_70).round();
        assert_eq!(left_w_70, 840.0);
        assert_eq!(right_w_70, 360.0);
    }

    #[test]
    fn test_detached_window_label_sanitization() {
        let detached_label = format!("detached_{}", "tuwien.official.tuwel".replace('.', "_"));
        assert_eq!(detached_label, "detached_tuwien_official_tuwel");
        assert!(!detached_label.contains('.'));
    }
}
