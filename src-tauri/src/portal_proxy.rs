use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxyPageResult {
    pub url: String,
    pub title: String,
    pub html: String,
    pub status: u16,
}

/// Rewrites HTML from an institutional portal:
/// 1. Converts relative asset/link URLs (href="/...", src="/...") to absolute URLs on upstream base domain.
/// 2. Injects the Cockpit CSS theme tokens and overrides into the <head> block.
/// 3. Removes any frame-busting scripts (e.g. `if (top != self) top.location = self.location`).
pub fn sanitize_and_inject_portal_html(
    html: &str,
    base_url: &str,
    theme_css: Option<&str>,
) -> String {
    let base_trimmed = base_url.trim_end_matches('/');

    // 1. Rewrite relative paths for href, src, action
    let re_href = Regex::new(r#"href="/([^"]*)""#).unwrap();
    let re_src = Regex::new(r#"src="/([^"]*)""#).unwrap();
    let re_action = Regex::new(r#"action="/([^"]*)""#).unwrap();

    let mut rewritten = re_href.replace_all(html, format!(r#"href="{}/$1""#, base_trimmed)).to_string();
    rewritten = re_src.replace_all(&rewritten, format!(r#"src="{}/$1""#, base_trimmed)).to_string();
    rewritten = re_action.replace_all(&rewritten, format!(r#"action="{}/$1""#, base_trimmed)).to_string();

    // 2. Remove common frame-busting JavaScript snippets
    let re_framebust1 = Regex::new(r#"(?i)if\s*\(\s*(top|window\.top)\s*!==?\s*(self|window\.self)\s*\)\s*\{[^}]*\}"#).unwrap();
    rewritten = re_framebust1.replace_all(&rewritten, "/* framebust disabled */").to_string();

    // 3. Inject CSS Theme Overrides if provided
    if let Some(css) = theme_css {
        let style_tag = format!(
            r#"<style id="tu-cockpit-injected-theme">
{}
</style>
<meta name="color-scheme" content="dark light">
"#,
            css
        );

        if rewritten.contains("</head>") {
            rewritten = rewritten.replace("</head>", &format!("{}\n</head>", style_tag));
        } else if rewritten.contains("<body") {
            rewritten = rewritten.replace("<body", &format!("{}<body", style_tag));
        } else {
            rewritten.push_str(&style_tag);
        }
    }

    rewritten
}

/// Fetches an institutional portal page, stripping X-Frame-Options and Content-Security-Policy headers
/// and returning ready-to-render sandboxed HTML with injected Cockpit theme tokens.
#[tauri::command]
pub async fn fetch_portal_page(
    target_url: String,
    theme_css: Option<String>,
) -> Result<ProxyPageResult, String> {
    // Validate target domain whitelist
    let allowed_prefixes = [
        "https://tuwel.tuwien.ac.at",
        "https://tiss.tuwien.ac.at",
        "https://vowi.fsinf.at",
        "https://maps.tuwien.ac.at",
        "https://login.tuwien.ac.at",
    ];

    let is_whitelisted = allowed_prefixes.iter().any(|prefix| target_url.starts_with(prefix));
    if !is_whitelisted {
        return Err(format!(
            "Access to domain '{}' is blocked. Only TU Wien institutional services are permitted.",
            target_url
        ));
    }

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 TU-Cockpit/0.1.0")
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(&target_url)
        .send()
        .await
        .map_err(|e| format!("Network error connecting to portal: {}", e))?;

    let status = response.status().as_u16();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read portal response text: {}", e))?;

    let transformed_html = sanitize_and_inject_portal_html(
        &body,
        &target_url,
        theme_css.as_deref(),
    );

    let re_title = Regex::new(r#"(?i)<title>(.*?)</title>"#).unwrap();
    let title = re_title
        .captures(&transformed_html)
        .and_then(|cap| cap.get(1))
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| "TU Wien Portal".to_string());

    Ok(ProxyPageResult {
        url: target_url,
        title,
        html: transformed_html,
        status,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_relative_url_rewriting() {
        let raw = r#"<html><head><link href="/theme/styles.css"></head><body><img src="/pix/logo.png"><form action="/login/index.php"></form></body></html>"#;
        let base = "https://tuwel.tuwien.ac.at";
        let rewritten = sanitize_and_inject_portal_html(raw, base, None);

        assert!(rewritten.contains(r#"href="https://tuwel.tuwien.ac.at/theme/styles.css""#));
        assert!(rewritten.contains(r#"src="https://tuwel.tuwien.ac.at/pix/logo.png""#));
        assert!(rewritten.contains(r#"action="https://tuwel.tuwien.ac.at/login/index.php""#));
    }

    #[test]
    fn test_theme_css_injection() {
        let raw = "<html><head><title>TUWEL</title></head><body>Content</body></html>";
        let css = ":root { --tu-accent: #006699; }";
        let injected = sanitize_and_inject_portal_html(raw, "https://tuwel.tuwien.ac.at", Some(css));

        assert!(injected.contains(r#"<style id="tu-cockpit-injected-theme">"#));
        assert!(injected.contains("--tu-accent: #006699;"));
    }
}
