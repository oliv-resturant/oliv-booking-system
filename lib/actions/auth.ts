'use server';

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hex } from "@better-auth/utils/hex";

/**
 * Better Auth compatible password hashing using scrypt
 * Format: {salt}:{hash} (both hex-encoded)
 */
async function hashPassword(password: string): Promise<string> {
  const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
  const key = await scryptAsync(
    password.normalize("NFKC"),
    salt,
    {
      N: 16384,
      p: 1,
      r: 16,
      dkLen: 64,
    }
  );
  return `${salt}:${hex.encode(key)}`;
}

/**
 * Verify password against Better Auth scrypt hash
 */
async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    const parts = hash.split(":");
    if (parts.length !== 2) {
      return false;
    }

    const salt = parts[0];
    const keyHash = parts[1];

    const key = await scryptAsync(
      password.normalize("NFKC"),
      salt,
      {
        N: 16384,
        p: 1,
        r: 16,
        dkLen: 64,
      }
    );

    const keyComputed = hex.encode(key);
    return keyHash === keyComputed;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  // Get current account with password (Better Auth stores credentials in the account table)
  const accounts = await db
    .select({ password: account.password })
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return { success: false, error: "No password found for this user" };
  }

  const userAccount = accounts[0];
  if (!userAccount.password) {
    return { success: false, error: "No password set for this user" };
  }

  // Verify current password using Better Auth's scrypt format
  const isValidPassword = await verifyPassword(userAccount.password, data.currentPassword);

  if (!isValidPassword) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Validate new password
  if (data.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long" };
  }

  // Hash new password using Better Auth's scrypt format
  const hashedPassword = await hashPassword(data.newPassword);

  // Update password in database (update the account table)
  try {
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.userId, userId));

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
