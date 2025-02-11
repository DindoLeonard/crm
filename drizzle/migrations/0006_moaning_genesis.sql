ALTER TABLE "contacts" ALTER COLUMN "email" SET DATA TYPE varchar(320);--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "email" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "phone" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "phone" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "book_title" SET DEFAULT '';