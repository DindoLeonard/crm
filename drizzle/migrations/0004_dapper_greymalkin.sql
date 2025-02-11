ALTER TYPE "crm_roles_enum" ADD VALUE 'sales_rep';--> statement-breakpoint
ALTER TYPE "crm_roles_enum" ADD VALUE 'team_lead';--> statement-breakpoint
ALTER TYPE "crm_roles_enum" ADD VALUE 'sales_director';--> statement-breakpoint
ALTER TYPE "crm_roles_enum" ADD VALUE 'sales_operations_manager';--> statement-breakpoint
ALTER TYPE "crm_roles_enum" ADD VALUE 'ceo';--> statement-breakpoint
ALTER TYPE "lead_status_enum" ADD VALUE 'contacts';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "lead_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "remarks" text;