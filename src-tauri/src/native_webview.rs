use std::sync::Mutex;
use tauri::{AppHandle, Manager, WebviewBuilder, WebviewUrl, WebviewWindowBuilder, LogicalPosition, LogicalSize};

pub const KNOWN_PORTALS: [&str; 4] = [
    "portal_tuwien_official_tuwel",
    "portal_tuwien_official_tiss",
    "portal_tuwien_official_vowi",
    "portal_tuwien_official_tumaps",
];

static ACTIVE_PORTAL: Mutex<Option<String>> = Mutex::new(None);

/// Sanitizes portal IDs (e.g. "tuwien.official.tuwel") into valid Tauri webview labels
/// since Tauri strictly forbids '.' characters in window and webview labels.
pub fn sanitize_portal_label(portal_id: &str) -> String {
    format!("portal_{}", portal_id.replace('.', "_"))
}

pub const TUWEL_SLIDE_VAULT_INTERCEPT_SCRIPT: &str = r#"
(() => {
  function injectButtons() {
    if (!window.location.hostname.includes('tuwel.tuwien.ac.at')) return;

    const links = document.querySelectorAll(
      'a[href*="/mod/resource/view.php"], a[href*="/mod/folder/"], a[href$=".pdf"], a[href*=".pdf?"]'
    );

    links.forEach(link => {
      if (link.dataset.tuSlideVaultInjected) return;
      link.dataset.tuSlideVaultInjected = 'true';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tu-slide-vault-btn';
      btn.innerHTML = '📥 Add to Slide Vault';
      btn.style.cssText = 'display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:3px 9px;font-size:11px;font-family:system-ui,-apple-system,sans-serif;font-weight:600;background-color:#006699;color:#ffffff;border:1px solid rgba(0,102,153,0.4);border-radius:12px;cursor:pointer;vertical-align:middle;box-shadow:0 1px 3px rgba(0,0,0,0.15);transition:all 0.15s ease;';

      btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = '#00527c';
        btn.style.transform = 'translateY(-1px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = '#006699';
        btn.style.transform = 'none';
      });

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        btn.disabled = true;
        btn.innerHTML = '⏳ Saving...';
        btn.style.backgroundColor = '#64748b';

        try {
          const courseHeading = document.querySelector('.page-header-headings h1, .breadcrumb-item:nth-last-child(2), .breadcrumb li:nth-last-child(2)');
          const courseName = courseHeading?.textContent?.trim() || 'General';

          let filename = link.textContent?.trim() || 'Lecture_Slide.pdf';
          filename = filename.replace(/\s*Download\s*$/i, '').trim();
          if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
          }

          const resp = await fetch(link.href, { credentials: 'include' });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const buffer = await resp.arrayBuffer();
          const bytes = Array.from(new Uint8Array(buffer));

          if (window.__TAURI__ && window.__TAURI__.core) {
            await window.__TAURI__.core.invoke('save_slide_to_vault', {
              courseName: courseName,
              filename: filename,
              bytes: bytes
            });
          }

          btn.innerHTML = '✅ Saved to Vault';
          btn.style.backgroundColor = '#10b981';
          btn.style.borderColor = '#059669';

          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#006699;color:#fff;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.3);z-index:999999;';
          toast.textContent = '📥 Saved "' + filename + '" to Slide Vault!';
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(() => toast.remove(), 400);
          }, 3000);
        } catch (err) {
          console.error('[TU-Cockpit] Failed to save slide to vault:', err);
          btn.disabled = false;
          btn.innerHTML = '❌ Error';
          btn.style.backgroundColor = '#ef4444';
        }
      });

      if (link.parentNode) {
        link.parentNode.insertBefore(btn, link.nextSibling);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButtons);
  } else {
    injectButtons();
  }

  const observer = new MutationObserver(() => injectButtons());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
"#;

