import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { KPICard } from "@/components/admin/KPICard";
import { BookingsChart, RevenueChart, StatusDistributionChart, ChartCard } from "@/components/admin/DashboardCharts";
import { getDashboardStats, getMonthlyBookingsData, getBookingStatusDistribution } from "@/lib/actions/stats";
import { Calendar, DollarSign, Package } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch real data from database
  const [stats, bookingsData, statusData] = await Promise.all([
    getDashboardStats(),
    getMonthlyBookingsData(),
    getBookingStatusDistribution(),
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sticky Sidebar */}
      <div className="sticky top-0 h-screen self-start">
        <DashboardSidebar activeItem="dashboard" />
      </div>

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1440px] flex flex-col flex-1">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background">
            <DashboardHeader isScrolled={false} currentPage="dashboard" />
          </div>

          {/* Main Content */}
          <main className="flex-1 px-8 pt-3 pb-8 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              <KPICard
                title="No. of Bookings"
                value={stats.totalBookings.toString()}
                iconName="Calendar"
                variant="compact"
              />
              <KPICard
                title="Total Revenue"
                value={`CHF ${stats.totalRevenue.toLocaleString()}`}
                iconName="DollarSign"
                variant="compact"
              />
              <KPICard
                title="Total Items"
                value={stats.totalMenuItems.toString()}
                iconName="Package"
                variant="compact"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookings Chart */}
              <ChartCard title="Monthly Bookings">
                <BookingsChart data={bookingsData} />
              </ChartCard>

              {/* Revenue Chart */}
              <ChartCard title="Monthly Revenue">
                <RevenueChart data={bookingsData} />
              </ChartCard>
            </div>

            {/* Status Distribution Chart */}
            <div className="grid grid-cols-1">
              <ChartCard title="Booking Status Distribution">
                <StatusDistributionChart data={statusData} />
              </ChartCard>
            </div>

            {/* Copyright Footer */}
            <div className="text-center pt-4 pb-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                © 2026 OLIV Restaurant & Bar
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
