ALTER TABLE "contacts" ADD COLUMN "user_assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "date_decided_for_recycle" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_assigned_to_user_id_fk" FOREIGN KEY ("user_assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