pub const TISS_AUTOSYNC_SCRIPT: &str = r#"
(() => {
  let hasSynced = false;

  async function checkAndSyncTissCalendar() {
    if (hasSynced) return;
    if (!window.location.hostname.includes('tiss.tuwien.ac.at')) return;

    const isLoggedIn = document.querySelector('a[href*="/logout"], .user-profile, .user-name, a[href*="/personal/"]') !== null;
    if (!isLoggedIn) return;

    const icalLink = document.querySelector('a[href*="/personal/termin/ical"], a[href*="/events/ical"], a[href*="ical"]');
    const icalUrl = icalLink ? icalLink.href : '/personal/termin/ical';

    try {
      const resp = await fetch(icalUrl, { credentials: 'include' });
      if (resp.ok) {
        const text = await resp.text();
        if (text && text.includes('BEGIN:VCALENDAR')) {
          hasSynced = true;
          if (window.__TAURI__ && window.__TAURI__.core) {
            await window.__TAURI__.core.invoke('sync_tiss_ical', { icalContent: text });
          }
          console.log('[TU-Cockpit] TISS Timetable Auto-Synced successfully!');
        }
      }
    } catch (err) {
      console.warn('[TU-Cockpit] TISS Calendar background fetch:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndSyncTissCalendar);
  } else {
    checkAndSyncTissCalendar();
  }

  window.addEventListener('popstate', checkAndSyncTissCalendar);
})();
"#;

#[tauri::command]
pub async fn set_portals_visibility(app: AppHandle, visible: bool) -> Result<(), String> {
    if !visible {
        for other in KNOWN_PORTALS {
            if let Some(wv) = app.get_webview(other) {
                let _ = wv.hide();
            }
        }
    } else {
        let active_label = ACTIVE_PORTAL.lock().ok().and_then(|guard| guard.clone());
        if let Some(label) = active_label {
            if let Some(wv) = app.get_webview(&label) {
                let _ = wv.show();
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn hide_all_native_portals(app: AppHandle) -> Result<(), String> {
    for other in KNOWN_PORTALS {
        if let Some(wv) = app.get_webview(other) {
            let _ = wv.hide();
        }
    }
    if let Ok(mut active) = ACTIVE_PORTAL.lock() {
        *active = None;
    }
    Ok(())
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
    let window = if let Some(w) = app.get_window("main") {
        w
    } else if let Some((lbl, w)) = app.windows().into_iter().next() {
        eprintln!("[native_webview] Warning: window 'main' not found, falling back to window '{}'", lbl);
        w
    } else {
        return Err("Main window not found to attach native child webview".to_string());
    };
    let label = sanitize_portal_label(&portal_id);

    if let Ok(mut active) = ACTIVE_PORTAL.lock() {
        *active = Some(label.clone());
    }

    // Defensively hide any other portal child webviews
    for other in KNOWN_PORTALS {
        if other != label {
            if let Some(other_wv) = app.get_webview(other) {
                let _ = other_wv.hide();
            }
        }
    }

    let safe_width = width.max(10.0);
    let safe_height = height.max(10.0);

    // If webview already exists, reposition, resize and show
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.set_position(LogicalPosition::new(x, y));
        let _ = existing.set_size(LogicalSize::new(safe_width, safe_height));
        let _ = existing.show();
        return Ok(());
    }

    // Build native child webview attached to the main window
    let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
    let webview_url = WebviewUrl::External(parsed_url);
    let mut webview_builder = WebviewBuilder::new(&label, webview_url).auto_resize();

    if portal_id == "tuwien.official.tuwel" {
        webview_builder = webview_builder.initialization_script(TUWEL_SLIDE_VAULT_INTERCEPT_SCRIPT);
    } else if portal_id == "tuwien.official.tiss" {
        webview_builder = webview_builder.initialization_script(TISS_AUTOSYNC_SCRIPT);
    }

    let pos = LogicalPosition::new(x, y);
    let size = LogicalSize::new(safe_width, safe_height);

    window
        .add_child(webview_builder, pos, size)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn inject_portal_theme(
    _app: AppHandle,
    _portal_id: String,
    _css: String,
) -> Result<(), String> {
    // Deprecated in Phase 8: University portals (TUWEL, TISS, VoWi) render in 100% authentic mode
    // to preserve form, quiz, and JSF table reliability.
    Ok(())
}

#[tauri::command]
pub async fn inject_portal_autofill(app: AppHandle, portal_id: String) -> Result<bool, String> {
    let label = sanitize_portal_label(&portal_id);
    let webview = match app.get_webview(&label) {
        Some(wv) => wv,
        None => return Ok(false),
    };

    let payload = match crate::totp_vault::get_autofill_payload() {
        Ok(p) => p,
        Err(_) => return Ok(false),
    };

    if !payload.auto_fill || (payload.username.is_empty() && payload.password.is_empty()) {
        return Ok(false);
    }

    let u_json = serde_json::to_string(&payload.username).map_err(|e| e.to_string())?;
    let p_json = serde_json::to_string(&payload.password).map_err(|e| e.to_string())?;
    let t_json = serde_json::to_string(&payload.totp_code.unwrap_or_default()).map_err(|e| e.to_string())?;

    let script = format!(
        r#"(() => {{
            const username = {u_json};
            const password = {p_json};
            const totpCode = {t_json};

            let filled = false;

            function triggerEvents(el) {{
                el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}

            // Username detection (login.tuwien.ac.at uses j_username)
            const uField = document.querySelector('input[name="j_username"], input#username, input[autocomplete="username"], input[name="username"]');
            if (uField && username) {{
                uField.value = username;
                triggerEvents(uField);
                filled = true;
            }}

            // Password detection (login.tuwien.ac.at uses j_password)
            const pField = document.querySelector('input[name="j_password"], input#password, input[type="password"]');
            if (pField && password) {{
                pField.value = password;
                triggerEvents(pField);
                filled = true;
            }}

            // MFA / TOTP token detection (login.tuwien.ac.at uses token/totp/otp)
            const tField = document.querySelector('input[name="token"], input[name="totp"], input[name="otp"], input#token');
            if (tField && totpCode) {{
                tField.value = totpCode;
                triggerEvents(tField);
                filled = true;
            }}

            if (filled) {{
                const existingBadge = document.getElementById('tu-cockpit-autofill-badge');
                if (!existingBadge) {{
                    const badge = document.createElement('div');
                    badge.id = 'tu-cockpit-autofill-badge';
                    badge.innerText = '🔐 Autofilled by TU Cockpit';
                    badge.style.position = 'fixed';
                    badge.style.bottom = '20px';
                    badge.style.right = '20px';
                    badge.style.backgroundColor = '#006699';
                    badge.style.color = '#ffffff';
                    badge.style.padding = '8px 14px';
                    badge.style.borderRadius = '8px';
                    badge.style.fontFamily = 'system-ui, -apple-system, sans-serif';
                    badge.style.fontSize = '12px';
                    badge.style.fontWeight = '600';
                    badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    badge.style.zIndex = '999999';
                    badge.style.transition = 'opacity 0.5s ease';
                    (document.body || document.documentElement).appendChild(badge);
                    setTimeout(() => {{
                        badge.style.opacity = '0';
                        setTimeout(() => badge.remove(), 500);
                    }}, 3000);
                }}
            }}
        }})();"#
    );

    webview.eval(&script).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn hide_native_portal(app: AppHandle, portal_id: String) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.hide();
    }
    if let Ok(mut active) = ACTIVE_PORTAL.lock() {
        if active.as_deref() == Some(&label) {
            *active = None;
        }
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
    let safe_width = width.max(10.0);
    let safe_height = height.max(10.0);
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.set_position(LogicalPosition::new(x, y));
        let _ = existing.set_size(LogicalSize::new(safe_width, safe_height));
    }
    Ok(())
}

#[tauri::command]
pub async fn navigate_native_portal(app: AppHandle, portal_id: String, url: String) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let parsed_url = url.parse().map_err(|e: url::ParseError| e.to_string())?;
        let _ = existing.navigate(parsed_url);
        if portal_id == "tuwien.official.tuwel" {
            let _ = existing.eval(TUWEL_SLIDE_VAULT_INTERCEPT_SCRIPT);
        } else if portal_id == "tuwien.official.tiss" {
            let _ = existing.eval(TISS_AUTOSYNC_SCRIPT);
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn portal_go_back(app: AppHandle, portal_id: String) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.eval("window.history.back()");
    }
    Ok(())
}

#[tauri::command]
pub async fn portal_go_forward(app: AppHandle, portal_id: String) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let _ = existing.eval("window.history.forward()");
    }
    Ok(())
}

