CREATE TABLE "feed_follows" (
	"id" uuid PRIMARY KEY,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"feed_id" uuid,
	CONSTRAINT "feed_follows_user_id_feed_id_unique" UNIQUE("user_id","feed_id")
);
--> statement-breakpoint
ALTER TABLE "feed_follows" ADD CONSTRAINT "feed_follows_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_follows" ADD CONSTRAINT "feed_follows_feed_id_feeds_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feeds"("id") ON DELETE CASCADE;