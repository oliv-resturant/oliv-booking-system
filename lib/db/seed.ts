import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import {
  adminUser,
  menuCategories,
  menuItems,
  addons,
  leads,
  bookings,
  account,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Check if admin already exists
    const existingAdmin = await db.query.adminUser.findFirst({
      where: eq(adminUser.email, "admin@oliv-restaurant.ch"),
    });

    if (!existingAdmin) {
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

      console.log("✅ Admin user created: admin@oliv-restaurant.ch / admin123");
    } else {
      console.log("ℹ️ Admin user already exists");

      // Check if account exists
      const existingAccount = await db.query.account.findFirst({
        where: eq(account.userId, existingAdmin.id),
      });

      if (!existingAccount) {
        const hashedPassword = await argon2.hash("admin123", {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });
        await db.insert(account).values({
          id: randomUUID(),
          userId: existingAdmin.id,
          accountId: "admin@oliv-restaurant.ch",
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("✅ Credential account created for existing admin");
      }
    }

    // Check if menu categories exist
    const existingCategories = await db.query.menuCategories.findMany();
    if (existingCategories.length === 0) {
      // Create menu categories
      const [appetizers] = await db
        .insert(menuCategories)
        .values({
          id: randomUUID(),
          name: "Appetizers",
          nameDe: "Vorspeisen",
          description: "Start your meal with our delicious appetizers",
          descriptionDe:
            "Starten Sie Ihr Menü mit unseren köstlichen Vorspeisen",
          sortOrder: 1,
          isActive: true,
        })
        .returning();

      const [mains] = await db
        .insert(menuCategories)
        .values({
          id: randomUUID(),
          name: "Main Courses",
          nameDe: "Hauptgerichte",
          description: "Our signature main dishes",
          descriptionDe: "unsere Signature-Hauptgerichte",
          sortOrder: 2,
          isActive: true,
        })
        .returning();

      const [desserts] = await db
        .insert(menuCategories)
        .values({
          id: randomUUID(),
          name: "Desserts",
          nameDe: "Nachspeisen",
          description: "Sweet endings to your meal",
          descriptionDe: "Süße Enden für Ihr Mahl",
          sortOrder: 3,
          isActive: true,
        })
        .returning();

      console.log("✅ Menu categories created");

      // Create menu items
      await db.insert(menuItems).values([
        {
          id: randomUUID(),
          categoryId: appetizers.id,
          name: "Rösti",
          nameDe: "Rösti",
          description: "Traditional Swiss potato dish",
          descriptionDe: "Traditionelles Schweizer Kartoffelgericht",
          pricePerPerson: "12.00",
          sortOrder: 1,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: appetizers.id,
          name: "Cheese Fondue",
          nameDe: "Käsefondue",
          description: "Melted cheese with bread cubes",
          descriptionDe: "Geschmolzener Käse mit Brotwürfeln",
          pricePerPerson: "24.00",
          sortOrder: 2,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: mains.id,
          name: "Zurich Style Veal",
          nameDe: "Zürcher Geschnetzeltes",
          description: "Creamy veal strips with mushrooms",
          descriptionDe: "Cremige Kalbsstreifen mit Pilzen",
          pricePerPerson: "38.00",
          sortOrder: 1,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: mains.id,
          name: "Raclette",
          nameDe: "Raclette",
          description: "Melted cheese over potatoes and pickles",
          descriptionDe: "Geschmolzener Käse über Kartoffeln und Gewürzgurken",
          pricePerPerson: "32.00",
          sortOrder: 2,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: desserts.id,
          name: "Chocolate Fondue",
          nameDe: "Schokoladenfondue",
          description: "Warm melted chocolate with fruits",
          descriptionDe: "Warmer geschmolzener Schokolade mit Früchten",
          pricePerPerson: "16.00",
          sortOrder: 1,
          isActive: true,
        },
      ]);

      console.log("✅ Menu items created");

      // Create addons
      await db.insert(addons).values([
        {
          id: randomUUID(),
          name: "Welcome Drink",
          nameDe: "Begrüssungsgetränk",
          description: "Glass of prosecco or aperitif",
          descriptionDe: "Ein Glas Prosecco oder Aperitif",
          price: "8.00",
          pricingType: "per_person",
          isActive: true,
        },
        {
          id: randomUUID(),
          name: "Table Decoration",
          nameDe: "Tischdekoration",
          description: "Floral arrangement for your table",
          descriptionDe: "Blumenarrangement für Ihren Tisch",
          price: "50.00",
          pricingType: "flat_fee",
          isActive: true,
        },
      ]);

      console.log("✅ Addons created");
    } else {
      console.log("ℹ️ Menu data already exists");
    }

    console.log("🎉 Seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@oliv-restaurant.ch");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
