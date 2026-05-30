import { MoodEntry, KindAct, Violation, Rule, EngagementLevel, WeeklyHealthScore } from "./types";

/**
 * Calculate relationship health score for a given week
 * Score is out of 100 and based on:
 * - Mood sync (30%)
 * - Kind acts (20%)
 * - Check-in consistency (20%)
 * - Rule adherence (20%)
 * - Overall engagement (10%)
 */
export function calculateWeeklyHealthScore(
    weekStartISO: string,
    moods: MoodEntry[],
    kindActs: KindAct[],
    violations: Violation[],
    rules: Rule[],
    completedTasks?: number
): Omit<WeeklyHealthScore, "id" | "computedISO"> {
    const weekStart = new Date(weekStartISO);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Filter data for the week
    const weekMoods = moods.filter((m) => {
        const date = new Date(m.dateISO);
        return date >= weekStart && date <= weekEnd;
    });

    const weekKindActs = kindActs.filter((k) => {
        const date = new Date(k.createdISO);
        return date >= weekStart && date <= weekEnd;
    });

    const weekViolations = violations.filter((v) => {
        const date = new Date(v.createdISO);
        return date >= weekStart && date <= weekEnd;
    });

    // 1. Mood average & sync
    const moodAvgScore =
        weekMoods.length > 0
            ? weekMoods.reduce((sum, m) => sum + m.score, 0) / weekMoods.length
            : 3; // neutral default

    const herMoods = weekMoods.filter((m) => m.partner === "her");
    const himMoods = weekMoods.filter((m) => m.partner === "him");

    let moodSyncPercentage = 0;
    if (herMoods.length > 0 && himMoods.length > 0) {
        // Calculate sync: how often their moods were within 1 point
        let syncDays = 0;
        for (const herMood of herMoods) {
            const himMood = himMoods.find((m) => m.dateISO === herMood.dateISO);
            if (himMood && Math.abs(herMood.score - himMood.score) <= 1) {
                syncDays++;
            }
        }
        moodSyncPercentage = Math.round(
            (syncDays / Math.max(herMoods.length, himMoods.length)) * 100
        );
    }

    const moodScore = (moodAvgScore / 5) * 30 + (moodSyncPercentage / 100) * 30;

    // 2. Kind acts
    const kindActsCount = weekKindActs.length;
    const kindActScore = Math.min(kindActsCount * 10, 20); // Max 20 points for 2+ acts

    // 3. Check-in consistency (mood entries)
    const herCheckIns = new Set(herMoods.map((m) => m.dateISO)).size;
    const himCheckIns = new Set(himMoods.map((m) => m.dateISO)).size;
    const avgCheckIns = (herCheckIns + himCheckIns) / 2;
    const checkInScore = (avgCheckIns / 7) * 20; // Out of 7 days in a week

    // 4. Rule adherence
    const activeRules = rules.filter((r) => r.status === "Active").length;
    const ruleAdherenceScore =
        activeRules > 0
            ? Math.max(20 - (weekViolations.length / activeRules) * 5, 0)
            : 20; // No rules, full score

    // 5. Overall engagement
    const completedTasksCount = completedTasks || 0;
    let engagementScore = 0;
    if (
        moodAvgScore >= 4 &&
        kindActsCount >= 1 &&
        (herCheckIns + himCheckIns >= 10 || completedTasksCount >= 2)
    ) {
        engagementScore = 10;
    } else if (moodAvgScore >= 3 && kindActsCount >= 1) {
        engagementScore = 5;
    }

    // Determine engagement level
    const totalScore =
        moodScore + kindActScore + checkInScore + ruleAdherenceScore + engagementScore;
    const overallScore = Math.round(Math.min(totalScore, 100));

    let engagementLevel: EngagementLevel;
    if (overallScore >= 75) {
        engagementLevel = "high";
    } else if (overallScore >= 50) {
        engagementLevel = "medium";
    } else {
        engagementLevel = "low";
    }

    // Calculate check-in streak
    const checkInStreakDays = Math.min(
        Math.max(herCheckIns, himCheckIns),
        7
    );

    return {
        weekStartISO,
        overallScore,
        moodAvgScore: Math.round(moodAvgScore * 100) / 100,
        moodSyncPercentage,
        kindActsCount,
        violationsCount: weekViolations.length,
        checkInStreakDays,
        completedTasksCount,
        engagementLevel,
    };
}

/**
 * Get the Monday of the week for a given date
 */
export function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
}

/**
 * Format week start date to ISO string (YYYY-MM-DD)
 */
export function formatWeekStartISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Get ISO date string for today
 */
export function getTodayISO(): string {
    return formatWeekStartISO(new Date());
}

/**
 * Get week start ISO for today
 */
export function getWeekStartISOForToday(): string {
    const weekStart = getWeekStart(new Date());
    return formatWeekStartISO(weekStart);
}
