use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::SystemTime;
use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};

static CUSTOM_VAULT_PATH: Mutex<Option<String>> = Mutex::new(None);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideFileRecord {
    pub course: String,
    pub filename: String,
    pub path: String,
    pub size_bytes: u64,
    pub modified_timestamp: u64,
    #[serde(default)]
    pub subfolder: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SlideVaultConfig {
    custom_path: Option<String>,
}

fn get_config_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    Ok(app_dir.join("slide_vault_config.json"))
}

pub fn get_default_vault_path() -> PathBuf {
    let base = dirs::document_dir().unwrap_or_else(|| PathBuf::from("."));
    base.join("TU-Cockpit").join("Slide-Vault")
}

pub fn get_active_vault_path(app: &AppHandle) -> Result<PathBuf, String> {
    // 1. Check in-memory cache
    if let Ok(guard) = CUSTOM_VAULT_PATH.lock() {
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
                if let Ok(cfg) = serde_json::from_str::<SlideVaultConfig>(&content) {
                    if let Some(custom) = cfg.custom_path {
                        let path = PathBuf::from(&custom);
                        let _ = fs::create_dir_all(&path);
                        if let Ok(mut guard) = CUSTOM_VAULT_PATH.lock() {
                            *guard = Some(custom);
                        }
                        return Ok(path);
                    }
                }
            }
        }
    }

    // 3. Fallback to default Documents/TU-Cockpit/Slide-Vault
    let default_path = get_default_vault_path();
    fs::create_dir_all(&default_path)
        .map_err(|e| format!("Failed to create default slide vault directory: {}", e))?;
    Ok(default_path)
}

pub fn sanitize_name(input: &str, is_filename: bool) -> String {
    let illegal_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    let mut cleaned = input
        .chars()
        .map(|c| if illegal_chars.contains(&c) { '_' } else { c })
        .collect::<String>();

    cleaned = cleaned.trim().to_string();

    if cleaned.is_empty() {
        return if is_filename {
            "document.pdf".to_string()
        } else {
            "General".to_string()
        };
    }

    if is_filename && !cleaned.to_lowercase().ends_with(".pdf") {
        cleaned.push_str(".pdf");
    }

    cleaned
}

pub fn sanitize_subpath(input: &str) -> (Option<String>, String) {
    let normalized = input.replace('\\', "/");
    let parts: Vec<&str> = normalized
        .split('/')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty() && *s != "." && *s != "..")
        .collect();

    if parts.is_empty() {
        return (None, "document.pdf".to_string());
    }

    if parts.len() == 1 {
        let file = sanitize_name(parts[0], true);
        return (None, file);
    }

    let dir_parts: Vec<String> = parts[..parts.len() - 1]
        .iter()
        .map(|p| sanitize_name(p, false))
        .collect();

    let file_part = sanitize_name(parts[parts.len() - 1], true);
    (Some(dir_parts.join("/")), file_part)
}

fn collect_pdf_files_recursive(
    current_dir: &std::path::Path,
    course_name: &str,
    course_root: &std::path::Path,
    records: &mut Vec<SlideFileRecord>,
) {
    if let Ok(entries) = fs::read_dir(current_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect_pdf_files_recursive(&path, course_name, course_root, records);
            } else if path.is_file() {
                let is_pdf = path
                    .extension()
                    .map(|ext| ext.to_string_lossy().to_lowercase() == "pdf")
                    .unwrap_or(false);

                if is_pdf {
                    let filename = path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_else(|| "unknown.pdf".to_string());

                    if filename.starts_with('.') {
                        continue;
                    }

                    let subfolder = if let Ok(rel) = path.parent().unwrap_or(course_root).strip_prefix(course_root) {
                        let s = rel.to_string_lossy().replace('\\', "/");
                        if s.is_empty() {
                            None
                        } else {
                            Some(s)
                        }
                    } else {
                        None
                    };

                    let (size_bytes, modified_timestamp) = match path.metadata() {
                        Ok(meta) => {
                            let size = meta.len();
                            let mtime = meta
                                .modified()
                                .unwrap_or(SystemTime::UNIX_EPOCH)
                                .duration_since(SystemTime::UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_secs();
                            (size, mtime)
                        }
                        Err(_) => (0, 0),
                    };

                    records.push(SlideFileRecord {
                        course: course_name.to_string(),
                        filename,
                        path: path.to_string_lossy().to_string(),
                        size_bytes,
                        modified_timestamp,
                        subfolder,
                    });
                }
            }
        }
    }
}

