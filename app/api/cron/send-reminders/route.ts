import { sendRemindersForNext24Hours } from "@/lib/actions/reminders";
import { NextResponse } from "next/server";

/**
 * API Endpoint to send reminder emails
 * Can be called by cron job services like Vercel Cron, GitHub Actions, or external services
 *
 * Example cron configuration:
 * - Run every hour: 0 * * * *
 * - Run every day at 9 AM: 0 9 * * *
 *
 * Security: In production, add authentication (API key, cron secret, etc.)
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendRemindersForNext24Hours();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in cron endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual triggering
 */
export async function POST(request: Request) {
  try {
    // Verify authentication for manual triggers
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendRemindersForNext24Hours();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in manual reminder trigger:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
