import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { BookingsPage } from "@/components/admin/BookingsPage";

export default async function AdminBookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen self-start">
        <DashboardSidebar activeItem="bookings" />
      </div>

      <div className="flex-1 flex flex-col items-center overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1440px] flex flex-col flex-1">
          <div className="sticky top-0 z-10 bg-background">
            <DashboardHeader currentPage="bookings" />
          </div>

          <main className="flex-1 px-8 pt-3 pb-8">
            <BookingsPage />
          </main>
        </div>
      </div>
    </div>
  );
}