#[tauri::command]
pub async fn get_slide_vault_path(app: AppHandle) -> Result<String, String> {
    let path = get_active_vault_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn set_slide_vault_path(app: AppHandle, new_path: String) -> Result<(), String> {
    let trimmed = new_path.trim();
    if trimmed.is_empty() {
        return Err("Slide vault path cannot be empty".to_string());
    }

    let target = PathBuf::from(trimmed);
    fs::create_dir_all(&target)
        .map_err(|e| format!("Failed to create or access directory {}: {}", trimmed, e))?;

    // Update in-memory
    if let Ok(mut guard) = CUSTOM_VAULT_PATH.lock() {
        *guard = Some(trimmed.to_string());
    }

    // Persist to config file
    if let Ok(cfg_path) = get_config_file_path(&app) {
        let config = SlideVaultConfig {
            custom_path: Some(trimmed.to_string()),
        };
        if let Ok(json) = serde_json::to_string_pretty(&config) {
            let _ = fs::write(cfg_path, json);
        }
    }

    use tauri::Emitter;
    let _ = app.emit("slide-vault-path-changed", serde_json::json!({ "path": trimmed }));
    let _ = app.emit("slide-saved-to-vault", serde_json::json!({ "refresh": true, "path": trimmed }));

    Ok(())
}

#[tauri::command]
pub async fn save_slide_to_vault(
    app: AppHandle,
    course_name: String,
    filename: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let vault_path = get_active_vault_path(&app)?;

    let clean_course = sanitize_name(&course_name, false);
    let (subfolder_opt, clean_filename) = sanitize_subpath(&filename);

    let mut dest_dir = vault_path.join(&clean_course);
    if let Some(ref sub) = subfolder_opt {
        for seg in sub.split('/') {
            dest_dir = dest_dir.join(seg);
        }
    }

    fs::create_dir_all(&dest_dir)
        .map_err(|e| format!("Failed to create destination directory: {}", e))?;

    let dest_path = dest_dir.join(&clean_filename);
    fs::write(&dest_path, &bytes)
        .map_err(|e| format!("Failed to write slide file to {}: {}", dest_path.display(), e))?;

    let dest_str = dest_path.to_string_lossy().to_string();
    use tauri::Emitter;
    let _ = app.emit("slide-saved-to-vault", serde_json::json!({
        "course": clean_course,
        "filename": clean_filename,
        "path": dest_str.clone(),
        "subfolder": subfolder_opt
    }));

    Ok(dest_str)
}

#[tauri::command]
pub async fn list_slide_vault_files(app: AppHandle) -> Result<Vec<SlideFileRecord>, String> {
    let vault_path = get_active_vault_path(&app)?;
    if !vault_path.exists() {
        return Ok(Vec::new());
    }

    let default_course = vault_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .filter(|n| n != "Slide-Vault" && !n.is_empty())
        .unwrap_or_else(|| "General".to_string());

    let mut records: Vec<SlideFileRecord> = Vec::new();

    let root_entries = fs::read_dir(&vault_path)
        .map_err(|e| format!("Failed to read slide vault dir: {}", e))?;

    for entry in root_entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            let course_name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| "General".to_string());

            collect_pdf_files_recursive(&path, &course_name, &path, &mut records);
        } else if path.is_file() {
            // Root-level file
            let is_pdf = path
                .extension()
                .map(|ext| ext.to_string_lossy().to_lowercase() == "pdf")
                .unwrap_or(false);

            if is_pdf {
                let filename = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_else(|| "unknown.pdf".to_string());

                if filename.starts_with('.') {
                    continue;
                }

                let (size_bytes, modified_timestamp) = match path.metadata() {
                    Ok(meta) => {
                        let size = meta.len();
                        let mtime = meta
                            .modified()
                            .unwrap_or(SystemTime::UNIX_EPOCH)
                            .duration_since(SystemTime::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs();
                        (size, mtime)
                    }
                    Err(_) => (0, 0),
                };

                records.push(SlideFileRecord {
                    course: default_course.clone(),
                    filename,
                    path: path.to_string_lossy().to_string(),
                    size_bytes,
                    modified_timestamp,
                    subfolder: None,
                });
            }
        }
    }

    // Sort by modified_timestamp descending
    records.sort_by(|a, b| b.modified_timestamp.cmp(&a.modified_timestamp));

    Ok(records)
}

