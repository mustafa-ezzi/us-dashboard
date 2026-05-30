"use client";

import React, { useEffect, useState } from "react";
import { WeeklyHealthScore } from "@/lib/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const engagementColors = {
    high: "from-green-400 to-emerald-600",
    medium: "from-yellow-400 to-amber-600",
    low: "from-red-400 to-rose-600",
};

const engagementLabels = {
    high: "Thriving",
    medium: "Steady",
    low: "Low Energy",
};

interface HealthScoreCardProps {
    loading?: boolean;
    error?: string;
}

export function HealthScoreCard({ loading = false, error }: HealthScoreCardProps) {
    const supabase = useSupabaseClient();
    const [healthScore, setHealthScore] = useState<WeeklyHealthScore | null>(null);
    const [isLoading, setIsLoading] = useState(loading);
    const [errorMsg, setErrorMsg] = useState(error);

    useEffect(() => {
        const fetchHealthScore = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/health-score");

                if (!response.ok) {
                    throw new Error("Failed to fetch health score");
                }

                const data = await response.json();
                setHealthScore({
                    id: data.id,
                    weekStartISO: data.week_start_date,
                    overallScore: data.overall_score,
                    moodAvgScore: data.mood_avg_score,
                    moodSyncPercentage: data.mood_sync_percentage,
                    kindActsCount: data.kind_acts_count,
                    violationsCount: data.violations_count,
                    checkInStreakDays: data.check_in_streak_days,
                    completedTasksCount: data.completed_tasks_count,
                    engagementLevel: data.engagement_level,
                    computedISO: data.computed_at,
                });
                setErrorMsg(null);
            } catch (err) {
                console.error("Error fetching health score:", err);
                setErrorMsg("Unable to load health score");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHealthScore();
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 p-6 shadow-sm">
                <div className="flex items-center justify-center h-32">
                    <div className="text-slate-400">Computing health score...</div>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="rounded-lg bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm border border-red-200">
                <p className="text-red-600 text-sm">{errorMsg}</p>
            </div>
        );
    }

    if (!healthScore) {
        return (
            <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 p-6 shadow-sm">
                <div className="text-slate-500 text-center text-sm">
                    No health score data available
                </div>
            </div>
        );
    }

    const gradientClass = engagementColors[healthScore.engagementLevel];
    const engagementLabel = engagementLabels[healthScore.engagementLevel];

    return (
        <div className={`rounded-lg bg-gradient-to-br ${gradientClass} p-6 shadow-md text-white`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold opacity-90">Relationship Health</h3>
                    <p className="text-sm opacity-75">This week's connection</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold">{healthScore.overallScore}</div>
                    <p className="text-sm opacity-75">out of 100</p>
                </div>
            </div>

            <div className="bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
                <div
                    className="h-full bg-white/40"
                    style={{ width: `${healthScore.overallScore}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/10 rounded p-3">
                    <p className="text-xs opacity-75 mb-1">Mood Sync</p>
                    <p className="text-sm font-semibold">{healthScore.moodSyncPercentage}%</p>
                </div>
                <div className="bg-white/10 rounded p-3">
                    <p className="text-xs opacity-75 mb-1">Avg Mood</p>
                    <p className="text-sm font-semibold">{healthScore.moodAvgScore}/5.0</p>
                </div>
                <div className="bg-white/10 rounded p-3">
                    <p className="text-xs opacity-75 mb-1">Kind Acts</p>
                    <p className="text-sm font-semibold">{healthScore.kindActsCount}</p>
                </div>
                <div className="bg-white/10 rounded p-3">
                    <p className="text-xs opacity-75 mb-1">Check-in Streak</p>
                    <p className="text-sm font-semibold">{healthScore.checkInStreakDays}d</p>
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm font-medium opacity-90">{engagementLabel}</p>
            </div>
        </div>
    );
}

interface HealthScoreHistoryProps {
    limit?: number;
}

export function HealthScoreHistory({ limit = 12 }: HealthScoreHistoryProps) {
    const supabase = useSupabaseClient();
    const [scores, setScores] = useState<WeeklyHealthScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/health-score/history?limit=${limit}`);
                if (!response.ok) throw new Error("Failed to fetch history");

                const data = await response.json();
                setScores(
                    data.map((row: any) => ({
                        id: row.id,
                        weekStartISO: row.week_start_date,
                        overallScore: row.overall_score,
                        moodAvgScore: row.mood_avg_score,
                        moodSyncPercentage: row.mood_sync_percentage,
                        kindActsCount: row.kind_acts_count,
                        violationsCount: row.violations_count,
                        checkInStreakDays: row.check_in_streak_days,
                        completedTasksCount: row.completed_tasks_count,
                        engagementLevel: row.engagement_level,
                        computedISO: row.computed_at,
                    }))
                );
            } catch (err) {
                console.error("Error fetching health score history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [limit]);

    if (isLoading) {
        return <div className="text-slate-400">Loading history...</div>;
    }

    return (
        <div className="space-y-2">
            {scores.map((score) => (
                <div
                    key={score.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                            Week of {new Date(score.weekStartISO).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">{score.engagementLevel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{score.overallScore}</p>
                        <p className="text-xs text-slate-500">{score.moodSyncPercentage}% sync</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
