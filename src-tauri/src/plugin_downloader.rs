use std::fs::{self, File};
use std::io::{Cursor, Read};
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use tauri::Manager;
use zip::ZipArchive;

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

fn default_entrypoint() -> String {
    "index.html".to_string()
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

    // Determine download URL
    let download_url = if let Some(ref tag) = release_tag {
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

    // Download archive bytes
    let response = client
        .get(&download_url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|e| format!("Failed to reach GitHub for '{}/{}': {}", owner, repo, e))?;

    if !response.status().is_success() {
        return Err(format!(
            "GitHub API responded with status {}: failed to download release for '{}/{}'",
            response.status(),
            owner,
            repo
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

    // Destination directory: $APPDATA/plugins/<plugin_id>/<version>/
    let base_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("./data"));
    let install_dir = base_dir
        .join("plugins")
        .join(&manifest.id)
        .join(&manifest.version);

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
            if relative_path.to_string_lossy() == manifest.entrypoint {
                let mut content = String::new();
                let mut read_f = File::open(&target_path).map_err(|e| e.to_string())?;
                read_f.read_to_string(&mut content).map_err(|e| e.to_string())?;
                entrypoint_html = content;
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
}
