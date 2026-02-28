import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const comments = sqliteTable('comments', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

    author: text('author', { length: 256 }).notNull(),

    content: text('content', { length: 1024 }).notNull(),

    timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
})