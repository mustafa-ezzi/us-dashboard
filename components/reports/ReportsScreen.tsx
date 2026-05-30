"use client";

import React, { useEffect, useState } from "react";
import { Report, ReportType } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";

type TabType = "weekly" | "monthly" | "yearly";

export function ReportsScreen() {
    const [reports, setReports] = useState<Report[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("weekly");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/reports?type=${activeTab}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch reports");
                }

                const data = await response.json();
                setReports(
                    data.map((row: any) => ({
                        id: row.id,
                        reportType: row.report_type,
                        periodStartISO: row.period_start_date,
                        periodEndISO: row.period_end_date,
                        title: row.title,
                        summary: row.summary,
                        keyMetrics: row.key_metrics,
                        highlights: row.highlights,
                        insights: row.insights,
                        healthScoresAvg: row.health_scores_avg,
                        createdISO: row.created_at,
                    }))
                );
                setError(null);
            } catch (err) {
                console.error("Error fetching reports:", err);
                setError("Unable to load reports");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, [activeTab]);

    const handleGenerateReport = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reportType: activeTab }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate report");
            }

            const newReport = await response.json();
            setReports([
                {
                    id: newReport.id,
                    reportType: newReport.report_type,
                    periodStartISO: newReport.period_start_date,
                    periodEndISO: newReport.period_end_date,
                    title: newReport.title,
                    summary: newReport.summary,
                    keyMetrics: newReport.key_metrics,
                    highlights: newReport.highlights,
                    insights: newReport.insights,
                    healthScoresAvg: newReport.health_scores_avg,
                    createdISO: newReport.created_at,
                },
                ...reports,
            ]);
        } catch (err) {
            console.error("Error generating report:", err);
            setError("Failed to generate report");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <PageHeader title="Relationship Reports" subtitle="Insights and trends over time" />

            <div className="max-w-2xl mx-auto px-4 pb-20">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                    {(["weekly", "monthly", "yearly"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                    ? "text-rose-600 border-b-2 border-rose-600"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Generating..." : `Generate ${activeTab} Report`}
                </button>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Reports List */}
                {isLoading && reports.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        No {activeTab} reports yet. Generate one to get started!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ReportCardProps {
    report: Report;
}

function ReportCard({ report }: ReportCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-slate-500">{report.summary}</p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    {report.healthScoresAvg !== undefined && (
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Health Score</p>
                            <p className="text-3xl font-bold text-rose-600">{report.healthScoresAvg}</p>
                            <p className="text-xs text-slate-500">out of 100</p>
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Mood Trend</p>
                            <p className="text-sm font-semibold text-slate-900 capitalize">
                                {report.keyMetrics.moodTrend}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Kind Acts</p>
                            <p className="text-sm font-semibold text-slate-900">
                                {report.keyMetrics.totalKindActs}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Check-ins</p>
                            <p className="text-sm font-semibold text-slate-900">
                                {report.keyMetrics.checkInDaysCount} days
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Violations</p>
                            <p className="text-sm font-semibold text-slate-900">
                                {report.keyMetrics.totalViolations}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                <div className="mb-4">
                    <p className="text-sm text-slate-700 italic">{report.insights}</p>
                </div>

                {/* Highlights */}
                {report.highlights.length > 0 && (
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Highlights</p>
                        <ul className="space-y-2">
                            {report.highlights.map((highlight, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex items-start">
                                    <span className="text-rose-400 mr-2">•</span>
                                    <span>{highlight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Date */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Generated on {new Date(report.createdISO).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
