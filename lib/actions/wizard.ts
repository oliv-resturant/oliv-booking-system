'use server';

import { db } from "@/lib/db";
import { leads, bookings, bookingItems, menuItems, menuCategories } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { ensureBookingSecret } from "@/lib/booking-security";

// Mock menu items data with prices (same as menuItemsData.ts)
const mockMenuItems: Record<string, { name: string; price: number }> = {
  '1': { name: 'Salmon Crostini with Dill Cream', price: 9 },
  '2': { name: 'Caprese Skewers', price: 8 },
  '3': { name: 'Mini Quiches', price: 7 },
  '4': { name: 'Bruschetta Variations', price: 6 },
  '5': { name: 'Caesar Salad', price: 12 },
  '6': { name: 'Mediterranean Salad', price: 11 },
  '7': { name: 'Quinoa Bowl', price: 13 },
  '8': { name: 'Tomato Basil Soup', price: 8 },
  '9': { name: 'Mushroom Soup', price: 9 },
  '10': { name: 'Pasta Carbonara', price: 16 },
  '11': { name: 'Penne Arrabbiata', price: 14 },
  '12': { name: 'Truffle Risotto', price: 18 },
  '13': { name: 'Grilled Salmon', price: 24 },
  '14': { name: 'Beef Tenderloin', price: 28 },
  '15': { name: 'Chicken Breast', price: 22 },
  '16': { name: 'Vegetable Risotto', price: 19 },
  '17': { name: 'Grilled Prawns', price: 26 },
  '18': { name: 'Sea Bass', price: 27 },
  '19': { name: 'Cheese Platter', price: 15 },
  '20': { name: 'Fondue', price: 22 },
  '21': { name: 'Tiramisu', price: 8 },
  '22': { name: 'Chocolate Lava Cake', price: 9 },
  '23': { name: 'Panna Cotta', price: 7 },
  '24': { name: 'Fruit Tart', price: 8 },
};

export interface WizardFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  business?: string;
  street?: string;
  plz?: string;
  location?: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  occasion?: string;
  specialRequests?: string;
  selectedItems: string[];
  itemQuantities: Record<string, number>;
  allergyDetails?: string[];
  bookingId?: string | null; // For editing existing bookings
}

