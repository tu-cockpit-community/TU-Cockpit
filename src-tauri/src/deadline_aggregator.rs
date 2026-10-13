use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_notification::NotificationExt;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};
use icalendar::{Calendar, Component, Event, EventLike};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeadlineItem {
    pub id: String,
    pub course_id: String,
    pub course_name: String,
    pub title: String,
    pub due_date: String, // ISO-8601 string, e.g. "2026-10-14T12:00:00Z"
    pub url: String,
    pub source: String,
    pub completed: bool,
    pub notified_24h: bool,
    pub notified_2h: bool,
}

pub fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    Ok(app_dir.join("student_deadlines.db"))
}

pub fn init_db(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS student_deadlines (
            id TEXT PRIMARY KEY,
            course_id TEXT NOT NULL,
            course_name TEXT NOT NULL,
            title TEXT NOT NULL,
            due_date TEXT NOT NULL,
            url TEXT NOT NULL,
            source TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            notified_24h INTEGER NOT NULL DEFAULT 0,
            notified_2h INTEGER NOT NULL DEFAULT 0
        );",
        [],
    )
    .map_err(|e| format!("Failed to initialize student_deadlines table: {}", e))?;
    Ok(())
}

pub fn parse_ics_content(ics_text: &str) -> Result<Vec<DeadlineItem>, String> {
    let calendar: Calendar = ics_text
        .parse()
        .map_err(|e| format!("Failed to parse iCalendar feed: {}", e))?;

    let mut items = Vec::new();

    for component in calendar.iter() {
        if let icalendar::CalendarComponent::Event(ev) = component {
            let summary = ev.get_summary().unwrap_or("Untitled Deadline").to_string();
            let description = ev.get_description().unwrap_or("").to_string();
            let uid = ev.get_uid().map(|s| s.to_string()).unwrap_or_else(|| {
                format!("dl_{}", summary.replace(' ', "_"))
            });

            let url = ev.get_url().unwrap_or("https://tuwel.tuwien.ac.at").to_string();

            // Extract course name from summary or description (e.g., "[188.999 VU] Algodat Assignment 2")
            let (course_id, course_name, clean_title) = extract_course_meta(&summary, &description);

            // Extract due date from DTEND or DTSTART
            let due_date = if let Some(end) = ev.get_end() {
                format_ical_date(&end)
            } else if let Some(start) = ev.get_start() {
                format_ical_date(&start)
            } else {
                (Utc::now() + Duration::days(7)).to_rfc3339()
            };

            items.push(DeadlineItem {
                id: uid,
                course_id,
                course_name,
                title: clean_title,
                due_date,
                url,
                source: "TUWEL".to_string(),
                completed: false,
                notified_24h: false,
                notified_2h: false,
            });
        }
    }

    Ok(items)
}

fn format_ical_date(dt: &icalendar::DatePerhapsTime) -> String {
    match dt {
        icalendar::DatePerhapsTime::DateTime(icalendar::CalendarDateTime::Utc(utc_dt)) => {
            utc_dt.to_rfc3339()
        }
        icalendar::DatePerhapsTime::DateTime(icalendar::CalendarDateTime::Floating(naive_dt)) => {
            DateTime::<Utc>::from_naive_utc_and_offset(*naive_dt, Utc).to_rfc3339()
        }
        icalendar::DatePerhapsTime::DateTime(icalendar::CalendarDateTime::WithTimezone { date_time, .. }) => {
            DateTime::<Utc>::from_naive_utc_and_offset(*date_time, Utc).to_rfc3339()
        }
        icalendar::DatePerhapsTime::Date(naive_date) => {
            if let Some(naive_dt) = naive_date.and_hms_opt(23, 59, 59) {
                DateTime::<Utc>::from_naive_utc_and_offset(naive_dt, Utc).to_rfc3339()
            } else {
                Utc::now().to_rfc3339()
            }
        }
    }
}

fn extract_course_meta(summary: &str, description: &str) -> (String, String, String) {
    // Check pattern: "[184.702 VU Algorithmen] Abgabe 1" or similar
    if summary.starts_with('[') {
        if let Some(close_idx) = summary.find(']') {
            let inside = &summary[1..close_idx];
            let clean_title = summary[close_idx + 1..].trim().to_string();
            let parts: Vec<&str> = inside.split_whitespace().collect();
            let course_id = parts.first().unwrap_or(&"TU").to_string();
            let course_name = inside.to_string();
            return (course_id, course_name, clean_title);
        }
    }

    // Secondary check description for course hints
    let course_id = if description.contains("course/view.php?id=") {
        let parts: Vec<&str> = description.split("course/view.php?id=").collect();
        parts.get(1).and_then(|s| s.split_whitespace().next()).unwrap_or("TUWEL").to_string()
    } else {
        "TUWEL".to_string()
    };

    (course_id, "TU Course".to_string(), summary.to_string())
}

