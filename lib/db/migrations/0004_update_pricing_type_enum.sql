-- Add billed_by_consumption to pricing_type enum
ALTER TABLE "menu_items" DROP CONSTRAINT IF EXISTS "menu_items_pricing_type_check";
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_pricing_type_check" CHECK ("pricing_type" IN ('per_person', 'flat_fee', 'billed_by_consumption'));
