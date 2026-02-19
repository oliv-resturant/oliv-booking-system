'use server';

import { db } from "@/lib/db";
import { bookings, bookingItems, bookingContactHistory, emailLogs, leads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingCompletion,
  sendBookingDeclined,
  sendBookingNoShow,
  sendBookingReminder,
} from "@/lib/actions/email";

export interface CreateBookingInput {
  leadId?: string;
  eventDate: Date;
  eventTime: string;
  guestCount: number;
  allergyDetails?: string[];
  specialRequests?: string;
  estimatedTotal?: number;
  requiresDeposit?: boolean;
  internalNotes?: string;
}

export async function createBooking(input: CreateBookingInput & { leadEmail?: string; leadName?: string }) {
  try {
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [booking] = await db.insert(bookings).values({
        leadId: input.leadId,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        guestCount: input.guestCount,
        allergyDetails: input.allergyDetails || [],
        specialRequests: input.specialRequests,
        estimatedTotal: input.estimatedTotal?.toString(),
        requiresDeposit: input.requiresDeposit || false,
        status: "pending",
        internalNotes: input.internalNotes,
      })
      .returning();

    // Send confirmation email if lead email is provided
    if (input.leadEmail && !input.skipEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";

      await sendBookingConfirmation({
        bookingId: booking.id,
        recipientEmail: input.leadEmail,
        bookingData: {
          ...booking,
          lead: input.leadName && input.leadEmail ? {
            contactName: input.leadName,
            contactEmail: input.leadEmail,
            contactPhone: "",
            eventDate: input.eventDate,
            eventTime: input.eventTime,
            guestCount: input.guestCount,
            source: "booking",
            status: "converted",
            createdAt: new Date(),
            updatedAt: new Date(),
          } : null,
        },
        estimatedTotal: input.estimatedTotal,
        bookingEditUrl: `${baseUrl}/booking/${booking.id}/edit`,
      });
    }

    revalidatePath("/admin/bookings");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function convertLeadToBooking(leadId: string, bookingData: CreateBookingInput) {
  try {
    // First, create the booking
    const result = await createBooking({
      ...bookingData,
      leadId,
    });

    if (!result.success) {
      return result;
    }

    // Update lead status to converted
    await db
      .update(bookings)
      .set({ leadId })
      .where(eq(bookings.id, result.data!.id));

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error converting lead to booking:", error);
    return { success: false, error: "Failed to convert lead to booking" };
  }
}

export async function updateBookingStatus(
  id: string,
  status: typeof bookings.$inferInsert.status,
  options?: {
    skipEmail?: boolean;
    reason?: string;
  }
) {
  try {
    // Get current booking with lead information
    const [currentBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .limit(1);

    if (!currentBooking) {
      return { success: false, error: "Booking not found" };
    }

    const bookingData = currentBooking.bookings;
    const leadData = currentBooking.leads;

    // Update booking status
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    // Send email based on status change (unless skipEmail is true)
    if (!options?.skipEmail && leadData?.contactEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";

      switch (status) {
        case "confirmed":
          await sendBookingConfirmation({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            estimatedTotal: bookingData.estimatedTotal
              ? parseFloat(bookingData.estimatedTotal)
              : undefined,
            bookingEditUrl: `${baseUrl}/booking/${id}/edit`,
          });
          break;

        case "cancelled":
          await sendBookingCancellation({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            reason: options?.reason,
          });
          break;

        case "completed":
          await sendBookingCompletion({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            feedbackUrl: `${baseUrl}/feedback/${id}`,
            rebookingUrl: `${baseUrl}/booking`,
          });
          break;

        case "no_show":
          await sendBookingNoShow({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
          });
          break;

        case "declined":
          await sendBookingDeclined({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            reason: options?.reason,
          });
          break;

        case "pending":
          // No email for pending status (usually initial state)
          break;
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);

    return { success: true, data: updatedBooking };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status" };
  }
}

export async function updateBooking(id: string, updates: Partial<CreateBookingInput>) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.eventDate !== undefined) updateData.eventDate = updates.eventDate;
    if (updates.eventTime !== undefined) updateData.eventTime = updates.eventTime;
    if (updates.guestCount !== undefined) updateData.guestCount = updates.guestCount;
    if (updates.allergyDetails !== undefined) {
      // Convert array to string for storage (can be converted back to array when reading)
      updateData.allergyDetails = Array.isArray(updates.allergyDetails)
        ? updates.allergyDetails.join(', ')
        : updates.allergyDetails;
    }
    if (updates.specialRequests !== undefined) updateData.specialRequests = updates.specialRequests;
    if (updates.estimatedTotal !== undefined) updateData.estimatedTotal = updates.estimatedTotal.toString();
    if (updates.requiresDeposit !== undefined) updateData.requiresDeposit = updates.requiresDeposit;
    if (updates.internalNotes !== undefined) updateData.internalNotes = updates.internalNotes;
    if (updates.menuItems !== undefined) {
      // menuItems is an array of objects with { id, name, quantity, unitPrice }
      // We'll store it as a JSON string to preserve the structure
      updateData.menuItems = JSON.stringify(updates.menuItems);
    }

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: "Failed to update booking" };
  }
}

export async function getBookings(filters?: { status?: string }) {
  try {
    let query: any = db.select().from(bookings);

    if (filters?.status) {
      query = query.where(eq(bookings.status, filters.status as any));
    }

    // @ts-ignore - neon-http driver type limitation
    const bookingsData = await query.orderBy(bookings.createdAt);

    return { success: true, data: bookingsData };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return { success: false, error: "Failed to fetch bookings", data: [] };
  }
}

export async function getBookingById(id: string) {
  try {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found", data: null };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return { success: false, error: "Failed to fetch booking", data: null };
  }
}

export async function addBookingItem(input: {
  bookingId: string;
  itemType: "menu_item" | "addon";
  itemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}) {
  try {
    const [item] = await db
      .insert(bookingItems)
      .values({
        bookingId: input.bookingId,
        itemType: input.itemType,
        itemId: input.itemId,
        quantity: input.quantity,
        unitPrice: input.unitPrice.toString(),
        notes: input.notes,
      })
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: item };
  } catch (error) {
    console.error("Error adding booking item:", error);
    return { success: false, error: "Failed to add booking item" };
  }
}

export async function getBookingItems(bookingId: string) {
  try {
    const items = await db
      .select()
      .from(bookingItems)
      .where(eq(bookingItems.bookingId, bookingId));

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching booking items:", error);
    return { success: false, error: "Failed to fetch booking items", data: [] };
  }
}

export async function logContactHistory(input: {
  bookingId: string;
  adminUserId: string;
  contactType: "email" | "phone" | "in_person" | "other";
  subject: string;
  content: string;
  isReminder?: boolean;
}) {
  try {
    const [log] = await db
      .insert(bookingContactHistory)
      .values({
        id: randomUUID(),
        ...input,
      })
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: log };
  } catch (error) {
    console.error("Error logging contact history:", error);
    return { success: false, error: "Failed to log contact history" };
  }
}

export async function getBookingContactHistory(bookingId: string) {
  try {
    const history = await db
      .select()
      .from(bookingContactHistory)
      .where(eq(bookingContactHistory.bookingId, bookingId))
      .orderBy(bookingContactHistory.createdAt);

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching contact history:", error);
    return { success: false, error: "Failed to fetch contact history", data: [] };
  }
}
