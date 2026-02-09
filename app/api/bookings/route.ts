import { fetchBookings } from "@/lib/actions/fetch-bookings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bookings = await fetchBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error in bookings API:", error);
    return NextResponse.json([], { status: 500 });
  }
}
