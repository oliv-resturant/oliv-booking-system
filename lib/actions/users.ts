'use server';

import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export interface CreateAdminUserInput {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator" | "read_only";
  password: string;
}

export async function createAdminUser(input: CreateAdminUserInput) {
  try {
    // Create user using Better Auth
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
    });

    // Update role
    await db
      .update(adminUser)
      .set({ role: input.role })
      .where(eq(adminUser.email, input.email));

    revalidatePath("/admin/user-management");

    return { success: true };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: "Failed to create admin user" };
  }
}

export async function updateAdminUser(id: string, updates: Partial<typeof adminUser.$inferInsert>) {
  try {
    const [user] = await db
      .update(adminUser)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminUser.id, id))
      .returning();

    revalidatePath("/admin/user-management");

    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating admin user:", error);
    return { success: false, error: "Failed to update admin user" };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    await db.delete(adminUser).where(eq(adminUser.id, id));

    revalidatePath("/admin/user-management");

    return { success: true };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return { success: false, error: "Failed to delete admin user" };
  }
}

export async function getAdminUsers() {
  try {
    const users = await db.select().from(adminUser);

    // Remove passwords from response
    const sanitizedUsers = users.map(({ password: _, ...user }) => user);

    return { success: true, data: sanitizedUsers };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { success: false, error: "Failed to fetch admin users", data: [] };
  }
}

export async function getAdminUserById(id: string) {
  try {
    const [user] = await db.select().from(adminUser).where(eq(adminUser.id, id)).limit(1);

    if (!user) {
      return { success: false, error: "Admin user not found", data: null };
    }

    // Remove password from response
    const { password: _, ...sanitizedUser } = user;

    return { success: true, data: sanitizedUser };
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return { success: false, error: "Failed to fetch admin user", data: null };
  }
}
