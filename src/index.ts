import { Hono } from 'hono'

export type Env = {
  DB: D1Database;
}

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/comments', (c) => {
  return c.text("Hello again!")
})

export default app
