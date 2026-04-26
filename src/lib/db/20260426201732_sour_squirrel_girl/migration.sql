CREATE TABLE "feeds" (
	"name" text,
	"url" text UNIQUE,
	"user_id" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;