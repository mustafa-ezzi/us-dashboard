import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
    calculateWeeklyHealthScore,
    getWeekStartISOForToday,
    formatWeekStartISO,
    getWeekStart,
} from "@/lib/health-score";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(req: NextRequest) {
    try {
        // Get user from auth header
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

        // Get couple_id
        const { data: member, error: memberError } = await supabase
            .from("couple_members")
            .select("couple_id")
            .eq("user_id", user.id)
            .single();

        if (memberError || !member) {
            return NextResponse.json(
                { error: "Couple not found" },
                { status: 404 }
            );
        }

        const coupleId = member.couple_id;
        const weekStartISO = getWeekStartISOForToday();

        // Check if health score already computed for this week
        const { data: existing, error: existingError } = await supabase
            .from("weekly_health_scores")
            .select("*")
            .eq("couple_id", coupleId)
            .eq("week_start_date", weekStartISO)
            .single();

        if (!existingError && existing) {
            return NextResponse.json(existing, { status: 200 });
        }

        // Fetch all data needed for calculation
        const [moods, kindActs, violations, rules] = await Promise.all([
            supabase
                .from("moods")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
            supabase
                .from("kind_acts")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
            supabase
                .from("violations")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
            supabase
                .from("rules")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
        ]);

        // Transform database format to app format
        const appMoods = moods.map((m: any) => ({
            id: m.id,
            partner: m.partner,
            dateISO: m.date_iso,
            score: m.score,
            note: m.note,
            createdISO: m.created_at,
        }));

        const appKindActs = kindActs.map((k: any) => ({
            id: k.id,
            by: k.by_partner,
            text: k.text,
            createdISO: k.created_at,
        }));

        const appViolations = violations.map((v: any) => ({
            id: v.id,
            ruleId: v.rule_id,
            violator: v.violator,
            note: v.note,
            createdISO: v.created_at,
        }));

        const appRules = rules.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            proposedBy: r.proposed_by,
            status: r.status,
            createdISO: r.created_at,
        }));

        // Calculate health score
        const scoreData = calculateWeeklyHealthScore(
            weekStartISO,
            appMoods,
            appKindActs,
            appViolations,
            appRules
        );

        // Insert into database
        const { data: inserted, error: insertError } = await supabase
            .from("weekly_health_scores")
            .insert([
                {
                    couple_id: coupleId,
                    week_start_date: scoreData.weekStartISO,
                    overall_score: scoreData.overallScore,
                    mood_avg_score: scoreData.moodAvgScore,
                    mood_sync_percentage: scoreData.moodSyncPercentage,
                    kind_acts_count: scoreData.kindActsCount,
                    violations_count: scoreData.violationsCount,
                    check_in_streak_days: scoreData.checkInStreakDays,
                    completed_tasks_count: scoreData.completedTasksCount,
                    engagement_level: scoreData.engagementLevel,
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting health score:", insertError);
            return NextResponse.json(
                { error: "Failed to compute health score" },
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

/**
 * POST: Force recompute health scores for a specific week or all past weeks
 */
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
        const weekStartISO = body.weekStartISO || getWeekStartISOForToday();

        // Delete existing score for this week if recomputing
        if (body.recompute) {
            await supabase
                .from("weekly_health_scores")
                .delete()
                .eq("couple_id", coupleId)
                .eq("week_start_date", weekStartISO);
        }

        // Fetch data and compute
        const [moods, kindActs, violations, rules] = await Promise.all([
            supabase
                .from("moods")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
            supabase
                .from("kind_acts")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
            supabase
                .from("violations")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
            supabase
                .from("rules")
                .select("*")
                .eq("couple_id", coupleId)
                .then((res) => res.data || []),
        ]);

        // Transform
        const appMoods = moods.map((m: any) => ({
            id: m.id,
            partner: m.partner,
            dateISO: m.date_iso,
            score: m.score,
            note: m.note,
            createdISO: m.created_at,
        }));

        const appKindActs = kindActs.map((k: any) => ({
            id: k.id,
            by: k.by_partner,
            text: k.text,
            createdISO: k.created_at,
        }));

        const appViolations = violations.map((v: any) => ({
            id: v.id,
            ruleId: v.rule_id,
            violator: v.violator,
            note: v.note,
            createdISO: v.created_at,
        }));

        const appRules = rules.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            proposedBy: r.proposed_by,
            status: r.status,
            createdISO: r.created_at,
        }));

        const scoreData = calculateWeeklyHealthScore(
            weekStartISO,
            appMoods,
            appKindActs,
            appViolations,
            appRules
        );

        const { data: inserted, error: insertError } = await supabase
            .from("weekly_health_scores")
            .insert([
                {
                    couple_id: coupleId,
                    week_start_date: scoreData.weekStartISO,
                    overall_score: scoreData.overallScore,
                    mood_avg_score: scoreData.moodAvgScore,
                    mood_sync_percentage: scoreData.moodSyncPercentage,
                    kind_acts_count: scoreData.kindActsCount,
                    violations_count: scoreData.violationsCount,
                    check_in_streak_days: scoreData.checkInStreakDays,
                    completed_tasks_count: scoreData.completedTasksCount,
                    engagement_level: scoreData.engagementLevel,
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting health score:", insertError);
            return NextResponse.json(
                { error: "Failed to compute health score" },
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
