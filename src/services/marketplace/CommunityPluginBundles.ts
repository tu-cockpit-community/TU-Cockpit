/**
 * TU Cockpit Community Plugin Bundles
 * Self-contained, zero-dependency interactive standalone HTML distributions
 * for tu-calendar and tu-slide-vault.
 */

export const COMMUNITY_CALENDAR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TU Calendar & Tasks</title>
  <style>
    :root {
      --tu-bg-canvas: #090d16;
      --tu-bg-surface: #111827;
      --tu-bg-card: rgba(31, 41, 55, 0.6);
      --tu-bg-elevated: #1f2937;
      --tu-border: #374151;
      --tu-border-subtle: #1f2937;
      --tu-border-focus: #006699;
      --tu-text-primary: #f9fafb;
      --tu-text-secondary: #9ca3af;
      --tu-text-muted: #6b7280;
      --tu-accent: #006699;
      --tu-accent-subtle: rgba(0, 102, 153, 0.15);
      --tu-accent-text: #ffffff;
      --tu-status-success: #10b981;
      --tu-status-warning: #f59e0b;
      --tu-status-error: #ef4444;
      --tu-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--tu-font-sans);
      background-color: var(--tu-bg-canvas);
      color: var(--tu-text-primary);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }
    header {
      height: 52px;
      background: var(--tu-bg-surface);
      border-bottom: 1px solid var(--tu-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      flex-shrink: 0;
    }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; }
    .brand-icon { width: 28px; height: 28px; border-radius: 6px; background: var(--tu-accent); display: flex; align-items: center; justify-content: center; font-size: 15px; }
    .tabs { display: flex; gap: 4px; background: var(--tu-bg-canvas); padding: 3px; border-radius: 8px; border: 1px solid var(--tu-border); }
    .tab-btn {
      padding: 5px 14px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--tu-text-secondary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tab-btn.active {
      background: var(--tu-accent);
      color: #fff;
      font-weight: 600;
    }
    main { flex: 1; overflow-y: auto; padding: 20px; }
    
    /* Timetable Grid */
    .timetable-grid {
      display: grid;
      grid-template-columns: 60px repeat(5, 1fr);
      gap: 8px;
      background: var(--tu-bg-surface);
      border: 1px solid var(--tu-border);
      border-radius: 10px;
      padding: 16px;
      min-width: 700px;
    }
    .day-header { text-align: center; font-weight: 700; font-size: 12px; color: var(--tu-text-secondary); padding-bottom: 8px; border-bottom: 1px solid var(--tu-border); }
    .time-col { display: flex; flex-direction: column; gap: 36px; font-size: 11px; color: var(--tu-text-muted); padding-top: 10px; }
    .day-col { display: flex; flex-direction: column; gap: 8px; position: relative; }
    .event-card {
      background: var(--tu-bg-card);
      border-left: 3px solid var(--tu-accent);
      border: 1px solid var(--tu-border);
      border-left-width: 4px;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .event-code { font-size: 10px; font-weight: 700; color: var(--tu-accent); }
    .event-title { font-size: 12px; font-weight: 600; color: var(--tu-text-primary); }
    .event-loc { font-size: 11px; color: var(--tu-text-muted); }

    /* Tasks Checklist */
    .tasks-container { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
    .new-task-box { display: flex; gap: 8px; background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: 8px; padding: 8px 12px; }
    .new-task-input { flex: 1; background: transparent; border: none; outline: none; color: var(--tu-text-primary); font-size: 13px; }
    .add-task-btn { background: var(--tu-accent); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--tu-bg-surface);
      border: 1px solid var(--tu-border);
      border-radius: 8px;
      padding: 12px 16px;
      transition: background 0.15s;
    }
    .task-check {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--tu-border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .task-check.checked { background: var(--tu-status-success); border-color: var(--tu-status-success); color: #fff; font-size: 11px; }
    .task-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .task-title { font-size: 13px; font-weight: 500; }
    .task-title.done { text-decoration: line-through; color: var(--tu-text-muted); }
    .task-meta { display: flex; gap: 8px; font-size: 11px; color: var(--tu-text-secondary); }
    .badge-urgent { background: rgba(239, 68, 68, 0.15); color: var(--tu-status-error); padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .badge-soon { background: rgba(245, 158, 11, 0.15); color: var(--tu-status-warning); padding: 2px 6px; border-radius: 4px; font-weight: 600; }

    /* Calendar Grid */
    .calendar-container { max-width: 860px; margin: 0 auto; background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: 10px; padding: 20px; }
    .month-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 15px; font-weight: 700; }
    .month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
    .day-cell {
      min-height: 80px;
      background: var(--tu-bg-canvas);
      border: 1px solid var(--tu-border-subtle);
      border-radius: 6px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .day-num { font-size: 11px; font-weight: 600; color: var(--tu-text-secondary); }
    .day-event { font-size: 10px; padding: 2px 5px; border-radius: 4px; background: var(--tu-accent-subtle); color: var(--tu-accent); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🗓️</div>
      <span>TU Calendar & Tasks</span>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('timetable')">Stundenplan</button>
      <button class="tab-btn" onclick="switchTab('tasks')">Aufgaben & Deadlines</button>
      <button class="tab-btn" onclick="switchTab('calendar')">Kalender</button>
    </div>
  </header>

  <main id="main-content">
    <!-- Loaded dynamically -->
  </main>

  <script>
    let activeTab = 'timetable';
    const TASKS_KEY = 'tu_community_calendar_tasks_v2';

    const DEFAULT_TASKS = [
      { id: '1', title: 'AlgoDat Übungsblatt 2 abgeben', course: '185.A48', due: 'In 2 Tagen', priority: 'high', done: false },
      { id: '2', title: 'Analysis 1 Vorlesungsskriptum durcharbeiten', course: '101.A01', due: 'Morgen', priority: 'medium', done: false },
      { id: '3', title: 'EPROG 1 Java-Klausur anmelden (TISS)', course: '185.A91', due: 'In 5 Tagen', priority: 'medium', done: false },
      { id: '4', title: 'DBS Relationale Algebra Quiz auf TUWEL', course: '184.708', due: 'Heute', priority: 'high', done: true },
    ];

    function loadTasks() {
      try {
        const raw = localStorage.getItem(TASKS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_TASKS;
    }

    function saveTasks(tasks) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }

    let tasks = loadTasks();

    function switchTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(tab));
      });
      render();
    }

    function toggleTask(id) {
      tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      saveTasks(tasks);
      render();
    }

    function addTask(e) {
      e.preventDefault();
      const input = document.getElementById('new-task-input');
      const val = input.value.trim();
      if (!val) return;
      tasks.unshift({
        id: Date.now().toString(),
        title: val,
        course: 'Personal Study',
        due: 'In 3 Tagen',
        priority: 'medium',
        done: false
      });
      saveTasks(tasks);
      input.value = '';
      render();
    }

    function renderTimetable() {
      return \`
        <div class="timetable-grid">
          <div></div>
          <div class="day-header">Montag</div>
          <div class="day-header">Dienstag</div>
          <div class="day-header">Mittwoch</div>
          <div class="day-header">Donnerstag</div>
          <div class="day-header">Freitag</div>

          <div class="time-col">
            <div>08:00</div>
            <div>10:00</div>
            <div>12:00</div>
            <div>14:00</div>
            <div>16:00</div>
          </div>

          <!-- Monday -->
          <div class="day-col">
            <div class="event-card" style="border-left-color: #0284c7;">
              <span class="event-code">185.A48 • VU</span>
              <span class="event-title">Algorithmen und Datenstrukturen</span>
              <span class="event-loc">📍 Freihaus HS 1 (09:15 - 11:00)</span>
            </div>
            <div class="event-card" style="border-left-color: #8b5cf6;">
              <span class="event-code">101.A01 • VO</span>
              <span class="event-title">Analysis 1 für Informatik</span>
              <span class="event-loc">📍 AudiMax (12:15 - 14:00)</span>
            </div>
          </div>

          <!-- Tuesday -->
          <div class="day-col">
            <div class="event-card" style="border-left-color: #10b981;">
              <span class="event-code">185.A91 • VU</span>
              <span class="event-title">Einführung Programmieren 1</span>
              <span class="event-loc">📍 Informatikhörsaal (10:15 - 12:00)</span>
            </div>
          </div>

          <!-- Wednesday -->
          <div class="day-col">
            <div class="event-card" style="border-left-color: #0284c7;">
              <span class="event-code">185.A48 • UE</span>
              <span class="event-title">AlgoDat Rechnerübung</span>
              <span class="event-loc">📍 EI 7 Gußhausstraße (14:00 - 16:00)</span>
            </div>
          </div>

          <!-- Thursday -->
          <div class="day-col">
            <div class="event-card" style="border-left-color: #f59e0b;">
              <span class="event-code">101.A02 • VO</span>
              <span class="event-title">Lineare Algebra für Informatik</span>
              <span class="event-loc">📍 Freihaus HS 2 (08:30 - 10:00)</span>
            </div>
          </div>

          <!-- Friday -->
          <div class="day-col">
            <div class="event-card" style="border-left-color: #ec4899;">
              <span class="event-code">184.708 • VU</span>
              <span class="event-title">Datenbanksysteme</span>
              <span class="event-loc">📍 EI 9 (10:15 - 12:00)</span>
            </div>
          </div>
        </div>
      \`;
    }

    function renderTasks() {
      return \`
        <div class="tasks-container">
          <form class="new-task-box" onsubmit="addTask(event)">
            <input id="new-task-input" class="new-task-input" type="text" placeholder="Neue Aufgabe oder Abgabe hinzufügen..." />
            <button type="submit" class="add-task-btn">Hinzufügen</button>
          </form>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            \${tasks.map(t => \`
              <div class="task-item">
                <div class="task-check \${t.done ? 'checked' : ''}" onclick="toggleTask('\${t.id}')">
                  \${t.done ? '✓' : ''}
                </div>
                <div class="task-content">
                  <span class="task-title \${t.done ? 'done' : ''}">\${t.title}</span>
                  <div class="task-meta">
                    <span>\${t.course}</span>
                    <span>•</span>
                    <span class="\${t.priority === 'high' ? 'badge-urgent' : 'badge-soon'}">\${t.due}</span>
                  </div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    function renderCalendar() {
      const days = Array.from({ length: 31 }, (_, i) => i + 1);
      return \`
        <div class="calendar-container">
          <div class="month-header">
            <span>Oktober 2026 (Wintersemester 2026/27)</span>
            <span style="font-size: 12px; color: var(--tu-text-secondary);">4 anstehende TUWEL Deadlines</span>
          </div>
          <div class="month-grid">
            \${days.map(d => \`
              <div class="day-cell">
                <span class="day-num">\${d}</span>
                \${d === 16 ? '<div class="day-event">AlgoDat Übungsblatt 2</div>' : ''}
                \${d === 20 ? '<div class="day-event" style="color: #ec4899;">DBS Quiz TUWEL</div>' : ''}
                \${d === 28 ? '<div class="day-event" style="color: #10b981;">EPROG Beispiel 1</div>' : ''}
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    function render() {
      const container = document.getElementById('main-content');
      if (activeTab === 'timetable') container.innerHTML = renderTimetable();
      else if (activeTab === 'tasks') container.innerHTML = renderTasks();
      else if (activeTab === 'calendar') container.innerHTML = renderCalendar();
    }

    render();
  </script>
</body>
</html>`;

export const COMMUNITY_SLIDE_VAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TU Slide Vault</title>
  <style>
    :root {
      --tu-bg-canvas: #090d16;
      --tu-bg-surface: #111827;
      --tu-bg-card: rgba(31, 41, 55, 0.6);
      --tu-bg-elevated: #1f2937;
      --tu-border: #374151;
      --tu-border-subtle: #1f2937;
      --tu-border-focus: #006699;
      --tu-text-primary: #f9fafb;
      --tu-text-secondary: #9ca3af;
      --tu-text-muted: #6b7280;
      --tu-accent: #006699;
      --tu-accent-subtle: rgba(0, 102, 153, 0.15);
      --tu-accent-text: #ffffff;
      --tu-status-success: #10b981;
      --tu-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --tu-font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--tu-font-sans);
      background-color: var(--tu-bg-canvas);
      color: var(--tu-text-primary);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }
    header {
      height: 52px;
      background: var(--tu-bg-surface);
      border-bottom: 1px solid var(--tu-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      flex-shrink: 0;
    }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; }
    .brand-icon { width: 28px; height: 28px; border-radius: 6px; background: var(--tu-accent); display: flex; align-items: center; justify-content: center; font-size: 15px; }
    .layout { display: flex; flex: 1; overflow: hidden; }
    
    /* Sidebar */
    aside {
      width: 260px;
      background: var(--tu-bg-surface);
      border-right: 1px solid var(--tu-border);
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 16px;
    }
    .sidebar-title { font-size: 11px; font-weight: 700; color: var(--tu-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .course-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--tu-text-primary);
      font-size: 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }
    .course-btn.active {
      background: var(--tu-accent-subtle);
      border-color: var(--tu-border-focus);
      font-weight: 600;
    }
    .quota-box {
      margin-top: auto;
      background: var(--tu-bg-canvas);
      border: 1px solid var(--tu-border);
      border-radius: 6px;
      padding: 10px;
      font-size: 11px;
    }
    .quota-bar { height: 5px; background: var(--tu-border); border-radius: 3px; overflow: hidden; margin: 6px 0; }
    .quota-fill { height: 100%; background: var(--tu-accent); width: 34%; }

    /* Main Area */
    main { flex: 1; display: flex; flex-direction: column; padding: 20px; gap: 16px; overflow-y: auto; }
    .search-bar {
      display: flex;
      gap: 10px;
      background: var(--tu-bg-surface);
      border: 1px solid var(--tu-border);
      border-radius: 8px;
      padding: 8px 14px;
    }
    .search-input { flex: 1; background: transparent; border: none; outline: none; color: var(--tu-text-primary); font-size: 13px; }
    .topic-chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
    .chip {
      background: var(--tu-bg-elevated);
      color: var(--tu-text-secondary);
      border: 1px solid var(--tu-border);
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
    }
    .chip.active { background: var(--tu-accent); color: #fff; border-color: var(--tu-accent); }

    /* Decks Grid */
    .decks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .deck-card {
      background: var(--tu-bg-surface);
      border: 1px solid var(--tu-border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      transition: transform 0.15s;
    }
    .deck-card:hover { transform: translateY(-2px); }
    .deck-header { display: flex; justify-content: space-between; align-items: center; }
    .deck-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: var(--tu-accent-subtle); color: var(--tu-accent); }
    .deck-title { font-size: 14px; font-weight: 600; line-height: 1.3; }
    .deck-desc { font-size: 12px; color: var(--tu-text-secondary); line-height: 1.4; }
    .deck-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--tu-border); padding-top: 10px; }
    .deck-meta { font-size: 11px; color: var(--tu-text-muted); }
    .read-btn { background: var(--tu-accent); color: #fff; border: none; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }

    /* Viewer Modal */
    .viewer-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      z-index: 9999;
    }
    .viewer-top {
      height: 48px;
      background: var(--tu-bg-surface);
      border-bottom: 1px solid var(--tu-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
    }
    .viewer-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: auto;
    }
    .slide-canvas {
      width: 820px;
      max-width: 100%;
      aspect-ratio: 16 / 9;
      background: #ffffff;
      color: #0f172a;
      border-radius: 10px;
      padding: 32px 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      transition: filter 0.15s;
    }
    .slide-canvas.inverted {
      filter: invert(0.92) hue-rotate(180deg) contrast(1.05);
      background: #0d1117;
    }
    .slide-h1 { font-size: 22px; font-weight: 700; color: #0284c7; margin-bottom: 16px; }
    .slide-bullets { display: flex; flex-direction: column; gap: 8px; font-size: 15px; color: #334155; padding-left: 20px; }
    .slide-code { background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 6px; font-family: var(--tu-font-mono); font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">📚</div>
      <span>TU Slide Vault</span>
    </div>
    <div style="font-size: 12px; color: var(--tu-text-secondary);">
      34.2 MB cached offline • WS 2026/27
    </div>
  </header>

  <div class="layout">
    <aside>
      <div class="sidebar-title">Kurse</div>
      <div id="course-list" style="display: flex; flex-direction: column; gap: 4px;">
        <!-- Injected -->
      </div>
      <div class="quota-box">
        <div style="display: flex; justify-content: space-between; color: var(--tu-text-secondary);">
          <span>Offline Speicher</span>
          <span>34%</span>
        </div>
        <div class="quota-bar"><div class="quota-fill"></div></div>
        <div style="color: var(--tu-text-muted);">34.2 MB von 100 MB</div>
      </div>
    </aside>

    <main>
      <div class="search-bar">
        <span style="color: var(--tu-text-muted);">🔍</span>
        <input id="search-input" class="search-input" type="text" placeholder="Vorlesungsfolien, Formeln & Themen durchsuchen..." oninput="handleSearch(this.value)" />
      </div>

      <div class="topic-chips" id="topic-chips">
        <!-- Injected -->
      </div>

      <div class="decks-grid" id="decks-grid">
        <!-- Injected -->
      </div>
    </main>
  </div>

  <div id="viewer-container"></div>

  <script>
    const COURSES = [
      { id: 'all', code: 'ALL', name: 'Alle Unterlagen' },
      { id: 'algodat', code: '185.A48', name: 'Algorithmen & Datenstrukturen' },
      { id: 'analysis1', code: '101.A01', name: 'Analysis 1 für Informatik' },
      { id: 'eprog', code: '185.A91', name: 'Einführung Programmieren 1' },
      { id: 'linalg', code: '101.A02', name: 'Lineare Algebra' },
      { id: 'dbs', code: '184.708', name: 'Datenbanksysteme' },
    ];

    const DECKS = [
      { id: 'd1', courseId: 'algodat', lec: 1, title: 'Einführung & Landau-Symbole', desc: 'Asymptotische Laufzeitanalyse, O-, Omega-, Theta-Kalkül.', topics: ['Komplexität', 'Landau-Symbole'], pgs: 38, size: '4.2 MB', pages: [
        { title: 'Asymptotische Komplexität & Landau-Symbole', bullets: ['O(g(n)): Obere asymptotische Schranke.', 'Omega(g(n)): Untere asymptotische Schranke.', 'Theta(g(n)): Exakte asymptotische Schranke.'], code: '// Komplexitätshierarchie:\\nO(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)' }
      ]},
      { id: 'd2', courseId: 'algodat', lec: 2, title: 'Divide & Conquer, MergeSort & QuickSort', desc: 'Rekursionsgleichungen, Master-Theorem, Sortierverfahren.', topics: ['MergeSort', 'Master-Theorem'], pgs: 46, size: '5.8 MB', pages: [
        { title: 'MergeSort Algorithmus & Analyse', bullets: ['Stabiles Teile-und-Herrsche Verfahren.', 'Laufzeitgarantie O(n log n) in Best, Worst und Average Case.', 'Zusatzspeicher O(n) für Zwischenpuffer.'], code: 'void mergeSort(int[] a, int l, int r) {\\n  if (l < r) { int m = (l + r)/2; mergeSort(a, l, m); mergeSort(a, m+1, r); merge(a, l, m, r); }\\n}' }
      ]},
      { id: 'd3', courseId: 'algodat', lec: 3, title: 'Balancierte Suchbäume (AVL & Rot-Schwarz)', desc: 'Binäre Suchbäume, Baumrotationen, Höhenbalancierung.', topics: ['AVL-Bäume', 'Rotationen'], pgs: 52, size: '6.1 MB', pages: [
        { title: 'AVL-Bäume: Höhenbalancierung', bullets: ['Balance-Faktor bf(v) = height(rechts) - height(links) in {-1, 0, 1}.', 'Wiederherstellung über Links-/Rechts-Rotationen in O(1).', 'Garantierte Baumhöhe h <= 1.44 log2(n).'] }
      ]},
      { id: 'd4', courseId: 'analysis1', lec: 1, title: 'Reelle Zahlen & Folgenkonvergenz', desc: 'Vollständigkeitsaxiom, Supremum, Epsilon-Kriterium.', topics: ['Konvergenz', 'Supremum'], pgs: 32, size: '3.7 MB', pages: [
        { title: 'Vollständigkeit & Folgenkonvergenz', bullets: ['Jede nach oben beschränkte Teilmenge besitzt ein Supremum in R.', 'Grenzwertdefinition: |a_n - a| < eps für alle n >= N(eps).'] }
      ]},
      { id: 'd5', courseId: 'eprog', lec: 1, title: 'Java Grundkonzepte & Kontrollstrukturen', desc: 'JVM Bytecode, Typen, Verzweigungen und Schleifen.', topics: ['Java', 'OOP'], pgs: 44, size: '4.1 MB', pages: [
        { title: 'Java Plattform & Objektorientierung', bullets: ['Plattformunabhängigkeit durch JVM Bytecode.', 'Kapselung: Attribute private, Zugriff über Getter/Setter.'], code: 'public class Main {\\n  public static void main(String[] args) {\\n    System.out.println("Servus TU Wien!");\\n  }\\n}' }
      ]},
      { id: 'd6', courseId: 'dbs', lec: 1, title: 'Relationales Modell & Relationale Algebra', desc: 'Relationen, Primärschlüssel, Joins, Abfrageoptimierung.', topics: ['Relationales Modell', 'SQL'], pgs: 42, size: '4.8 MB', pages: [
        { title: 'Relationale Algebra & SQL', bullets: ['Relation als Teilmenge des kartesischen Produkts.', 'Integritätsregeln: Entity Integrity & Referentielle Integrität.'], code: 'SELECT name, matrikelnummer FROM Studenten WHERE semester = "WS26";' }
      ]},
    ];

    const TOPICS = ['Komplexität', 'Landau-Symbole', 'MergeSort', 'Master-Theorem', 'AVL-Bäume', 'Konvergenz', 'OOP', 'SQL'];

    let selectedCourse = 'all';
    let searchQuery = '';
    let selectedTopic = null;
    let viewingDeck = null;
    let isInverted = true;

    function selectCourse(cId) {
      selectedCourse = cId;
      render();
    }

    function toggleTopic(t) {
      selectedTopic = selectedTopic === t ? null : t;
      render();
    }

    function handleSearch(q) {
      searchQuery = q.toLowerCase();
      render();
    }

    function openViewer(deckId) {
      viewingDeck = DECKS.find(d => d.id === deckId);
      renderViewer();
    }

    function closeViewer() {
      viewingDeck = null;
      document.getElementById('viewer-container').innerHTML = '';
    }

    function toggleInversion() {
      isInverted = !isInverted;
      renderViewer();
    }

    function renderViewer() {
      const c = document.getElementById('viewer-container');
      if (!viewingDeck) { c.innerHTML = ''; return; }
      const p = viewingDeck.pages[0];
      c.innerHTML = \`
        <div class="viewer-modal">
          <div class="viewer-top">
            <span style="font-size: 13px; font-weight: 700;">\${viewingDeck.title} (Lec \${viewingDeck.lec})</span>
            <div style="display: flex; gap: 8px;">
              <button onclick="toggleInversion()" style="background: var(--tu-bg-canvas); color: var(--tu-text-primary); border: 1px solid var(--tu-border); border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer;">
                \${isInverted ? '🌙 Dark Mode (Inverted)' : '☀️ Normal White'}
              </button>
              <button onclick="closeViewer()" style="background: var(--tu-bg-canvas); color: var(--tu-text-primary); border: 1px solid var(--tu-border); border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer;">
                Schließen (✕)
              </button>
            </div>
          </div>
          <div class="viewer-body">
            <div class="slide-canvas \${isInverted ? 'inverted' : ''}">
              <div style="border-bottom: 2px solid #006699; padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #006699;">
                TU WIEN • VORLESUNGSMATERIALIEN • WS 2026/27
              </div>
              <div>
                <h1 class="slide-h1">\${p.title}</h1>
                <ul class="slide-bullets">
                  \${p.bullets.map(b => '<li>' + b + '</li>').join('')}
                </ul>
                \${p.code ? '<pre class="slide-code"><code>' + p.code + '</code></pre>' : ''}
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
                <span>TU Slide Vault • Standalone Reader</span>
                <span>Folie 1 von \${viewingDeck.pgs}</span>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    function render() {
      // Render Course list
      document.getElementById('course-list').innerHTML = COURSES.map(c => \`
        <button class="course-btn \${selectedCourse === c.id ? 'active' : ''}" onclick="selectCourse('\${c.id}')">
          <span>\${c.name}</span>
          <span style="font-size: 10px; color: var(--tu-text-muted);">\${c.code}</span>
        </button>
      \`).join('');

      // Render Topics
      document.getElementById('topic-chips').innerHTML = TOPICS.map(t => \`
        <button class="chip \${selectedTopic === t ? 'active' : ''}" onclick="toggleTopic('\${t}')">\${t}</button>
      \`).join('');

      // Filter Decks
      const filtered = DECKS.filter(d => {
        if (selectedCourse !== 'all' && d.courseId !== selectedCourse) return false;
        if (selectedTopic && !d.topics.includes(selectedTopic)) return false;
        if (searchQuery && !d.title.toLowerCase().includes(searchQuery) && !d.desc.toLowerCase().includes(searchQuery)) return false;
        return true;
      });

      // Render Decks
      document.getElementById('decks-grid').innerHTML = filtered.map(d => \`
        <div class="deck-card">
          <div>
            <div class="deck-header">
              <span class="deck-tag">Lec \${d.lec}</span>
              <span style="font-size: 11px; color: var(--tu-status-success);">✓ Offline</span>
            </div>
            <h3 class="deck-title" style="margin-top: 6px;">\${d.title}</h3>
            <p class="deck-desc" style="margin-top: 4px;">\${d.desc}</p>
          </div>
          <div class="deck-footer">
            <span class="deck-meta">\${d.pgs} Seiten • \${d.size}</span>
            <button class="read-btn" onclick="openViewer('\${d.id}')">Öffnen</button>
          </div>
        </div>
      \`).join('');
    }

    render();
  </script>
</body>
</html>`;
