ALTER TABLE "comments" ALTER COLUMN "authorId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "followers" ALTER COLUMN "followerId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "followers" ALTER COLUMN "followedId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "from" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "to" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_comments" ALTER COLUMN "commentId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_comments" ALTER COLUMN "postId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "postId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_tags" ALTER COLUMN "postId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "replies" ALTER COLUMN "commentId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "replies" ALTER COLUMN "authorId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "save_posts" ALTER COLUMN "postId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "save_posts" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "userId" SET NOT NULL;