import {
    MoodEntry,
    KindAct,
    Violation,
    Rule,
    WeeklyHealthScore,
    Report,
    ReportMetrics,
    ReportType,
} from "./types";

export interface ReportGenerationOptions {
    periodStartISO: string; // YYYY-MM-DD
    periodEndISO: string; // YYYY-MM-DD
    reportType: ReportType;
    healthScores: WeeklyHealthScore[];
    moods: MoodEntry[];
    kindActs: KindAct[];
    violations: Violation[];
    memories?: { createdISO: string; text?: string }[];
}

/**
 * Generate metrics for a given period
 */
function generateMetrics(options: ReportGenerationOptions): ReportMetrics {
    const { healthScores, moods, kindActs, violations, memories } = options;

    const periodStart = new Date(options.periodStartISO);
    const periodEnd = new Date(options.periodEndISO);
    const periodEndExclusive = new Date(periodEnd);
    periodEndExclusive.setDate(periodEndExclusive.getDate() + 1);

    // Filter data for period
    const periodMoods = moods.filter((m) => {
        const date = new Date(m.dateISO);
        return date >= periodStart && date <= periodEnd;
    });

    const periodKindActs = kindActs.filter((k) => {
        const date = new Date(k.createdISO);
        return date >= periodStart && date < periodEndExclusive;
    });

    const periodViolations = violations.filter((v) => {
        const date = new Date(v.createdISO);
        return date >= periodStart && date < periodEndExclusive;
    });

    // Calculate metrics
    const averageHealthScore =
        healthScores.length > 0
            ? Math.round(
                healthScores.reduce((sum, s) => sum + s.overallScore, 0) /
                healthScores.length
            )
            : 0;

    // Mood trend
    let moodTrend: "improving" | "stable" | "declining" = "stable";
    if (healthScores.length >= 2) {
        const firstHalf = healthScores.slice(0, Math.floor(healthScores.length / 2));
        const secondHalf = healthScores.slice(Math.floor(healthScores.length / 2));
        const firstAvg =
            firstHalf.reduce((sum, s) => sum + s.overallScore, 0) / firstHalf.length;
        const secondAvg =
            secondHalf.reduce((sum, s) => sum + s.overallScore, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 10) {
            moodTrend = "improving";
        } else if (secondAvg < firstAvg - 10) {
            moodTrend = "declining";
        }
    }

    const totalKindActs = periodKindActs.length;
    const totalViolations = periodViolations.length;

    // Check-in days
    const checkInDaysCount = new Set(periodMoods.map((m) => m.dateISO)).size;

    // Completed tasks (not available in current schema but placeholder)
    const completedTasksCount = 0;

    return {
        averageHealthScore,
        moodTrend,
        totalKindActs,
        totalViolations,
        checkInDaysCount,
        completedTasksCount,
    };
}

/**
 * Generate highlights for the period
 */
function generateHighlights(options: ReportGenerationOptions): string[] {
    const { healthScores, kindActs, violations } = options;
    const highlights: string[] = [];

    // Best week
    if (healthScores.length > 0) {
        const bestWeek = healthScores.reduce((max, s) =>
            s.overallScore > max.overallScore ? s : max
        );
        highlights.push(
            `Best week: ${new Date(bestWeek.weekStartISO).toLocaleDateString()} (Score: ${bestWeek.overallScore})`
        );
    }

    // Most kind acts
    if (kindActs.length > 0) {
        const byPartner = kindActs.reduce(
            (acc, ka) => {
                acc[ka.by] = (acc[ka.by] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );
        const topPartner = Object.entries(byPartner).sort((a, b) => b[1] - a[1])[0];
        if (topPartner) {
            highlights.push(
                `${topPartner[0] === "her" ? "She" : "He"} showed ${topPartner[1]} acts of kindness`
            );
        }
    }

    // Violations trend
    if (violations.length > 0) {
        highlights.push(`${violations.length} rule violations logged this period`);
    }

    // Consistency streak
    if (healthScores.length > 0) {
        const avgStreak =
            healthScores.reduce((sum, s) => sum + s.checkInStreakDays, 0) /
            healthScores.length;
        if (avgStreak >= 5) {
            highlights.push(`Strong check-in consistency: ${Math.round(avgStreak)} days average`);
        }
    }

    return highlights;
}

/**
 * Generate insights and summary text
 */
function generateInsights(options: ReportGenerationOptions): string {
    const metrics = generateMetrics(options);

    let insight = "";

    if (metrics.averageHealthScore >= 75) {
        insight = "Your relationship is thriving! Keep nurturing this positive energy.";
    } else if (metrics.averageHealthScore >= 50) {
        insight =
            "You're maintaining a solid connection. Small efforts make a big difference.";
    } else {
        insight =
            "There's room to grow. Focus on small acts of kindness and open communication.";
    }

    if (metrics.moodTrend === "improving") {
        insight += " And things are getting better! 📈";
    } else if (metrics.moodTrend === "declining") {
        insight += " Consider having a heart-to-heart conversation. 💬";
    }

    return insight;
}

/**
 * Generate a report for a given period
 */
export function generateReport(options: ReportGenerationOptions): Omit<Report, "id" | "createdISO"> {
    const metrics = generateMetrics(options);
    const highlights = generateHighlights(options);
    const insights = generateInsights(options);

    const periodStart = new Date(options.periodStartISO);
    const periodEnd = new Date(options.periodEndISO);

    // Generate title
    let title = "";
    if (options.reportType === "weekly") {
        title = `Week of ${periodStart.toLocaleDateString()}`;
    } else if (options.reportType === "monthly") {
        title = `${periodStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
    } else if (options.reportType === "yearly") {
        title = `${periodStart.getFullYear()} — A Year Together`;
    }

    return {
        reportType: options.reportType,
        periodStartISO: options.periodStartISO,
        periodEndISO: options.periodEndISO,
        title,
        summary: `A snapshot of your relationship from ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
        keyMetrics: metrics,
        highlights,
        insights,
        healthScoresAvg: metrics.averageHealthScore,
    };
}

/**
 * Get date range for report type
 */
export function getReportDateRange(reportType: ReportType, baseDate: Date = new Date()) {
    const start = new Date(baseDate);
    const end = new Date(baseDate);

    if (reportType === "weekly") {
        // Current week (Monday to Sunday)
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        end.setDate(start.getDate() + 6);
    } else if (reportType === "monthly") {
        // Current month
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
    } else if (reportType === "yearly") {
        // Current year
        start.setMonth(0, 1);
        end.setMonth(11, 31);
    }

    return {
        startISO: formatDateISO(start),
        endISO: formatDateISO(end),
    };
}

/**
 * Format date to ISO string
 */
function formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Calculate mood trend from health scores
 */
export function calculateMoodTrend(
    healthScores: WeeklyHealthScore[]
): "improving" | "stable" | "declining" {
    if (healthScores.length < 2) return "stable";

    const sorted = [...healthScores].sort(
        (a, b) => new Date(a.weekStartISO).getTime() - new Date(b.weekStartISO).getTime()
    );

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    if (firstHalf.length === 0 || secondHalf.length === 0) return "stable";

    const firstAvg =
        firstHalf.reduce((sum, s) => sum + s.overallScore, 0) / firstHalf.length;
    const secondAvg =
        secondHalf.reduce((sum, s) => sum + s.overallScore, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 10) return "improving";
    if (secondAvg < firstAvg - 10) return "declining";
    return "stable";
}
