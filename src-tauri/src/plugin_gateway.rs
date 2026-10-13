use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
pub struct NetworkResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginRule {
    pub plugin_id: String,
    pub allowed_globs: Vec<String>,
}

fn glob_to_regex(glob: &str) -> Result<Regex, regex::Error> {
    let escaped = regex::escape(glob).replace(r"\*", ".*");
    Regex::new(&format!("^{}$", escaped))
}

pub fn is_url_allowed(url: &str, allowed_globs: &[String]) -> bool {
    for glob in allowed_globs {
        if let Ok(re) = glob_to_regex(glob) {
            if re.is_match(url) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
pub async fn execute_plugin_network_request(
    plugin_id: String,
    url: String,
    method: String,
    headers: HashMap<String, String>,
    body: Option<String>,
    allowed_globs: Vec<String>,
) -> Result<NetworkResponse, String> {
    if !is_url_allowed(&url, &allowed_globs) {
        return Err(format!(
            "Access Denied: URL '{}' is not whitelisted by plugin '{}'",
            url, plugin_id
        ));
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let req_method = match method.to_uppercase().as_str() {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    let mut request = client.request(req_method, &url);
    for (k, v) in headers {
        // Strip sensitive host headers
        if !k.eq_ignore_ascii_case("host") && !k.eq_ignore_ascii_case("cookie") {
            request = request.header(&k, &v);
        }
    }

    if let Some(b) = body {
        request = request.body(b);
    }

    let response = request.send().await.map_err(|e| e.to_string())?;
    let status = response.status().as_u16();

    let mut res_headers = HashMap::new();
    for (k, v) in response.headers() {
        if let Ok(val) = v.to_str() {
            res_headers.insert(k.as_str().to_string(), val.to_string());
        }
    }

    let body_text = response.text().await.map_err(|e| e.to_string())?;

    Ok(NetworkResponse {
        status,
        headers: res_headers,
        body: body_text,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_url_whitelist_matching() {
        let allowed = vec![
            "https://tuwel.tuwien.ac.at/*".to_string(),
            "https://tiss.tuwien.ac.at/api/*".to_string(),
        ];

        assert!(is_url_allowed("https://tuwel.tuwien.ac.at/calendar/view.php", &allowed));
        assert!(is_url_allowed("https://tiss.tuwien.ac.at/api/person/123", &allowed));
        assert!(!is_url_allowed("https://evil.com/steal-data", &allowed));
        assert!(!is_url_allowed("https://tuwel.tuwien.ac.at.attacker.com", &allowed));
    }
}
