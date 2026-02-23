'use server';

import { db } from "@/lib/db";
import { bookings, leads, bookingItems, menuItems, menuCategories, bookingContactHistory } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function fetchBookings() {
  try {
    // Using SQL query for ordering since neon-http doesn't support .orderBy()
    const result = await db.execute(sql`
      SELECT
        b.id,
        b.lead_id,
        b.event_date,
        b.event_time,
        b.guest_count,
        b.allergy_details,
        b.special_requests,
        b.internal_notes,
        b.estimated_total,
        b.status,
        b.created_at,
        b.is_locked,
        l.contact_name,
        l.contact_email,
        l.contact_phone
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      ORDER BY b.created_at DESC
    `);

    // db.execute returns { rows: [...] } with neon-http
    const allBookings = 'rows' in result ? result.rows : result;

    // Fetch all booking items for all bookings
    const bookingItemsResult = await db.execute(sql`
      SELECT
        bi.booking_id,
        bi.item_id,
        bi.quantity,
        bi.unit_price,
        mi.name,
        mi.category_id,
        mc.name as category_name
      FROM booking_items bi
      LEFT JOIN menu_items mi ON bi.item_id = mi.id
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE bi.item_type = 'menu_item'
    `);

    const allBookingItems = 'rows' in bookingItemsResult ? bookingItemsResult.rows : bookingItemsResult;

    // Group items by booking_id
    const itemsByBooking: Record<string, any[]> = {};
    for (const item of allBookingItems as any[]) {
      if (!itemsByBooking[item.booking_id]) {
        itemsByBooking[item.booking_id] = [];
      }
      itemsByBooking[item.booking_id].push({
        item: item.name || 'Unknown Item',
        category: item.category_name || 'Unknown',
        quantity: `${item.quantity} x ${Math.round(Number(item.unit_price))} CHF`,
        price: `CHF ${(Number(item.unit_price) * item.quantity).toFixed(2)}`,
      });
    }

    return (allBookings as any[]).map((booking: any) => {
      const contactName = booking.contact_name || 'Unknown';
      const firstName = contactName.split(' ')[0] || 'Guest';
      const lastName = contactName.split(' ').slice(1).join(' ') || '';
      const daysAgo = booking.created_at
        ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Get menu items for this booking
      const menuItemsList = itemsByBooking[booking.id] || [];

      // Parse special requests and internal notes
      const notes = booking.special_requests || '';
      const internalNotes = booking.internal_notes || '';

      // Extract address from internal notes
      const addressMatch = internalNotes.match(/Address: ([^\n]+)/);
      const address = addressMatch ? addressMatch[1] : '';

      // Extract menu selection from internal notes for display in notes
      const menuMatch = internalNotes.match(/Menu Selection: ([^\n]+)/);
      const menuSelectionStr = menuMatch ? menuMatch[1] : '';

      // Combine notes with menu selection for display
      const displayNotes = [notes, menuSelectionStr].filter(Boolean).join('\n');

      return {
        id: booking.id,
        customer: {
          name: contactName,
          firstName,
          lastName,
          email: booking.contact_email || '',
          phone: booking.contact_phone || '',
          avatar: contactName.charAt(0).toUpperCase() || 'G',
          avatarColor: '#9DAE91',
          address: address,
        },
        event: {
          date: booking.event_date
            ? new Date(booking.event_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '',
          time: booking.event_time ? booking.event_time.substring(0, 5) : '',
          occasion: 'Event',
        },
        guests: booking.guest_count || 0,
        amount: booking.estimated_total
          ? `CHF ${Number(booking.estimated_total).toLocaleString()}`
          : 'CHF 0',
        status: booking.status || 'pending',
        contacted: {
          by: 'Admin',
          when: `${daysAgo}d ago`,
        },
        booking: `${daysAgo}d ago`,
        allergies: booking.allergy_details || '',
        notes: displayNotes,
        menuItems: menuItemsList,
        contactHistory: [],
        isLocked: booking.is_locked || false,
      };
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  try {
    // Use raw SQL for update since neon-http doesn't support .update() properly
    await db.execute(sql`
      UPDATE bookings
      SET status = ${newStatus}
      WHERE id = ${bookingId}
    `);

    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
