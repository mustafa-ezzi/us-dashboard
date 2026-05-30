import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { generateReport, getReportDateRange } from "@/lib/reports";
import { ReportType } from "@/lib/types";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.split("Bearer ")[1];
        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: member } = await supabase
            .from("couple_members")
            .select("couple_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json(
                { error: "Couple not found" },
                { status: 404 }
            );
        }

        const coupleId = member.couple_id;
        const reportType = (req.nextUrl.searchParams.get("type") || "weekly") as ReportType;
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "12");

        const { data: reports, error } = await supabase
            .from("reports")
            .select("*")
            .eq("couple_id", coupleId)
            .eq("report_type", reportType)
            .order("period_start_date", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching reports:", error);
            return NextResponse.json(
                { error: "Failed to fetch reports" },
                { status: 500 }
            );
        }

        return NextResponse.json(reports, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.split("Bearer ")[1];
        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: member } = await supabase
            .from("couple_members")
            .select("couple_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json(
                { error: "Couple not found" },
                { status: 404 }
            );
        }

        const coupleId = member.couple_id;
        const body = await req.json();
        const reportType = (body.reportType || "weekly") as ReportType;

        // Get date range for report
        const dateRange = getReportDateRange(reportType);

        // Fetch all data needed
        const [healthScores, moods, kindActs, violations] = await Promise.all([
            supabase
                .from("weekly_health_scores")
                .select("*")
                .eq("couple_id", coupleId)
                .gte("week_start_date", dateRange.startISO)
                .lte("week_start_date", dateRange.endISO)
                .then((res) => {
                    if (res.error) throw res.error;
                    return (res.data || []).map((row: any) => ({
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
                    }));
                }),
            supabase
                .from("moods")
                .select("*")
                .eq("couple_id", coupleId)
                .gte("date_iso", dateRange.startISO)
                .lte("date_iso", dateRange.endISO)
                .then((res) => {
                    if (res.error) throw res.error;
                    return (res.data || []).map((m: any) => ({
                        id: m.id,
                        partner: m.partner,
                        dateISO: m.date_iso,
                        score: m.score,
                        note: m.note,
                        createdISO: m.created_at,
                    }));
                }),
            supabase
                .from("kind_acts")
                .select("*")
                .eq("couple_id", coupleId)
                .gte("created_at", dateRange.startISO)
                .lte("created_at", dateRange.endISO)
                .then((res) => {
                    if (res.error) throw res.error;
                    return (res.data || []).map((k: any) => ({
                        id: k.id,
                        by: k.by_partner,
                        text: k.text,
                        createdISO: k.created_at,
                    }));
                }),
            supabase
                .from("violations")
                .select("*")
                .eq("couple_id", coupleId)
                .gte("created_at", dateRange.startISO)
                .lte("created_at", dateRange.endISO)
                .then((res) => {
                    if (res.error) throw res.error;
                    return (res.data || []).map((v: any) => ({
                        id: v.id,
                        ruleId: v.rule_id,
                        violator: v.violator,
                        note: v.note,
                        createdISO: v.created_at,
                    }));
                }),
        ]);

        // Generate report
        const reportData = generateReport({
            periodStartISO: dateRange.startISO,
            periodEndISO: dateRange.endISO,
            reportType,
            healthScores,
            moods,
            kindActs,
            violations,
        });

        // Save to database
        const { data: inserted, error: insertError } = await supabase
            .from("reports")
            .insert([
                {
                    couple_id: coupleId,
                    report_type: reportType,
                    period_start_date: dateRange.startISO,
                    period_end_date: dateRange.endISO,
                    title: reportData.title,
                    summary: reportData.summary,
                    key_metrics: reportData.keyMetrics,
                    highlights: reportData.highlights,
                    insights: reportData.insights,
                    health_scores_avg: reportData.healthScoresAvg,
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting report:", insertError);
            return NextResponse.json(
                { error: "Failed to generate report" },
                { status: 500 }
            );
        }

        return NextResponse.json(inserted, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
