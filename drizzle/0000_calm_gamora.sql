CREATE TABLE "shopify_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"shop" text NOT NULL,
	"state" text NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"scope" text,
	"expires" timestamp,
	"access_token" text,
	"user_id" text,
	"first_name" text,
	"last_name" text,
	"email" text,
	"account_owner" boolean DEFAULT false NOT NULL,
	"locale" text,
	"collaborator" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"refresh_token" text,
	"refresh_token_expires" timestamp
);