#[tauri::command]
pub async fn reveal_slide_vault_folder(app: AppHandle) -> Result<(), String> {
    let vault_path = get_active_vault_path(&app)?;
    let path_str = vault_path.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path_str)
            .spawn()
            .map_err(|e| format!("Failed to open Finder for {}: {}", path_str, e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path_str)
            .spawn()
            .map_err(|e| format!("Failed to open Explorer for {}: {}", path_str, e))?;
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_name() {
        assert_eq!(
            sanitize_name("188.956 / VU: Algorithmen *& Datenstrukturen? \"", false),
            "188.956 _ VU_ Algorithmen _& Datenstrukturen_ _"
        );
        assert_eq!(
            sanitize_name("Lecture:01/Slides.PDF", true),
            "Lecture_01_Slides.PDF"
        );
        assert_eq!(
            sanitize_name("NoExtension", true),
            "NoExtension.pdf"
        );
        assert_eq!(sanitize_name("", false), "General");
        assert_eq!(sanitize_name("", true), "document.pdf");
    }

    #[test]
    fn test_slide_file_record_serialization() {
        let rec = SlideFileRecord {
            course: "VU AlgoDat".to_string(),
            filename: "Chapter_1.pdf".to_string(),
            path: "/tmp/Chapter_1.pdf".to_string(),
            size_bytes: 1024,
            modified_timestamp: 1729000000,
            subfolder: Some("Kapitel 1/Teil A".to_string()),
        };

        let json = serde_json::to_string(&rec).unwrap();
        assert!(json.contains("VU AlgoDat"));
        assert!(json.contains("Chapter_1.pdf"));
        assert!(json.contains("Kapitel 1/Teil A"));
    }

    #[test]
    fn test_sanitize_subpath() {
        let (sub, file) = sanitize_subpath("Chapter 1/Lecture:01.pdf");
        assert_eq!(sub, Some("Chapter 1".to_string()));
        assert_eq!(file, "Lecture_01.pdf");

        let (sub2, file2) = sanitize_subpath("Semester 1/AlgoDat/Uebung/blatt.pdf");
        assert_eq!(sub2, Some("Semester 1/AlgoDat/Uebung".to_string()));
        assert_eq!(file2, "blatt.pdf");

        let (sub3, file3) = sanitize_subpath("standalone.pdf");
        assert_eq!(sub3, None);
        assert_eq!(file3, "standalone.pdf");

        // Traversal protection
        let (sub4, file4) = sanitize_subpath("../../../etc/passwd");
        assert_eq!(sub4, Some("etc".to_string()));
        assert_eq!(file4, "passwd.pdf");
    }

    #[test]
    fn test_collect_pdf_files_recursive() {
        let temp_dir = std::env::temp_dir().join(format!("vault_test_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos()));
        let nested = temp_dir.join("Sub1").join("Sub2");
        fs::create_dir_all(&nested).unwrap();

        let file1 = temp_dir.join("root.pdf");
        let file2 = nested.join("deep.pdf");
        let txt = nested.join("ignore.txt");

        fs::write(&file1, b"%PDF-1.4 root").unwrap();
        fs::write(&file2, b"%PDF-1.4 deep").unwrap();
        fs::write(&txt, b"not a pdf").unwrap();

        let mut records = Vec::new();
        collect_pdf_files_recursive(&temp_dir, "TestCourse", &temp_dir, &mut records);

        assert_eq!(records.len(), 2);
        let deep = records.iter().find(|r| r.filename == "deep.pdf").unwrap();
        assert_eq!(deep.subfolder, Some("Sub1/Sub2".to_string()));
        assert_eq!(deep.course, "TestCourse");

        let root = records.iter().find(|r| r.filename == "root.pdf").unwrap();
        assert_eq!(root.subfolder, None);

        let _ = fs::remove_dir_all(&temp_dir);
    }
}

