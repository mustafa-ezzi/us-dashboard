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
}
