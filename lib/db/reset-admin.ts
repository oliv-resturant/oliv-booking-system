import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as argon2 from "@node-rs/argon2";

async function resetAdmin() {
  console.log("🔄 Resetting admin user...");

  try {
    // Delete existing admin account
    await db.delete(account).where(eq(account.accountId, "admin@oliv-restaurant.ch"));
    console.log("✅ Deleted existing account");

    // Delete existing admin user
    await db.delete(adminUser).where(eq(adminUser.email, "admin@oliv-restaurant.ch"));
    console.log("✅ Deleted existing admin user");

    // Hash the password using argon2 (same as Better Auth)
    const hashedPassword = await argon2.hash("admin123", {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Create admin user
    const adminId = randomUUID();
    await db.insert(adminUser).values({
      id: adminId,
      name: "Super Admin",
      email: "admin@oliv-restaurant.ch",
      emailVerified: true,
      role: "super_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create credential account with password
    await db.insert(account).values({
      id: randomUUID(),
      userId: adminId,
      accountId: "admin@oliv-restaurant.ch",
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Admin user recreated: admin@oliv-restaurant.ch / admin123");
    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@oliv-restaurant.ch");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

resetAdmin();
