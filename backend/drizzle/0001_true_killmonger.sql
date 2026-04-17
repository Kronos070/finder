CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
