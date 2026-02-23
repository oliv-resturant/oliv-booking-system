import { db } from "@/lib/db";
import { bookingAuditLog, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Represents a single field change
 */
export interface FieldChange {
  field: string;
  from: any;
  to: any;
}

/**
 * Context for the actor making the change
 */
export interface AuditContext {
  actorType: 'admin' | 'client';
  adminUserId?: string; // Present for admin, undefined for client
  actorLabel: string;    // "Admin: John Doe" or "Client"
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Calculate the differences between two booking objects
 * Returns an array of field changes
 *
 * @param oldBooking - The original booking data
 * @param newBooking - The updated booking data
 * @returns Array of field changes
 */
export function calculateBookingChanges(
  oldBooking: Partial<Record<string, any>>,
  newBooking: Partial<Record<string, any>>
): FieldChange[] {
  const changes: FieldChange[] = [];

  // Fields to track
  const trackedFields = [
    'eventDate',
    'eventTime',
    'guestCount',
    'allergyDetails',
    'specialRequests',
    'estimatedTotal',
    'requiresDeposit',
    'status',
    'internalNotes',
    'isLocked',
  ];

  for (const field of trackedFields) {
    const oldValue = oldBooking[field];
    const newValue = newBooking[field];

    // Skip if values are the same
    if (oldValue === newValue) {
      continue;
    }

    // Skip if both are undefined
    if (oldValue === undefined && newValue === undefined) {
      continue;
    }

    // Handle date objects
    if (oldValue instanceof Date && newValue instanceof Date) {
      if (oldValue.getTime() === newValue.getTime()) {
        continue;
      }
    }

    // Handle arrays (like allergyDetails)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }
    }

    // Add the change
    changes.push({
      field,
      from: oldValue,
      to: newValue,
    });
  }

  return changes;
}

/**
 * Log a booking change to the audit trail
 *
 * @param params - Audit log parameters
 */
export async function logBookingChange(params: {
  bookingId: string;
  adminUserId?: string;
  actorType: 'admin' | 'client';
  actorLabel: string;
  changes: FieldChange[];
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    // Don't log if there are no changes
    if (params.changes.length === 0) {
      return;
    }

    await db.insert(bookingAuditLog).values({
      id: randomUUID(),
      bookingId: params.bookingId,
      adminUserId: params.adminUserId,
      actorType: params.actorType,
      actorLabel: params.actorLabel,
      changes: params.changes as any, // Store as JSONB
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error("Error logging booking change:", error);
    // Don't throw - logging failures shouldn't break the application
  }
}

/**
 * Get the audit history for a booking
 *
 * @param bookingId - The booking ID
 * @returns Array of audit log entries
 */
export async function getBookingAuditHistory(bookingId: string) {
  try {
    const logs = await db
      .select()
      .from(bookingAuditLog)
      .where(eq(bookingAuditLog.bookingId, bookingId))
      .orderBy(bookingAuditLog.createdAt);

    return { success: true, data: logs };
  } catch (error) {
    console.error("Error fetching booking audit history:", error);
    return { success: false, error: "Failed to fetch audit history", data: [] };
  }
}

/**
 * Get audit logs with admin user information
 * Joins with admin_user table to show who made changes
 *
 * @param bookingId - The booking ID
 * @returns Array of audit log entries with admin details
 */
export async function getBookingAuditHistoryWithAdmin(bookingId: string) {
  try {
    const { sql } = await import('drizzle-orm');

    const result = await db.execute(sql`
      SELECT
        bal.id,
        bal.booking_id,
        bal.admin_user_id,
        bal.actor_type,
        bal.actor_label,
        bal.changes,
        bal.ip_address,
        bal.user_agent,
        bal.created_at,
        au.name as admin_name,
        au.email as admin_email,
        au.role as admin_role
      FROM booking_audit_log bal
      LEFT JOIN admin_user au ON bal.admin_user_id = au.id
      WHERE bal.booking_id = ${bookingId}
      ORDER BY bal.created_at DESC
    `);

    const rows = 'rows' in result ? result.rows : result;

    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching booking audit history with admin:", error);
    return { success: false, error: "Failed to fetch audit history", data: [] };
  }
}

/**
 * Get a summary of changes for display
 * Formats the changes in a human-readable way
 *
 * @param changes - Array of field changes
 * @returns Formatted string
 */
export function formatChangesForDisplay(changes: FieldChange[]): string {
  return changes
    .map((change) => {
      const { field, from, to } = change;

      // Format field name
      const fieldName = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      // Format values
      const formatValue = (val: any): string => {
        if (val === null || val === undefined) return 'None';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (Array.isArray(val)) return val.join(', ');
        if (val instanceof Date) return val.toLocaleDateString();
        return String(val);
      };

      return `${fieldName}: ${formatValue(from)} → ${formatValue(to)}`;
    })
    .join('\n');
}

/**
 * Log a lock/unlock action
 *
 * @param params - Lock action parameters
 */
export async function logLockAction(params: {
  bookingId: string;
  adminUserId: string;
  adminUserName: string;
  action: 'lock' | 'unlock';
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logBookingChange({
    bookingId: params.bookingId,
    adminUserId: params.adminUserId,
    actorType: 'admin',
    actorLabel: `Admin: ${params.adminUserName}`,
    changes: [
      {
        field: 'isLocked',
        from: params.action === 'lock' ? false : true,
        to: params.action === 'lock' ? true : false,
      },
    ],
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}
