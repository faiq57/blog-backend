import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { comments } from './db/schema';
import { cors } from 'hono/cors';

export type Env = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/comments', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(comments).all()
  return c.json(result);
})

app.post('/comments', async (c) => {
  const body = await c.req.json()
  if (!Object.hasOwn(body, 'author')) {
    return c.text('Your comment needs an author')
  } else if (!Object.hasOwn(body, 'content')) {
    return c.text('You comment need stuff')
  }

  const author = body.author.toString()
  const content = body.content.toString()

  if (author.length == 0 || author.length > 256) {
    return c.text('You either need a name or your name is too long')
  } else if (content.length == 0 || content.length > 1024) {
    return c.text('You either need to comment anything or your comment is too long')
  }

  const db = drizzle(c.env.DB);
  const result = await db.insert(comments).values({author: author, content: content})

  return c.text('Your comment is successfully published')
})

export default app
