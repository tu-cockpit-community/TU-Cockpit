use tauri::{AppHandle, Manager, WebviewBuilder, WebviewUrl, LogicalPosition, LogicalSize};

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
}
