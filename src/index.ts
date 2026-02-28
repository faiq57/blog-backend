import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { comments } from './db/schema';

export type Env = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/comments', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(comments).all()
  return c.json(result);
})

export default app
