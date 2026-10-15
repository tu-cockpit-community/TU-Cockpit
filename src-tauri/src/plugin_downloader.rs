use std::fs::{self, File};
use std::io::{Cursor, Read};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use zip::ZipArchive;

static CUSTOM_PLUGINS_PATH: Mutex<Option<String>> = Mutex::new(None);

#[derive(Debug, Serialize, Deserialize)]
pub struct InstalledPluginMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub entrypoint: String,
    pub entrypoint_html: String,
    pub install_dir: String,
    pub capabilities: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct GitHubReleaseAsset {
    pub name: String,
    pub browser_download_url: String,
}

#[derive(Debug, Deserialize)]
struct GitHubReleaseInfo {
    #[serde(default)]
    pub assets: Vec<GitHubReleaseAsset>,
}

#[derive(Debug, Deserialize)]
struct PluginManifestRaw {
    pub id: String,
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub description: String,
    #[serde(default = "default_entrypoint")]
    pub entrypoint: String,
    #[serde(default)]
    pub capabilities: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
struct DownloadedPluginsConfig {
    custom_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct DevPluginsConfig {
    custom_path: Option<String>,
}

static CUSTOM_DEV_PLUGINS_PATH: Mutex<Option<String>> = Mutex::new(None);

fn default_entrypoint() -> String {
    "index.html".to_string()
}

fn get_config_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    Ok(app_dir.join("downloaded_plugins_config.json"))
}

fn get_dev_config_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    Ok(app_dir.join("dev_plugins_config.json"))
}

pub fn get_default_downloaded_plugins_path() -> PathBuf {
    let base = dirs::document_dir()
        .or_else(|| dirs::home_dir().map(|h| h.join("Documents")))
        .unwrap_or_else(|| PathBuf::from("."));
    base.join("TU-Cockpit").join("Plugins")
}

pub fn get_default_dev_plugins_path() -> PathBuf {
    if let Ok(cwd) = std::env::current_dir() {
        let candidate = cwd.join("dev-plugins");
        if candidate.exists() {
            return candidate;
        }
    }
    let base = dirs::document_dir()
        .or_else(|| dirs::home_dir().map(|h| h.join("Documents")))
        .unwrap_or_else(|| PathBuf::from("."));
    base.join("TU-Cockpit").join("dev-plugins")
}

pub fn get_active_downloaded_plugins_path(app: &AppHandle) -> Result<PathBuf, String> {
    // 1. Check in-memory cache
    if let Ok(guard) = CUSTOM_PLUGINS_PATH.lock() {
        if let Some(ref p) = *guard {
            let path = PathBuf::from(p);
            let _ = fs::create_dir_all(&path);
            return Ok(path);
        }
    }

    // 2. Check saved config file on disk
    if let Ok(cfg_path) = get_config_file_path(app) {
        if cfg_path.exists() {
            if let Ok(content) = fs::read_to_string(&cfg_path) {
                if let Ok(cfg) = serde_json::from_str::<DownloadedPluginsConfig>(&content) {
                    if let Some(custom) = cfg.custom_path {
                        let path = PathBuf::from(&custom);
                        let _ = fs::create_dir_all(&path);
                        if let Ok(mut guard) = CUSTOM_PLUGINS_PATH.lock() {
                            *guard = Some(custom);
                        }
                        return Ok(path);
                    }
                }
            }
        }
    }

    // 3. Fallback to default Documents/TU-Cockpit/Plugins
    let default_path = get_default_downloaded_plugins_path();
    fs::create_dir_all(&default_path)
        .map_err(|e| format!("Failed to create default downloaded plugins directory: {}", e))?;
    Ok(default_path)
}

