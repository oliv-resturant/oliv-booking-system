CREATE TABLE "addon_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_de" text NOT NULL,
	"subtitle" text,
	"subtitle_de" text,
	"min_select" integer DEFAULT 0 NOT NULL,
	"max_select" integer DEFAULT 1 NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addon_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"addon_group_id" uuid,
	"name" text NOT NULL,
	"name_de" text NOT NULL,
	"description" text,
	"description_de" text,
	"price" numeric(10, 2) NOT NULL,
	"pricing_type" text DEFAULT 'per_person' NOT NULL,
	"dietary_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_addon_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"addon_group_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addon_items" ADD CONSTRAINT "addon_items_addon_group_id_addon_groups_id_fk" FOREIGN KEY ("addon_group_id") REFERENCES "public"."addon_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_addon_groups" ADD CONSTRAINT "category_addon_groups_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_addon_groups" ADD CONSTRAINT "category_addon_groups_addon_group_id_addon_groups_id_fk" FOREIGN KEY ("addon_group_id") REFERENCES "public"."addon_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addon_groups_sort_order_idx" ON "addon_groups" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "addon_items_addon_group_id_idx" ON "addon_items" USING btree ("addon_group_id");--> statement-breakpoint
CREATE INDEX "addon_items_sort_order_idx" ON "addon_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "category_addon_groups_category_id_idx" ON "category_addon_groups" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "category_addon_groups_addon_group_id_idx" ON "category_addon_groups" USING btree ("addon_group_id");