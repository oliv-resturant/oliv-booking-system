CREATE TABLE "booking_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"admin_user_id" text,
	"actor_type" text NOT NULL,
	"actor_label" text NOT NULL,
	"changes" jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "edit_secret" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "is_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "locked_by" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "booking_audit_log" ADD CONSTRAINT "booking_audit_log_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_audit_log" ADD CONSTRAINT "booking_audit_log_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_audit_log_booking_id_idx" ON "booking_audit_log" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_audit_log_created_at_idx" ON "booking_audit_log" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_locked_by_admin_user_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_edit_secret_idx" ON "bookings" USING btree ("edit_secret");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_edit_secret_unique" UNIQUE("edit_secret");