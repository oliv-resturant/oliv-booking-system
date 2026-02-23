import { NextRequest, NextResponse } from "next/server";
import { ensureBookingSecret } from "@/lib/booking-security";
import { requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/bookings/[id]/generate-secret
 * Generate or retrieve the edit secret for a booking (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAuth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user role from database
    const [userWithRole] = await db
      .select({ role: adminUser.role })
      .from(adminUser)
      .where(eq(adminUser.id, session.user.id))
      .limit(1);

    if (!userWithRole) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has admin+ role
    if (userWithRole.role !== "super_admin" && userWithRole.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Generate or retrieve the secret
    const editSecret = await ensureBookingSecret(id);

    return NextResponse.json({
      success: true,
      editSecret,
    });
  } catch (error) {
    console.error("Error generating edit secret:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
