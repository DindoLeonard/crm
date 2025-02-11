DO $$ BEGIN
 CREATE TYPE "public"."crm_roles_enum" AS ENUM('admin', 'manager', 'sales_representative', 'marketing_specialist', 'support_agent', 'viewer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "crm_roles_enum" DEFAULT 'viewer';