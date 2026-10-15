export interface SemesterInfo {
  label: string; // e.g., "WS 2026/27" or "SS 2027"
  code: string; // e.g., "WS26" or "SS27"
  termType: "winter" | "summer";
  academicYear: string; // e.g., "2026/27" or "2027"
  isLecturePeriod: boolean;
  currentWeek: number | null; // 1 to 15 during lectures, null during break
  phaseLabel: string; // e.g. "Week 3", "Weihnachtsferien", "Prüfungsphase", "Vorlesungsfreie Zeit"
  startDate: Date;
  endDate: Date;
}

export type UrgencyLevel = "critical" | "warning" | "normal" | "overdue";

/**
 * Calculates the current TU Wien academic semester details for any given date.
 * - Wintersemester (WS): October 1 to January 31 (Lecture phase: 15 weeks), February (Break / Exams)
 * - Sommersemester (SS): March 1 to June 30 (Lecture phase: 15 weeks), July to September (Break / Exams)
 */
export function getCurrentSemester(refDate?: Date): SemesterInfo {
  const date = refDate ? new Date(refDate) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: Jan=0, Feb=1, Mar=2, ..., Sep=8, Oct=9, Nov=10, Dec=11

  let termType: "winter" | "summer";
  let academicYear: string;
  let code: string;
  let startDate: Date;
  let endDate: Date;

  if (month >= 9) {
    // October, November, December -> WS of current year / next year
    termType = "winter";
    academicYear = `${year}/${(year + 1).toString().slice(-2)}`;
    code = `WS${year.toString().slice(-2)}`;
    startDate = new Date(year, 9, 1); // Oct 1
    endDate = new Date(year + 1, 1, 28, 23, 59, 59); // End of Feb next year
  } else if (month <= 1) {
    // January, February -> WS of previous year / current year
    termType = "winter";
    academicYear = `${year - 1}/${year.toString().slice(-2)}`;
    code = `WS${(year - 1).toString().slice(-2)}`;
    startDate = new Date(year - 1, 9, 1); // Oct 1 prev year
    endDate = new Date(year, 1, 28, 23, 59, 59); // End of Feb
  } else {
    // March to September -> SS of current year
    termType = "summer";
    academicYear = `${year}`;
    code = `SS${year.toString().slice(-2)}`;
    startDate = new Date(year, 2, 1); // Mar 1
    endDate = new Date(year, 8, 30, 23, 59, 59); // End of Sep
  }

  const label = `${termType === "winter" ? "WS" : "SS"} ${academicYear}`;

  // Calculate lecture weeks and phases
  let isLecturePeriod = false;
  let currentWeek: number | null = null;
  let phaseLabel = "Vorlesungsfreie Zeit";

  if (termType === "winter") {
    // Lecture period: Oct 1 to Jan 31
    if (month >= 9 || month === 0) {
      // Check Christmas break (Dec 22 to Jan 6)
      if (month === 11 && date.getDate() >= 22) {
        phaseLabel = "Weihnachtsferien";
      } else if (month === 0 && date.getDate() <= 6) {
        phaseLabel = "Weihnachtsferien";
      } else {
        isLecturePeriod = true;
        const diffMs = date.getTime() - startDate.getTime();
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
        currentWeek = Math.min(15, Math.max(1, diffWeeks));
        phaseLabel = `Week ${currentWeek}`;
      }
    } else {
      // Month 1 (February) is semester break / exam period
      phaseLabel = "Prüfungsphase";
    }
  } else {
    // Summer semester lecture period: March 1 to June 30
    if (month >= 2 && month <= 5) {
      // Teaching period
      isLecturePeriod = true;
      const diffMs = date.getTime() - startDate.getTime();
      const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
      currentWeek = Math.min(15, Math.max(1, diffWeeks));
      phaseLabel = `Week ${currentWeek}`;
    } else if (month === 6) {
      phaseLabel = "Prüfungsphase";
    } else {
      phaseLabel = "Sommerferien";
    }
  }

  return {
    label,
    code,
    termType,
    academicYear,
    isLecturePeriod,
    currentWeek,
    phaseLabel,
    startDate,
    endDate,
  };
}

/**
 * Returns semester progress as a percentage from 0 to 100.
 */
export function getSemesterProgress(refDate?: Date): number {
  const sem = getCurrentSemester(refDate);
  const now = refDate ? new Date(refDate).getTime() : Date.now();
  const start = sem.startDate.getTime();
  const end = sem.endDate.getTime();

  if (now <= start) return 0;
  if (now >= end) return 100;

  const progress = ((now - start) / (end - start)) * 100;
  return Math.round(progress);
}

/**
 * Formats a student deadline due date into human-readable time remaining.
 */
export function formatTimeRemaining(dueDateStr: string, refDate?: Date): string {
  const target = new Date(dueDateStr).getTime();
  if (isNaN(target)) return dueDateStr;

  const now = refDate ? new Date(refDate).getTime() : Date.now();
  const diffMs = target - now;

  if (diffMs < 0) {
    const overdueMinutes = Math.floor(-diffMs / (60 * 1000));
    if (overdueMinutes < 60) return `${overdueMinutes}m ago`;
    const overdueHours = Math.floor(overdueMinutes / 60);
    if (overdueHours < 24) return `${overdueHours}h ago`;
    const overdueDays = Math.floor(overdueHours / 24);
    return `${overdueDays}d ago`;
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `in ${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `in ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    const targetDate = new Date(target);
    const timeStr = targetDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `tomorrow at ${timeStr}`;
  }

  if (diffDays < 7) {
    return `in ${diffDays}d`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return `in ${diffWeeks}w`;
}

/**
 * Categorizes a deadline due date into an urgency tier:
 * - "overdue": past deadline
 * - "critical": < 24 hours remaining
 * - "warning": < 3 days remaining
 * - "normal": >= 3 days remaining
 */
export function getUrgencyLevel(dueDateStr: string, refDate?: Date): UrgencyLevel {
  const target = new Date(dueDateStr).getTime();
  if (isNaN(target)) return "normal";

  const now = refDate ? new Date(refDate).getTime() : Date.now();
  const diffMs = target - now;

  if (diffMs < 0) return "overdue";
  if (diffMs <= 24 * 60 * 60 * 1000) return "critical";
  if (diffMs <= 72 * 60 * 60 * 1000) return "warning";
  return "normal";
}
