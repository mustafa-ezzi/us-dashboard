export type PartnerKey = "her" | "him";

export interface Partner {
  key: PartnerKey;
  name: string;
  emoji: string;
}

export interface AppSettings {
  anniversaryISO: string;
  engagementISO: string | null;
  her: Partner;
  him: Partner;
}

export interface NotificationPrefs {
  pushEnabled: boolean;
  dailyReminderTime: string; // HH:MM (24h)
  reminderTimezone: string;
}

export type DatePlanStatus = "pending" | "accepted" | "rejected";

export interface PlannedDate {
  id: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  createdBy: PartnerKey;
  status: DatePlanStatus;
  responseReason?: string;
  respondedBy?: PartnerKey;
  respondedAtISO?: string;
  notes?: string;
  createdISO: string;
}

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  partner: PartnerKey;
  dateISO: string;
  score: MoodScore;
  note?: string;
  createdISO: string;
}

export type RuleStatus = "Active" | "Under Review" | "Retired";

export interface Rule {
  id: string;
  title: string;
  description?: string;
  proposedBy: PartnerKey;
  status: RuleStatus;
  createdISO: string;
}

export interface Violation {
  id: string;
  ruleId: string;
  violator: PartnerKey;
  note?: string;
  createdISO: string;
}

export interface ApologyEntry {
  id: string;
  apologizer: PartnerKey;
  note?: string;
  createdISO: string;
}

export interface ImmaturityEntry {
  id: string;
  note?: string;
  createdISO: string;
}

export interface KindAct {
  id: string;
  by: PartnerKey;
  text: string;
  createdISO: string;
}

export type MemoryTag =
  | "First Times"
  | "Fights We Survived"
  | "Laughed Hard"
  | "Dates"
  | "Special Moments"
  | "Milestones"
  | "Adventures"
  | "Inside Jokes"
  | "Other";

export interface Memory {
  id: string;
  text: string;
  imageUrl?: string;
  tags: MemoryTag[];
  memoryDateISO: string; // YYYY-MM-DD
  createdISO: string;
}

export interface SecretMessage {
  id: string;
  dateISO: string; // YYYY-MM-DD
  time: string; // HH:MM
  createdBy: PartnerKey;
  note: string;
  mood: string;
  voiceUrl?: string;
  createdISO: string;
}

export type EngagementLevel = "low" | "medium" | "high";

export interface WeeklyHealthScore {
  id: string;
  weekStartISO: string; // YYYY-MM-DD
  overallScore: number; // 0-100
  moodAvgScore: number; // 1-5
  moodSyncPercentage: number; // 0-100
  kindActsCount: number;
  violationsCount: number;
  checkInStreakDays: number;
  completedTasksCount?: number;
  engagementLevel: EngagementLevel;
  notes?: string;
  computedISO: string;
}

export interface ReportMetrics {
  averageHealthScore: number;
  moodTrend: "improving" | "stable" | "declining";
  moodAvgScore?: number;
  moodSyncPercentage?: number;
  totalKindActs: number;
  totalViolations: number;
  checkInDaysCount: number;
  completedTasksCount: number;
}

export type ReportType = "weekly" | "monthly" | "yearly";

export interface Report {
  id: string;
  reportType: ReportType;
  periodStartISO: string;
  periodEndISO: string;
  title?: string;
  summary?: string;
  keyMetrics: ReportMetrics;
  highlights: string[];
  insights?: string;
  healthScoresAvg?: number;
  createdISO: string;
}

export interface YearlyReportArchive {
  id: string;
  year: number;
  fullReport: Report;
  createdISO: string;
}

export interface AppState {
  settings: AppSettings;
  notificationPrefs: NotificationPrefs;
  plannedDates: PlannedDate[];
  moods: MoodEntry[];
  rules: Rule[];
  violations: Violation[];
  apologies: ApologyEntry[];
  immaturity: ImmaturityEntry[];
  kindActs: KindAct[];
  memories: Memory[];
  secretMessages: SecretMessage[];
  weeklyHealthScores: WeeklyHealthScore[];
  reports: Report[];
}