#[tauri::command]
pub async fn sync_tuwel_deadlines(app: AppHandle, ical_feed_url: String) -> Result<Vec<DeadlineItem>, String> {
    let ics_text = if ical_feed_url.starts_with("http://") || ical_feed_url.starts_with("https://") {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .map_err(|e| e.to_string())?;

        let res = client
            .get(&ical_feed_url)
            .send()
            .await
            .map_err(|e| format!("Failed to download iCal feed: {}", e))?;

        if !res.status().is_success() {
            return Err(format!("TUWEL iCal feed returned HTTP {}", res.status()));
        }

        res.text().await.map_err(|e| e.to_string())?
    } else {
        // Direct ICS payload or local feed
        ical_feed_url
    };

    let parsed_items = parse_ics_content(&ics_text)?;

    let db_path = get_db_path(&app)?;
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    init_db(&conn)?;

    for item in &parsed_items {
        conn.execute(
            "INSERT INTO student_deadlines (id, course_id, course_name, title, due_date, url, source, completed, notified_24h, notified_2h)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
             ON CONFLICT(id) DO UPDATE SET
                due_date=excluded.due_date,
                title=excluded.title,
                url=excluded.url;",
            params![
                item.id,
                item.course_id,
                item.course_name,
                item.title,
                item.due_date,
                item.url,
                item.source,
                item.completed as i32,
                item.notified_24h as i32,
                item.notified_2h as i32,
            ],
        )
        .map_err(|e| format!("Failed to upsert deadline: {}", e))?;
    }

    get_student_deadlines(app).await
}

#[tauri::command]
pub async fn get_student_deadlines(app: AppHandle) -> Result<Vec<DeadlineItem>, String> {
    let db_path = get_db_path(&app)?;
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    init_db(&conn)?;

    let mut stmt = conn
        .prepare("SELECT id, course_id, course_name, title, due_date, url, source, completed, notified_24h, notified_2h FROM student_deadlines ORDER BY due_date ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DeadlineItem {
                id: row.get(0)?,
                course_id: row.get(1)?,
                course_name: row.get(2)?,
                title: row.get(3)?,
                due_date: row.get(4)?,
                url: row.get(5)?,
                source: row.get(6)?,
                completed: row.get::<_, i32>(7)? != 0,
                notified_24h: row.get::<_, i32>(8)? != 0,
                notified_2h: row.get::<_, i32>(9)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row.map_err(|e| e.to_string())?);
    }
    Ok(items)
}

