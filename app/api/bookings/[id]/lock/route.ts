import { NextRequest, NextResponse } from "next/server";
import { lockBooking, unlockBooking } from "@/lib/actions/bookings";
import { getBookingById } from "@/lib/actions/bookings";
import { requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/bookings/[id]/lock
 * Lock or unlock a booking (admin only)
 * Body: { action: "lock" | "unlock" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAuth();

    if (!session?.user) {
      console.log("Lock API: No session found");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user from database to get the role
    const [userWithRole] = await db
      .select({ role: adminUser.role, name: adminUser.name })
      .from(adminUser)
      .where(eq(adminUser.id, session.user.id))
      .limit(1);

    if (!userWithRole) {
      console.log("Lock API: User not found in database");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userRole = userWithRole.role;
    console.log("Lock API: User role from DB =", userRole);

    // Check if user has admin+ role
    if (userRole !== "super_admin" && userRole !== "admin") {
      console.log("Lock API: Insufficient permissions for role:", userRole);
      return NextResponse.json(
        { success: false, error: "Insufficient permissions", role: userRole },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== "lock" && action !== "unlock") {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'lock' or 'unlock'" },
        { status: 400 }
      );
    }

    // Verify booking exists
    const bookingResult = await getBookingById(id);
    if (!bookingResult.success || !bookingResult.data) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const adminUserId = session.user.id;
    const adminUserName = session.user.name || "Admin";

    // Lock or unlock the booking
    let result;
    if (action === "lock") {
      result = await lockBooking(id, adminUserId, adminUserName);
    } else {
      result = await unlockBooking(id, adminUserId, adminUserName);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        booking: result.data,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/bookings/[id]/lock:", error);

    // Handle authentication errors
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
