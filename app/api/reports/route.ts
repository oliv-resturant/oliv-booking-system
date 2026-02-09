import { getTopCustomersByRevenue, getMonthlyReportData } from "@/lib/actions/stats";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const [topCustomers, monthlyReport] = await Promise.all([
      getTopCustomersByRevenue(10),
      getMonthlyReportData(selectedYear),
    ]);

    return NextResponse.json({
      topCustomers,
      monthlyReport,
    });
  } catch (error) {
    console.error("Error in reports API:", error);
    return NextResponse.json(
      { topCustomers: [], monthlyReport: [] },
      { status: 500 }
    );
  }
}
