import { sql } from "drizzle-orm";
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
    type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const processingStatus = pgEnum("processing_status", [
    "pending",
    "extracting",
    "summarizing",
    "saving",
    "done",
    "failed",
]);

export const userRole = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    role: userRole("role").notNull().default("user"),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const folders = pgTable(
    "folders",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        parentId: uuid("parent_id").references(
            (): AnyPgColumn => folders.id,
            { onDelete: "cascade" },
        ),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        unique("folders_parent_name_unique").on(table.parentId, table.name),
        index("folders_parent_idx").on(table.parentId),
    ],
);

export const files = pgTable(
    "files",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        filename: text("filename").notNull(),
        s3Key: text("s3_key").notNull(),
        parentId: uuid("parent_id").references(() => folders.id, {
            onDelete: "cascade",
        }),

        summary: text("summary"),
        tags: text("tags")
            .array()
            .notNull()
            .default(sql`'{}'::text[]`),

        status: processingStatus("status").notNull().default("pending"),

        searchVector: text("search_vector").generatedAlwaysAs(
            sql`setweight(to_tsvector('russian', coalesce(filename,'')), 'A') || setweight(to_tsvector('russian', coalesce(summary,'')), 'B') || setweight(to_tsvector('russian', array_to_string(tags, ' ')), 'C')`,
        ),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        unique("files_parent_filename_unique").on(
            table.parentId,
            table.filename,
        ),
        index("files_search_idx").using("gin", table.searchVector),
        index("files_filename_trgm").using(
            "gin",
            sql`${table.filename} gin_trgm_ops`,
        ),
        index("files_tags_idx").using("gin", table.tags),
        index("files_parent_idx").on(table.parentId),
    ],
);