#[tauri::command]
pub async fn toggle_deadline_completed(app: AppHandle, id: String, completed: bool) -> Result<(), String> {
    let db_path = get_db_path(&app)?;
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    init_db(&conn)?;

    conn.execute(
        "UPDATE student_deadlines SET completed = ?1 WHERE id = ?2",
        params![completed as i32, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn add_student_deadline(app: AppHandle, item: DeadlineItem) -> Result<(), String> {
    let db_path = get_db_path(&app)?;
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    init_db(&conn)?;

    conn.execute(
        "INSERT INTO student_deadlines (id, course_id, course_name, title, due_date, url, source, completed, notified_24h, notified_2h)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
         ON CONFLICT(id) DO UPDATE SET
            title=excluded.title,
            due_date=excluded.due_date,
            url=excluded.url,
            course_name=excluded.course_name;",
        params![
            item.id,
            item.course_id,
            item.course_name,
            item.title,
            item.due_date,
            item.url,
            item.source,
            item.completed as i32,
            item.notified_24h as i32,
            item.notified_2h as i32,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn export_local_ics_feed(app: AppHandle) -> Result<String, String> {
    let deadlines = get_student_deadlines(app.clone()).await?;

    let mut calendar = Calendar::new();
    calendar.name("TU Cockpit Deadlines & Exams");

    for d in deadlines.into_iter().filter(|d| !d.completed) {
        if let Ok(due_dt) = DateTime::parse_from_rfc3339(&d.due_date) {
            let utc_dt = due_dt.with_timezone(&Utc);
            let ev = Event::new()
                .summary(&format!("[{}] {}", d.course_name, d.title))
                .description(&format!("Course: {}\nLink: {}", d.course_name, d.url))
                .starts(utc_dt)
                .ends(utc_dt)
                .url(&d.url)
                .uid(&d.id)
                .done();

            calendar.push(ev);
        }
    }

    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    let ics_file_path = app_dir.join("tu_cockpit_schedule.ics");

    fs::write(&ics_file_path, calendar.to_string())
        .map_err(|e| format!("Failed to write ICS file: {}", e))?;

    Ok(ics_file_path.to_string_lossy().to_string())
}

pub fn check_deadline_notifications(app: &AppHandle) -> Result<usize, String> {
    let db_path = match get_db_path(app) {
        Ok(p) => p,
        Err(_) => return Ok(0),
    };
    if !db_path.exists() {
        return Ok(0);
    }

    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    init_db(&conn)?;

    let now = Utc::now();
    let mut stmt = conn
        .prepare("SELECT id, course_id, course_name, title, due_date, url, source, completed, notified_24h, notified_2h FROM student_deadlines WHERE completed = 0")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DeadlineItem {
                id: row.get(0)?,
                course_id: row.get(1)?,
                course_name: row.get(2)?,
                title: row.get(3)?,
                due_date: row.get(4)?,
                url: row.get(5)?,
                source: row.get(6)?,
                completed: row.get::<_, i32>(7)? != 0,
                notified_24h: row.get::<_, i32>(8)? != 0,
                notified_2h: row.get::<_, i32>(9)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut alerts_fired = 0;

    for row in rows {
        if let Ok(mut item) = row {
            if let Ok(parsed_due) = DateTime::parse_from_rfc3339(&item.due_date) {
                let due_utc = parsed_due.with_timezone(&Utc);
                let diff = due_utc.signed_duration_since(now);

                // Alert at <= 2h (if not already fired)
                if diff > Duration::zero() && diff <= Duration::hours(2) && !item.notified_2h {
                    let _ = app.notification().builder()
                        .title(format!("Urgent Deadline: {}", item.title))
                        .body(format!("{} is due in less than 2 hours!", item.course_name))
                        .show();

                    let _ = conn.execute(
                        "UPDATE student_deadlines SET notified_2h = 1 WHERE id = ?1",
                        params![item.id],
                    );
                    item.notified_2h = true;
                    alerts_fired += 1;
                }
                // Alert at <= 24h (if not already fired)
                else if diff > Duration::zero() && diff <= Duration::hours(24) && !item.notified_24h {
                    let _ = app.notification().builder()
                        .title(format!("Due Tomorrow: {}", item.title))
                        .body(format!("{} is due in 24 hours!", item.course_name))
                        .show();

                    let _ = conn.execute(
                        "UPDATE student_deadlines SET notified_24h = 1 WHERE id = ?1",
                        params![item.id],
                    );
                    item.notified_24h = true;
                    alerts_fired += 1;
                }
            }
        }
    }

    Ok(alerts_fired)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sqlite_schema_and_crud() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();

        let item = DeadlineItem {
            id: "dl_test_123".to_string(),
            course_id: "184.702".to_string(),
            course_name: "VU Algorithmen".to_string(),
            title: "Assignment 1".to_string(),
            due_date: "2026-10-15T23:59:59Z".to_string(),
            url: "https://tuwel.tuwien.ac.at/mod/assign/view.php?id=123".to_string(),
            source: "TUWEL".to_string(),
            completed: false,
            notified_24h: false,
            notified_2h: false,
        };

        conn.execute(
            "INSERT INTO student_deadlines (id, course_id, course_name, title, due_date, url, source, completed, notified_24h, notified_2h)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                item.id,
                item.course_id,
                item.course_name,
                item.title,
                item.due_date,
                item.url,
                item.source,
                item.completed as i32,
                item.notified_24h as i32,
                item.notified_2h as i32,
            ],
        ).unwrap();

        let mut stmt = conn.prepare("SELECT count(*) FROM student_deadlines").unwrap();
        let count: i64 = stmt.query_row([], |r| r.get(0)).unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn test_parse_sample_ics() {
        let sample_ics = r#"BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TU Wien//TUWEL//EN
BEGIN:VEVENT
UID:assign_999999
SUMMARY:[185.A01 VU Programmkonstruktion] Abgabe Aufgabe 3
DESCRIPTION:Abgabe auf TUWEL: https://tuwel.tuwien.ac.at/mod/assign/view.php?id=999999
DTSTART:20261014T180000Z
DTEND:20261014T200000Z
URL:https://tuwel.tuwien.ac.at/mod/assign/view.php?id=999999
END:VEVENT
END:VCALENDAR"#;

        let items = parse_ics_content(sample_ics).unwrap();
        assert_eq!(items.len(), 1);
        let item = &items[0];
        assert_eq!(item.id, "assign_999999");
        assert_eq!(item.title, "Abgabe Aufgabe 3");
        assert_eq!(item.course_name, "185.A01 VU Programmkonstruktion");
        assert!(item.url.contains("view.php?id=999999"));
    }

    #[test]
    fn test_ics_export_generation() {
        let mut cal = Calendar::new();
        cal.name("TU Test Calendar");

        let ev = Event::new()
            .summary("Algodat Exam")
            .starts(Utc::now())
            .ends(Utc::now() + Duration::hours(2))
            .done();
        cal.push(ev);

        let output = cal.to_string();
        assert!(output.contains("BEGIN:VCALENDAR"));
        assert!(output.contains("Algodat Exam"));
        assert!(output.contains("END:VCALENDAR"));
    }
}