pub fn get_active_dev_plugins_path(app: &AppHandle) -> Result<PathBuf, String> {
    // 1. Check in-memory cache
    if let Ok(guard) = CUSTOM_DEV_PLUGINS_PATH.lock() {
        if let Some(ref p) = *guard {
            let path = PathBuf::from(p);
            let _ = fs::create_dir_all(&path);
            return Ok(path);
        }
    }

    // 2. Check saved config file on disk
    if let Ok(cfg_path) = get_dev_config_file_path(app) {
        if cfg_path.exists() {
            if let Ok(content) = fs::read_to_string(&cfg_path) {
                if let Ok(cfg) = serde_json::from_str::<DevPluginsConfig>(&content) {
                    if let Some(custom) = cfg.custom_path {
                        let path = PathBuf::from(&custom);
                        let _ = fs::create_dir_all(&path);
                        if let Ok(mut guard) = CUSTOM_DEV_PLUGINS_PATH.lock() {
                            *guard = Some(custom);
                        }
                        return Ok(path);
                    }
                }
            }
        }
    }

    // 3. Fallback to default dev-plugins location
    let default_path = get_default_dev_plugins_path();
    let _ = fs::create_dir_all(&default_path);
    Ok(default_path)
}

#[tauri::command]
pub async fn get_downloaded_plugins_path(app: AppHandle) -> Result<String, String> {
    let path = get_active_downloaded_plugins_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn set_downloaded_plugins_path(app: AppHandle, new_path: String) -> Result<(), String> {
    let trimmed = new_path.trim();
    if trimmed.is_empty() {
        return Err("Download directory path cannot be empty".to_string());
    }

    let p = PathBuf::from(trimmed);
    fs::create_dir_all(&p)
        .map_err(|e| format!("Failed to create directory at '{:?}': {}", p, e))?;

    if let Ok(mut guard) = CUSTOM_PLUGINS_PATH.lock() {
        *guard = Some(trimmed.to_string());
    }

    if let Ok(cfg_path) = get_config_file_path(&app) {
        let cfg = DownloadedPluginsConfig {
            custom_path: Some(trimmed.to_string()),
        };
        if let Ok(json) = serde_json::to_string_pretty(&cfg) {
            let _ = fs::write(cfg_path, json);
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn get_dev_plugins_path(app: AppHandle) -> Result<String, String> {
    let path = get_active_dev_plugins_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn set_dev_plugins_path(app: AppHandle, new_path: String) -> Result<(), String> {
    let trimmed = new_path.trim();
    if trimmed.is_empty() {
        return Err("Dev plugins directory path cannot be empty".to_string());
    }

    let p = PathBuf::from(trimmed);
    fs::create_dir_all(&p)
        .map_err(|e| format!("Failed to create directory at '{:?}': {}", p, e))?;

    if let Ok(mut guard) = CUSTOM_DEV_PLUGINS_PATH.lock() {
        *guard = Some(trimmed.to_string());
    }

    if let Ok(cfg_path) = get_dev_config_file_path(&app) {
        let cfg = DevPluginsConfig {
            custom_path: Some(trimmed.to_string()),
        };
        if let Ok(json) = serde_json::to_string_pretty(&cfg) {
            let _ = fs::write(cfg_path, json);
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn reveal_downloaded_plugins_folder(app: AppHandle) -> Result<(), String> {
    let plugins_path = get_active_downloaded_plugins_path(&app)?;
    let path_str = plugins_path.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path_str)
            .spawn()
            .map_err(|e| format!("Failed to open Finder for {}: {}", path_str, e))?;
    }

    #[cfg(target_os = "windows")]
    {
        let win_path = path_str.replace('/', "\\");
        let trimmed = win_path.trim_end_matches('\\');
        std::process::Command::new("explorer")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Failed to open Explorer for {}: {}", trimmed, e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path_str)
            .spawn()
            .map_err(|e| format!("Failed to open file manager for {}: {}", path_str, e))?;
    }

    Ok(())
}

#[tauri::command]
pub async fn reveal_dev_plugins_folder(app: AppHandle) -> Result<(), String> {
    let dev_path = get_active_dev_plugins_path(&app)?;
    let path_str = dev_path.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path_str)
            .spawn()
            .map_err(|e| format!("Failed to open Finder for {}: {}", path_str, e))?;
    }

    #[cfg(target_os = "windows")]
    {
        let win_path = path_str.replace('/', "\\");
        let trimmed = win_path.trim_end_matches('\\');
        std::process::Command::new("explorer")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Failed to open Explorer for {}: {}", trimmed, e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path_str)
            .spawn()
            .map_err(|e| format!("Failed to open file manager for {}: {}", path_str, e))?;
    }

    Ok(())
}

pub fn parse_github_repo(url: &str) -> Result<(String, String), String> {
    let cleaned = url
        .trim()
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_start_matches("github.com/")
        .trim_end_matches('/')
        .trim_end_matches(".git");

    let parts: Vec<&str> = cleaned.split('/').collect();
    if parts.len() >= 2 {
        Ok((parts[0].to_string(), parts[1].to_string()))
    } else {
        Err(format!("Invalid GitHub repository format: '{}'", url))
    }
}

pub fn is_allowed_community_repo(url: &str) -> bool {
    if let Ok((owner, _)) = parse_github_repo(url) {
        owner.eq_ignore_ascii_case("tu-cockpit-community")
    } else {
        false
    }
}

pub fn sanitize_entry_path(name: &str) -> Result<PathBuf, String> {
    let path = Path::new(name);
    // Guard against path traversal attacks (e.g. ../ or /etc/passwd)
    for component in path.components() {
        match component {
            std::path::Component::ParentDir => {
                return Err(format!("Illegal path traversal in archive: '{}'", name));
            }
            std::path::Component::RootDir | std::path::Component::Prefix(_) => {
                return Err(format!("Absolute path forbidden in archive: '{}'", name));
            }
            _ => {}
        }
    }
    Ok(path.to_path_buf())
}

#[tauri::command]
pub async fn install_plugin_from_github(
    app: tauri::AppHandle,
    repo_url: String,
    release_tag: Option<String>,
) -> Result<InstalledPluginMetadata, String> {
    let (owner, repo) = parse_github_repo(&repo_url)?;

    // Exploit Prevention: Strictly enforce tu-cockpit-community namespace
    if !owner.eq_ignore_ascii_case("tu-cockpit-community") {
        return Err(
            "Exploit Prevention: Direct unverified GitHub installs are disabled. Plugins must be published in the official Community Organization (tu-cockpit-community).".to_string()
        );
    }

    let client = reqwest::Client::builder()
        .user_agent("TU-Cockpit/0.1.0 (TU Wien Student Workstation)")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    // 1. Check if a compiled release asset (plugin.zip) is available on GitHub Releases
    let release_api_url = if let Some(ref tag) = release_tag {
        format!(
            "https://api.github.com/repos/{}/{}/releases/tags/{}",
            owner, repo, tag
        )
    } else {
        format!(
            "https://api.github.com/repos/{}/{}/releases/latest",
            owner, repo
        )
    };

    let mut asset_download_url: Option<String> = None;

    if let Ok(rel_resp) = client
        .get(&release_api_url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
    {
        if rel_resp.status().is_success() {
            if let Ok(rel_info) = rel_resp.json::<GitHubReleaseInfo>().await {
                if let Some(asset) = rel_info.assets.into_iter().find(|a| a.name == "plugin.zip") {
                    asset_download_url = Some(asset.browser_download_url);
                }
            }
        }
    }

    // 2. Download compiled release asset or fall back to repository source zipball
    let download_url = if let Some(url) = asset_download_url {
        url
    } else if let Some(ref tag) = release_tag {
        format!(
            "https://api.github.com/repos/{}/{}/zipball/{}",
            owner, repo, tag
        )
    } else {
        format!(
            "https://api.github.com/repos/{}/{}/zipball",
            owner, repo
        )
    };

    let mut req = client.get(&download_url);
    if download_url.contains("api.github.com") {
        req = req.header("Accept", "application/vnd.github+json");
    }

    let response = req
        .send()
        .await
        .map_err(|e| format!("Failed to reach GitHub for '{}/{}': {}", owner, repo, e))?;

    if !response.status().is_success() {
        return Err(format!(
            "GitHub responded with status {}: failed to download archive from '{}'",
            response.status(),
            download_url
        ));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read archive body: {}", e))?;

    let cursor = Cursor::new(bytes);
    let mut archive = ZipArchive::new(cursor).map_err(|e| format!("Failed to read ZIP archive: {}", e))?;

    // Find manifest.json within archive
    let mut manifest_content = String::new();
    let mut prefix_to_strip = PathBuf::new();

    for i in 0..archive.len() {
        let file = archive.by_index(i).map_err(|e| e.to_string())?;
        let name = file.name();
        if name.ends_with("manifest.json") {
            let path = Path::new(name);
            if let Some(parent) = path.parent() {
                prefix_to_strip = parent.to_path_buf();
            }
            let mut f = file;
            f.read_to_string(&mut manifest_content)
                .map_err(|e| format!("Failed to read manifest.json: {}", e))?;
            break;
        }
    }

    if manifest_content.is_empty() {
        return Err(format!(
            "Archive for '{}/{}' is missing a valid manifest.json",
            owner, repo
        ));
    }

    let manifest: PluginManifestRaw = serde_json::from_str(&manifest_content)
        .map_err(|e| format!("Malformed manifest.json in '{}/{}': {}", owner, repo, e))?;

    // Destination directory: <downloaded_plugins_path>/<plugin_id>/
    let base_dir = get_active_downloaded_plugins_path(&app)?;
    let install_dir = base_dir.join(&manifest.id);

    fs::create_dir_all(&install_dir)
        .map_err(|e| format!("Failed to create plugin directory '{:?}': {}", install_dir, e))?;

    let mut entrypoint_html = String::new();

    // Extract files safely
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let original_name = file.name().to_string();

        let path = sanitize_entry_path(&original_name)?;

        // Strip GitHub top-level archive prefix (e.g. owner-repo-sha123/)
        let relative_path = if !prefix_to_strip.as_os_str().is_empty() {
            match path.strip_prefix(&prefix_to_strip) {
                Ok(p) => p.to_path_buf(),
                Err(_) => path,
            }
        } else {
            path
        };

        if relative_path.as_os_str().is_empty() {
            continue;
        }

        let target_path = install_dir.join(&relative_path);

        if file.is_dir() {
            fs::create_dir_all(&target_path)
                .map_err(|e| format!("Failed to create folder {:?}: {}", target_path, e))?;
        } else {
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut out_file = File::create(&target_path)
                .map_err(|e| format!("Failed to create file {:?}: {}", target_path, e))?;
            std::io::copy(&mut file, &mut out_file)
                .map_err(|e| format!("Failed to extract file {:?}: {}", target_path, e))?;

            // If this is the entrypoint file, read its content
            if relative_path.to_string_lossy() == manifest.entrypoint
                || relative_path.to_string_lossy() == "index.html"
                || relative_path.to_string_lossy() == "dist/index.html"
            {
                let mut content = String::new();
                if let Ok(mut read_f) = File::open(&target_path) {
                    if read_f.read_to_string(&mut content).is_ok() && !content.is_empty() {
                        entrypoint_html = content;
                    }
                }
            }
        }
    }

    if entrypoint_html.is_empty() {
        // Fallback default placeholder if entrypoint was not found
        entrypoint_html = format!(
            "<!DOCTYPE html><html><body><h2>{}</h2><p>Installed from {}/{}</p></body></html>",
            manifest.name, owner, repo
        );
    }

    Ok(InstalledPluginMetadata {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        entrypoint: manifest.entrypoint,
        entrypoint_html,
        install_dir: install_dir.to_string_lossy().to_string(),
        capabilities: manifest.capabilities,
    })
}

#[tauri::command]
pub async fn delete_installed_plugin(app: AppHandle, plugin_id: String) -> Result<(), String> {
    // 1. Strict ID validation: reject path traversal and illegal characters
    let cleaned_id = plugin_id.trim();
    if cleaned_id.is_empty()
        || cleaned_id.contains('/')
        || cleaned_id.contains('\\')
        || cleaned_id.contains("..")
    {
        return Err(format!("Invalid plugin identifier: '{}'", plugin_id));
    }

    // 2. Resolve configured downloaded plugins directory
    let base_dir = get_active_downloaded_plugins_path(&app)?;
    let target_dir = base_dir.join(cleaned_id);

    // 3. Security Check: Ensure canonical path is strictly inside base_dir
    let base_canon = base_dir
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize base plugins dir: {}", e))?;

    if target_dir.exists() {
        let target_canon = target_dir
            .canonicalize()
            .map_err(|e| format!("Failed to canonicalize plugin dir: {}", e))?;

        if !target_canon.starts_with(&base_canon) {
            return Err("Security Violation: Target path is outside downloaded plugins folder.".to_string());
        }

        // Protected workspace invariant: Never touch dev-plugins/ or project source
        let target_str = target_canon.to_string_lossy();
        if target_str.contains("dev-plugins") || target_str.contains("community-plugins") {
            return Err("Security Violation: Cannot delete local community dev workspaces.".to_string());
        }

        fs::remove_dir_all(&target_canon)
            .map_err(|e| format!("Failed to delete plugin files at '{:?}': {}", target_canon, e))?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_github_repo_variants() {
        assert_eq!(
            parse_github_repo("https://github.com/alice/tuwel-tracker").unwrap(),
            ("alice".to_string(), "tuwel-tracker".to_string())
        );
        assert_eq!(
            parse_github_repo("github.com/tuwien-community/calendar.git").unwrap(),
            ("tuwien-community".to_string(), "calendar".to_string())
        );
        assert_eq!(
            parse_github_repo("tuwien/mensa").unwrap(),
            ("tuwien".to_string(), "mensa".to_string())
        );
        assert!(parse_github_repo("invalid-repo-format").is_err());
    }

    #[test]
    fn test_sanitize_entry_path_guards() {
        assert!(sanitize_entry_path("normal/index.html").is_ok());
        assert!(sanitize_entry_path("../evil.js").is_err());
        assert!(sanitize_entry_path("a/b/../../evil.js").is_err());
        assert!(sanitize_entry_path("/absolute/path").is_err());
    }

    #[test]
    fn test_verified_community_org_enforcement() {
        assert!(is_allowed_community_repo("https://github.com/tu-cockpit-community/freihaus-timer"));
        assert!(!is_allowed_community_repo("https://github.com/evil-hacker/backdoor-plugin"));
    }

    #[test]
    fn test_github_release_asset_deserialization() {
        let json = r#"{
            "assets": [
                {
                    "name": "other.tar.gz",
                    "browser_download_url": "https://example.com/other.tar.gz"
                },
                {
                    "name": "plugin.zip",
                    "browser_download_url": "https://example.com/plugin.zip"
                }
            ]
        }"#;
        let release: GitHubReleaseInfo = serde_json::from_str(json).unwrap();
        let plugin_asset = release.assets.into_iter().find(|a| a.name == "plugin.zip");
        assert!(plugin_asset.is_some());
        assert_eq!(
            plugin_asset.unwrap().browser_download_url,
            "https://example.com/plugin.zip"
        );
    }

    #[test]
    fn test_default_downloaded_plugins_path() {
        let default_path = get_default_downloaded_plugins_path();
        assert!(default_path.to_string_lossy().contains("TU-Cockpit"));
        assert!(default_path.to_string_lossy().contains("Plugins"));
    }
}
