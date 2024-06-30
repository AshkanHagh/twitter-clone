ALTER TABLE "post_tags" DROP CONSTRAINT "post_tags_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "save_posts" DROP CONSTRAINT "save_posts_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "save_posts" DROP CONSTRAINT "save_posts_userId_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "save_posts" ADD CONSTRAINT "save_posts_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "save_posts" ADD CONSTRAINT "save_posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
