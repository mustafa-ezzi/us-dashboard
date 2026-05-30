import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "12");

        const { data: scores, error } = await supabase
            .from("weekly_health_scores")
            .select("*")
            .eq("couple_id", coupleId)
            .order("week_start_date", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching scores:", error);
            return NextResponse.json(
                { error: "Failed to fetch health scores" },
                { status: 500 }
            );
        }

        return NextResponse.json(scores, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
