use tauri::{AppHandle, Manager, WebviewBuilder, WebviewUrl, LogicalPosition, LogicalSize};

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

    // If webview already exists, reposition, resize and show
    if let Some(existing) = app.get_webview(&portal_id) {
        let _ = existing.set_position(LogicalPosition::new(x, y));
        let _ = existing.set_size(LogicalSize::new(width, height));
        let _ = existing.show();
        return Ok(());
    }

    // Build native child webview attached to the main window
    let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
    let webview_url = WebviewUrl::External(parsed_url);
    let webview_builder = WebviewBuilder::new(&portal_id, webview_url).auto_resize();

    let pos = LogicalPosition::new(x, y);
    let size = LogicalSize::new(width, height);

    window
        .add_child(webview_builder, pos, size)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn hide_native_portal(app: AppHandle, portal_id: String) -> Result<(), String> {
    if let Some(existing) = app.get_webview(&portal_id) {
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
    if let Some(existing) = app.get_webview(&portal_id) {
        let _ = existing.set_position(LogicalPosition::new(x, y));
        let _ = existing.set_size(LogicalSize::new(width, height));
    }
    Ok(())
}

#[tauri::command]
pub async fn navigate_native_portal(app: AppHandle, portal_id: String, url: String) -> Result<(), String> {
    if let Some(existing) = app.get_webview(&portal_id) {
        let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
        let _ = existing.navigate(parsed_url);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_native_webview_module_compiles() {
        assert_eq!(1 + 1, 2);
    }
}