export async function submitWizardForm(data: WizardFormData) {
  try {
    console.log('\n========================================');
    console.log('📝 WIZARD FORM SUBMIT');
    console.log('========================================');
    console.log('Booking ID:', data.bookingId);
    console.log('Edit Mode:', !!data.bookingId);

    // If bookingId is provided, this is an UPDATE to existing booking
    if (data.bookingId) {
      console.log('🔄 UPDATING EXISTING BOOKING');

      // Delete existing booking items first
      await db.delete(bookingItems).where(eq(bookingItems.bookingId, data.bookingId));

      // Fetch menu items and calculate new totals
      const allMenuItems = await db
        .select({
          id: menuItems.id,
          pricePerPerson: menuItems.pricePerPerson,
        })
        .from(menuItems)
        .where(eq(menuItems.isActive, true));

      const menuItemMap = new Map(allMenuItems.map(item => [item.id, item]));
      let estimatedTotal = 0;

      // Create new booking items
      for (const itemId of data.selectedItems) {
        const dbItem = menuItemMap.get(itemId);
        const quantity = data.itemQuantities[itemId] || 1;

        if (dbItem) {
          const unitPrice = Number(dbItem.pricePerPerson);
          const itemTotal = unitPrice * quantity * data.guestCount;
          estimatedTotal += itemTotal;

          await db.insert(bookingItems).values({
            id: randomUUID(),
            bookingId: data.bookingId,
            itemType: "menu_item",
            itemId: dbItem.id,
            quantity,
            unitPrice: dbItem.pricePerPerson,
          });
        }
      }

      // Update booking details
      const eventTime = data.eventTime || '18:00:00';
      const updateData: any = {
        eventDate: new Date(data.eventDate),
        eventTime: eventTime,
        guestCount: data.guestCount,
        allergyDetails: data.allergyDetails || [],
        specialRequests: data.specialRequests || null,
        estimatedTotal: estimatedTotal.toString(),
        requiresDeposit: estimatedTotal > 1000,
        updatedAt: new Date(),
      };

      await db.update(bookings)
        .set(updateData)
        .where(eq(bookings.id, data.bookingId));

      // Generate edit secret if needed
      const editSecret = await ensureBookingSecret(data.bookingId);

      // Get the booking to get lead ID
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, data.bookingId)).limit(1);

      console.log('✅ BOOKING UPDATED SUCCESSFULLY');
      console.log('========================================\n');

      return {
        success: true,
        data: {
          bookingId: data.bookingId,
          editSecret: editSecret,
          inquiryNumber: booking.leadId ? booking.leadId.substring(0, 8).toUpperCase() : 'INQ-UNKNOWN',
          estimatedTotal: estimatedTotal,
        },
      };
    }

    // Default time if not provided
    const eventTime = data.eventTime || '18:00:00';

    console.log('✨ CREATING NEW BOOKING');

    // First, create a lead with the customer's contact info
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [lead] = await db.insert(leads).values({
        id: randomUUID(),
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        eventDate: new Date(data.eventDate),
        eventTime: eventTime,
        guestCount: data.guestCount,
        source: "website",
        status: "new",
      })
      .returning();

    // Fetch all menu items from database to create booking_items
    const allMenuItems = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        categoryId: menuItems.categoryId,
        pricePerPerson: menuItems.pricePerPerson,
      })
      .from(menuItems)
      .where(eq(menuItems.isActive, true));

    // Create a map of menu items for quick lookup by ID
    const menuItemMap = new Map(allMenuItems.map(item => [item.id, item]));

    // Calculate estimated total using actual database menu items
    let estimatedTotal = 0;
    const itemsToCreate: Array<{
      itemType: "menu_item";
      itemId: string;
      quantity: number;
      unitPrice: string;
    }> = [];

    // Process each selected item from the frontend
    for (const itemId of data.selectedItems) {
      const dbItem = menuItemMap.get(itemId);
      const quantity = data.itemQuantities[itemId] || 1;

      if (dbItem) {
        const unitPrice = Number(dbItem.pricePerPerson);
        const itemTotal = unitPrice * quantity * data.guestCount;
        estimatedTotal += itemTotal;

        // Add to items to create
        itemsToCreate.push({
          itemType: "menu_item",
          itemId: dbItem.id,
          quantity,
          unitPrice: dbItem.pricePerPerson,
        });
      } else {
        console.warn(`Menu item with ID ${itemId} not found in database`);
      }
    }

    // Build address string
    const addressParts = [data.street, data.plz, data.location].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

    // Build clean notes - only special requests
    const notesParts = [
      data.specialRequests,
    ].filter(Boolean);

    // Build internal notes with event details
    const internalNotesParts = [
      `Business: ${data.business || 'N/A'}`,
      `Occasion: ${data.occasion || 'N/A'}`,
      `Address: ${fullAddress || 'N/A'}`,
    ].filter(Boolean);

    // Create a booking linked to the lead
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [booking] = await db.insert(bookings).values({
        id: randomUUID(),
        leadId: lead.id,
        eventDate: new Date(data.eventDate),
        eventTime: eventTime,
        guestCount: data.guestCount,
        allergyDetails: data.allergyDetails || [],
        specialRequests: notesParts.length > 0 ? notesParts.join('\n') : null,
        estimatedTotal: estimatedTotal.toString(),
        requiresDeposit: estimatedTotal > 1000,
        status: "pending",
        internalNotes: internalNotesParts.join('\n'),
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        isLocked: true, // Bookings are locked by default - admin must unlock to allow client edits
      })
      .returning();

    // Generate edit secret for the booking
    const editSecret = await ensureBookingSecret(booking.id);

    // Log edit link to console (for development/testing when emails are disabled)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";
    const bookingEditUrl = `${baseUrl}/booking/${booking.id}/edit/${editSecret}`;
    console.log('\n========================================');
    console.log('📧 BOOKING EDIT LINK (WIZARD)');
    console.log('========================================');
    console.log(`To: ${data.contactEmail}`);
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Customer: ${data.contactName}`);
    console.log(`Event Date: ${data.eventDate}`);
    console.log(`Guests: ${data.guestCount}`);
    console.log(`Total: CHF ${estimatedTotal.toFixed(2)}`);
    console.log(`Status: LOCKED (by default)`);
    console.log(`Edit Link: ${bookingEditUrl}`);
    console.log(`Note: Client cannot edit until admin unlocks the booking`);
    console.log('========================================\n');

    // Create booking items
    for (const item of itemsToCreate) {
      await db.insert(bookingItems).values({
        id: randomUUID(),
        bookingId: booking.id,
        itemType: "menu_item",
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: {
        leadId: lead.id,
        bookingId: booking.id,
        editSecret: editSecret,
        inquiryNumber: lead.id.substring(0, 8).toUpperCase(),
        estimatedTotal: estimatedTotal,
      },
    };
  } catch (error) {
    console.error("Error submitting wizard form:", error);
    return {
      success: false,
      error: "Failed to submit your request. Please try again.",
    };
  }
}