#[tauri::command]
pub async fn portal_set_zoom(app: AppHandle, portal_id: String, zoom: f64) -> Result<(), String> {
    let label = sanitize_portal_label(&portal_id);
    if let Some(existing) = app.get_webview(&label) {
        let clamped = zoom.clamp(0.5, 3.0);
        let script = format!("document.body.style.zoom = '{}';", clamped);
        let _ = existing.eval(&script);
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
            let mut builder = WebviewBuilder::new(&left_label, WebviewUrl::External(parsed_url))
                .auto_resize();
            if portal_left == "tuwien.official.tuwel" {
                builder = builder.initialization_script(TUWEL_SLIDE_VAULT_INTERCEPT_SCRIPT);
            } else if portal_left == "tuwien.official.tiss" {
                builder = builder.initialization_script(TISS_AUTOSYNC_SCRIPT);
            }
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
            let mut builder = WebviewBuilder::new(&right_label, WebviewUrl::External(parsed_url))
                .auto_resize();
            if portal_right == "tuwien.official.tuwel" {
                builder = builder.initialization_script(TUWEL_SLIDE_VAULT_INTERCEPT_SCRIPT);
            } else if portal_right == "tuwien.official.tiss" {
                builder = builder.initialization_script(TISS_AUTOSYNC_SCRIPT);
            }
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
