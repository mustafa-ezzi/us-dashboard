"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSupabase } from "@/lib/supabase/client";
import type { Report } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  FileText,
  HeartHandshake,
  Loader2,
  ShieldAlert,
  Smile,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type TabType = "weekly" | "monthly" | "yearly";

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reports?type=${activeTab}`, {
          headers: await authHeaders(),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data.map(mapReportRow));
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
        headers: await authHeaders(),
        body: JSON.stringify({ reportType: activeTab }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to generate report");
      }

      const mappedReport = mapReportRow(await response.json());
      setReports((currentReports) => [
        mappedReport,
        ...currentReports.filter(
          (report) =>
            !(
              report.reportType === mappedReport.reportType &&
              report.periodStartISO === mappedReport.periodStartISO
            )
        ),
      ]);
      setError(null);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Relationship Reports"
        subtitle="Health, habits, and patterns over time."
      />

      <section className="card p-3">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-rose-50 p-1">
          {(["weekly", "monthly", "yearly"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-white text-rose shadow-card"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="btn-primary mt-3 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate {activeTab} report
            </>
          )}
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && reports.length === 0 ? (
        <div className="card grid min-h-40 place-items-center p-6 text-sm text-ink-muted">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="card grid min-h-40 place-items-center p-6 text-center">
          <FileText className="mb-2 text-rose" size={28} />
          <p className="text-sm font-semibold text-ink">
            No {activeTab} reports yet
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Generate one after mood logs, kind acts, or contract activity.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const score = report.healthScoresAvg ?? report.keyMetrics.averageHealthScore ?? 0;
  const trend = report.keyMetrics.moodTrend;
  const TrendIcon =
    trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Activity;
  const scoreTone =
    score >= 75
      ? "bg-emerald-50 text-emerald-700"
      : score >= 50
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return (
    <article className="card overflow-hidden">
      <div className="border-b border-line/70 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="stat-label mb-1">{report.reportType} report</p>
            <h3 className="text-lg font-semibold leading-tight text-ink">
              {report.title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              {report.summary}
            </p>
          </div>
          <div className={`shrink-0 rounded-2xl px-3 py-2 text-center ${scoreTone}`}>
            <p className="text-2xl font-bold leading-none">{score}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase">/ 100</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-rose-50">
          <div
            className="h-full rounded-full bg-rose transition-all"
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <MetricTile icon={TrendIcon} label="Mood trend" value={trend} />
          <MetricTile icon={Smile} label="Avg mood" value={formatMood(report)} />
          <MetricTile
            icon={HeartHandshake}
            label="Kind acts"
            value={report.keyMetrics.totalKindActs}
          />
          <MetricTile
            icon={ShieldAlert}
            label="Violations"
            value={report.keyMetrics.totalViolations}
          />
          <MetricTile
            icon={CalendarCheck}
            label="Check-ins"
            value={`${report.keyMetrics.checkInDaysCount} days`}
          />
          <MetricTile icon={Activity} label="Mood sync" value={formatSync(report)} />
        </div>

        {report.insights && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-700">
              Insight
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              {report.insights}
            </p>
          </div>
        )}

        {report.highlights.length > 0 && (
          <div>
            <p className="stat-label mb-2">Highlights</p>
            <ul className="space-y-2">
              {report.highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 rounded-xl border border-line/70 bg-white px-3 py-2 text-sm text-ink-soft"
                >
                  <AlertTriangle
                    size={14}
                    className="mt-0.5 shrink-0 text-rose"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="border-t border-line/70 pt-3 text-[11px] text-ink-subtle">
          Generated on {new Date(report.createdISO).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
        <Icon size={13} className="text-rose" />
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-ink">{value}</p>
    </div>
  );
}

function formatMood(report: Report) {
  return report.keyMetrics.moodAvgScore
    ? `${report.keyMetrics.moodAvgScore}/5`
    : "No data";
}

function formatSync(report: Report) {
  return report.keyMetrics.moodSyncPercentage !== undefined
    ? `${report.keyMetrics.moodSyncPercentage}%`
    : "No data";
}

function mapReportRow(row: any): Report {
  return {
    id: row.id,
    reportType: row.report_type,
    periodStartISO: row.period_start_date,
    periodEndISO: row.period_end_date,
    title: row.title,
    summary: row.summary,
    keyMetrics: row.key_metrics,
    highlights: row.highlights ?? [],
    insights: row.insights,
    healthScoresAvg: row.health_scores_avg,
    createdISO: row.created_at,
  };
}
