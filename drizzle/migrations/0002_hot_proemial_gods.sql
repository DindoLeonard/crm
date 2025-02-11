ALTER TABLE "contacts" DROP CONSTRAINT "contacts_email_first_name_last_name_phone_book_title_unique";--> statement-breakpoint
ALTER TABLE "contacts_groups" DROP CONSTRAINT "contacts_groups_contact_id_contacts_id_fk";
--> statement-breakpoint
ALTER TABLE "contacts_groups" DROP CONSTRAINT "contacts_groups_group_id_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "user_credentials" DROP CONSTRAINT "user_credentials_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users_contacts" DROP CONSTRAINT "users_contacts_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users_contacts" DROP CONSTRAINT "users_contacts_contact_id_contacts_id_fk";
--> statement-breakpoint
ALTER TABLE "users_groups" DROP CONSTRAINT "users_groups_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users_groups" DROP CONSTRAINT "users_groups_group_id_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "first_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "last_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "email_note" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "phone_note" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_date_of_contact" timestamp (3);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts_groups" ADD CONSTRAINT "contacts_groups_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts_groups" ADD CONSTRAINT "contacts_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_contacts" ADD CONSTRAINT "users_contacts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_contacts" ADD CONSTRAINT "users_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_groups" ADD CONSTRAINT "users_groups_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_groups" ADD CONSTRAINT "users_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_book_title" ON "contacts" USING btree ("book_title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_name" ON "contacts" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lead_status" ON "contacts" USING btree ("lead_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_name_bookTitle_email" ON "contacts" USING btree ("name","book_title","email");--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_email_name_phone_book_title_unique" UNIQUE("email","name","phone","book_title");