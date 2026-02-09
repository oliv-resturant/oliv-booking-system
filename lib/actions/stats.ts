'use server';

import { db } from "@/lib/db";
import { bookings, menuItems, menuCategories, leads, adminUser } from "@/lib/db/schema";
import { sql, eq, desc, count, and, gte } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    const totalBookings = await db
      .select({ count: count() })
      .from(bookings);

    const totalRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)` })
      .from(bookings);

    const totalMenuItems = await db
      .select({ count: count() })
      .from(menuItems)
      .where(eq(menuItems.isActive, true));

    const totalCategories = await db
      .select({ count: count() })
      .from(menuCategories)
      .where(eq(menuCategories.isActive, true));

    return {
      totalBookings: totalBookings[0]?.count || 0,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalMenuItems: totalMenuItems[0]?.count || 0,
      totalCategories: totalCategories[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalBookings: 0,
      totalRevenue: 0,
      totalMenuItems: 0,
      totalCategories: 0,
    };
  }
}

export async function getMonthlyBookingsData() {
  try {
    // Get bookings grouped by month for the current year
    const currentYear = new Date().getFullYear();

    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${bookings.eventDate}, 'Mon')`,
        monthNum: sql<number>`EXTRACT(MONTH FROM ${bookings.eventDate})`,
        bookings: count(),
        revenue: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)`,
      })
      .from(bookings)
      .where(sql`EXTRACT(YEAR FROM ${bookings.eventDate}) = ${currentYear}`)
      .groupBy(sql`TO_CHAR(${bookings.eventDate}, 'Mon')`, sql`EXTRACT(MONTH FROM ${bookings.eventDate})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${bookings.eventDate})`);

    // Fill in missing months with zero values
    const allMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const dataMap = new Map(monthlyData.map(d => [d.month, d]));

    return allMonths.map(month => ({
      month,
      bookings: dataMap.get(month)?.bookings || 0,
      revenue: Number(dataMap.get(month)?.revenue || 0),
    }));
  } catch (error) {
    console.error("Error fetching monthly bookings:", error);
    return [];
  }
}

export async function getBookingStatusDistribution() {
  try {
    const statusCounts = await db
      .select({
        status: bookings.status,
        count: count(),
      })
      .from(bookings)
      .groupBy(bookings.status);

    const statusData = [
      { name: 'Confirmed', value: 0, color: '#9DAE91' },
      { name: 'Pending', value: 0, color: '#F59E0B' },
      { name: 'Completed', value: 0, color: '#10B981' },
      { name: 'Cancelled', value: 0, color: '#EF4444' },
      { name: 'No Show', value: 0, color: '#6B7280' },
    ];

    statusCounts.forEach(({ status, count }) => {
      const item = statusData.find(d => d.name.toLowerCase() === status);
      if (item) {
        item.value = count;
      }
    });

    return statusData;
  } catch (error) {
    console.error("Error fetching status distribution:", error);
    return [];
  }
}

export async function getRecentBookings(limit: number = 10) {
  try {
    const recentBookings = await db
      .select({
        id: bookings.id,
        eventDate: bookings.eventDate,
        eventTime: bookings.eventTime,
        guestCount: bookings.guestCount,
        status: bookings.status,
        estimatedTotal: bookings.estimatedTotal,
        specialRequests: bookings.specialRequests,
        leadId: bookings.leadId,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(limit);

    // Join with leads to get contact info
    const bookingsWithContact = await Promise.all(
      recentBookings.map(async (booking) => {
        if (booking.leadId) {
          const leadData = await db
            .select({
              contactName: leads.contactName,
              contactEmail: leads.contactEmail,
              contactPhone: leads.contactPhone,
            })
            .from(leads)
            .where(eq(leads.id, booking.leadId))
            .limit(1);

          return {
            ...booking,
            contactName: leadData[0]?.contactName || null,
            contactEmail: leadData[0]?.contactEmail || null,
            contactPhone: leadData[0]?.contactPhone || null,
          };
        }
        return {
          ...booking,
          contactName: null,
          contactEmail: null,
          contactPhone: null,
        };
      })
    );

    return bookingsWithContact;
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return [];
  }
}

export async function getTopMenuItems(limit: number = 10) {
  try {
    // This would require joining with booking_items table
    // For now, return all active menu items
    const menuItemsData = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        nameDe: menuItems.nameDe,
        categoryId: menuItems.categoryId,
        pricePerPerson: menuItems.pricePerPerson,
        isActive: menuItems.isActive,
      })
      .from(menuItems)
      .where(eq(menuItems.isActive, true))
      .limit(limit);

    return menuItemsData;
  } catch (error) {
    console.error("Error fetching top menu items:", error);
    return [];
  }
}

export async function getLeadsStats() {
  try {
    const totalLeads = await db
      .select({ count: count() })
      .from(leads);

    const leadsByStatus = await db
      .select({
        status: leads.status,
        count: count(),
      })
      .from(leads)
      .groupBy(leads.status);

    return {
      total: totalLeads[0]?.count || 0,
      byStatus: leadsByStatus,
    };
  } catch (error) {
    console.error("Error fetching leads stats:", error);
    return {
      total: 0,
      byStatus: [],
    };
  }
}

// Report-specific functions

export async function getTopCustomersByRevenue(limit: number = 10) {
  try {
    // Join bookings with leads to get customer information
    // Use raw SQL to avoid GROUP BY issues with neon-http
    const result = await db.execute(sql`
      SELECT
        b.lead_id,
        COUNT(*) as booking_count,
        SUM(CAST(b.estimated_total AS NUMERIC)) as total_revenue,
        SUM(b.guest_count) as total_guests
      FROM bookings b
      WHERE b.lead_id IS NOT NULL
      GROUP BY b.lead_id
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `);

    const bookingsWithLeads = 'rows' in result ? result.rows : result;

    const customers = await Promise.all(
      (bookingsWithLeads as any[]).map(async (booking) => {
        const leadData = await db
          .select({
            contactName: leads.contactName,
            contactEmail: leads.contactEmail,
            contactPhone: leads.contactPhone,
          })
          .from(leads)
          .where(eq(leads.id, booking.lead_id))
          .limit(1);

        const bookingCount = Number(booking.booking_count) || 0;
        const totalRevenue = Number(booking.total_revenue) || 0;
        const totalGuests = Number(booking.total_guests) || 0;

        return {
          name: leadData[0]?.contactName || 'Unknown',
          email: leadData[0]?.contactEmail || '',
          phone: leadData[0]?.contactPhone || '',
          bookings: bookingCount,
          totalRevenue: totalRevenue,
          avgRevenue: bookingCount > 0 ? totalRevenue / bookingCount : 0,
          totalPersons: totalGuests,
          avgPersons: bookingCount > 0 ? totalGuests / bookingCount : 0,
        };
      })
    );

    return customers;
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }
}

export async function getMonthlyReportData(year: number = new Date().getFullYear()) {
  try {
    const monthlyData = await db
      .select({
        monthNum: sql<number>`EXTRACT(MONTH FROM ${bookings.eventDate})`,
        monthName: sql<string>`TO_CHAR(${bookings.eventDate}, 'Month')`,
        totalBookings: count(),
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)`,
        new: sql<number>`COUNT(*) FILTER (WHERE ${bookings.status} = 'pending')`,
        touchbase: sql<number>`COUNT(*) FILTER (WHERE ${bookings.status} = 'pending')`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE ${bookings.status} = 'confirmed')`,
        declined: sql<number>`COUNT(*) FILTER (WHERE ${bookings.status} = 'declined')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${bookings.status} = 'completed')`,
      })
      .from(bookings)
      .where(sql`EXTRACT(YEAR FROM ${bookings.eventDate}) = ${year}`)
      .groupBy(sql`EXTRACT(MONTH FROM ${bookings.eventDate})`, sql`TO_CHAR(${bookings.eventDate}, 'Month')`)
      .orderBy(sql`EXTRACT(MONTH FROM ${bookings.eventDate})`);

    // Fill in missing months
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dataMap = new Map(
      monthlyData.map(d => [
        d.monthNum,
        {
          month: d.monthName.trim(),
          totalBookings: d.totalBookings,
          totalRevenue: Number(d.totalRevenue) || 0,
          avgRevenue: d.totalBookings > 0 ? Number(d.totalRevenue) / d.totalBookings : 0,
          new: d.new,
          touchbase: d.touchbase,
          confirmed: d.confirmed,
          declined: d.declined,
          completed: d.completed,
          newRevenue: 0, // Would need separate calculation
          touchbaseRevenue: 0,
          confirmedRevenue: 0,
          declinedRevenue: 0,
          completedRevenue: 0,
        }
      ])
    );

    return allMonths.map((month, index) => {
      const monthNum = index + 1;
      const data = dataMap.get(monthNum);
      return data || {
        month,
        totalBookings: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        new: 0,
        touchbase: 0,
        confirmed: 0,
        declined: 0,
        completed: 0,
        newRevenue: 0,
        touchbaseRevenue: 0,
        confirmedRevenue: 0,
        declinedRevenue: 0,
        completedRevenue: 0,
      };
    });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return [];
  }
}
