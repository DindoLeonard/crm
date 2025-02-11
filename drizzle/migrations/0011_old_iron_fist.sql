CREATE TABLE IF NOT EXISTS "import_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"contacts_inserted_count" integer NOT NULL,
	"contacts_deduped_count" integer NOT NULL,
	"contacts_total_count" integer NOT NULL,
	"file_name" varchar(255),
	"file_url" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_history" ADD CONSTRAINT "import_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_file" ON "import_history" USING btree ("user_id","file_name");