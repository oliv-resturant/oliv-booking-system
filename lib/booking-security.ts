import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

/**
 * Generate a cryptographically secure 256-bit secret for booking edit access
 * Returns a 64-character hexadecimal string
 */
export function generateBookingSecret(): string {
  // Generate 32 random bytes (256 bits)
  const buffer = randomBytes(32);
  // Convert to hex string (64 characters)
  return buffer.toString('hex');
}

/**
 * Validate a booking secret against the database
 * Uses constant-time comparison to prevent timing attacks
 *
 * @param bookingId - The booking ID
 * @param secret - The secret to validate
 * @returns true if secret is valid, false otherwise
 */
export async function validateBookingSecret(
  bookingId: string,
  secret: string
): Promise<boolean> {
  try {
    const [booking] = await db
      .select({ editSecret: bookings.editSecret })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking || !booking.editSecret) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    // In Node.js, we use crypto.timingSafeEqual for buffers
    const secretBuffer = Buffer.from(secret, 'utf8');
    const storedBuffer = Buffer.from(booking.editSecret, 'utf8');

    // Ensure buffers are same length before comparison
    if (secretBuffer.length !== storedBuffer.length) {
      return false;
    }

    // Use timing-safe comparison
    const crypto = await import('crypto');
    try {
      return crypto.timingSafeEqual(secretBuffer, storedBuffer);
    } catch {
      // Fallback for Node versions that don't support timingSafeEqual with these buffer types
      return secret === booking.editSecret;
    }
  } catch (error) {
    console.error("Error validating booking secret:", error);
    return false;
  }
}

/**
 * Check if a booking is locked
 *
 * @param bookingId - The booking ID
 * @returns true if locked, false otherwise
 */
export async function isBookingLocked(bookingId: string): Promise<boolean> {
  try {
    const [booking] = await db
      .select({ isLocked: bookings.isLocked })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    return booking?.isLocked ?? false;
  } catch (error) {
    console.error("Error checking if booking is locked:", error);
    return true; // Fail secure - assume locked on error
  }
}

/**
 * Check if a client can edit a booking
 * Validates both the secret and the lock status
 *
 * @param bookingId - The booking ID
 * @param secret - The client's edit secret
 * @returns true if client can edit, false otherwise
 */
export async function canClientEditBooking(
  bookingId: string,
  secret: string
): Promise<boolean> {
  try {
    // First validate the secret
    const isValidSecret = await validateBookingSecret(bookingId, secret);
    if (!isValidSecret) {
      return false;
    }

    // Then check if booking is locked
    const locked = await isBookingLocked(bookingId);
    return !locked;
  } catch (error) {
    console.error("Error checking if client can edit booking:", error);
    return false;
  }
}

/**
 * Generate and store a secret for a booking
 * If a secret already exists, it will be overwritten
 *
 * @param bookingId - The booking ID
 * @returns The generated secret
 */
export async function ensureBookingSecret(bookingId: string): Promise<string> {
  try {
    // Check if secret already exists
    const [existing] = await db
      .select({ editSecret: bookings.editSecret })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existing?.editSecret) {
      return existing.editSecret;
    }

    // Generate new secret
    const secret = generateBookingSecret();

    // Store it in the database
    await db
      .update(bookings)
      .set({ editSecret: secret })
      .where(eq(bookings.id, bookingId));

    return secret;
  } catch (error) {
    console.error("Error ensuring booking secret:", error);
    throw new Error("Failed to generate booking secret");
  }
}

/**
 * Regenerate a booking's secret (invalidates old links)
 *
 * @param bookingId - The booking ID
 * @returns The new secret
 */
export async function regenerateBookingSecret(bookingId: string): Promise<string> {
  try {
    const secret = generateBookingSecret();

    await db
      .update(bookings)
      .set({ editSecret: secret })
      .where(eq(bookings.id, bookingId));

    return secret;
  } catch (error) {
    console.error("Error regenerating booking secret:", error);
    throw new Error("Failed to regenerate booking secret");
  }
}
