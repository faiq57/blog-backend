import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable('posts', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

    title: text('title').notNull(),

    author: text('author', { length: 256 }).default('Faiq Izhal').notNull(),

    content: text('content').notNull(),

    timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const comments = sqliteTable('comments', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

    postId: integer('post_id').notNull().references(() => posts.id, {onDelete: "cascade"}),

    author: text('author', { length: 256 }).notNull(),

    content: text('content').notNull(),

    timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
})