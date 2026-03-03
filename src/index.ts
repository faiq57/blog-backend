import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { comments, posts } from './db/schema';
import { cors } from 'hono/cors';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { desc, eq } from 'drizzle-orm';

export type Env = {
  DB: D1Database;
  B2_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  B2_ENDPOINT: string;
  B2_REGION: string;
  BUCKET_NAME: string;
}

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/posts', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(posts).orderBy(desc(posts.timestamp))
  return c.json(result);
})

app.get('/comments', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(comments).all()
  return c.json(result);
})

app.get('/comments/:postId', async (c) => {
  const postId = parseInt(c.req.param('postId'));
  const db = drizzle(c.env.DB)
  const result = await db.select().from(comments).where(eq(comments.postId, postId))
  return c.json(result);
})

app.post('/comments', async (c) => {
  const body = await c.req.json()
  if (!Object.hasOwn(body, 'author')) {
    return c.text('Your comment needs an author')
  } else if (!Object.hasOwn(body, 'content')) {
    return c.text('You comment need stuff')
  } else if (!Object.hasOwn(body, 'postId')) {
    return c.text('Um, you lack a post id somehow')
  }

  const author = body.author.toString()
  const content = body.content.toString()
  const postId = body.postId

  if (author.length == 0 || author.length > 256) {
    return c.text('You either need a name or your name is too long')
  } else if (content.length == 0) {
    return c.text('You either need to comment anything or your comment is too long')
  }

  const db = drizzle(c.env.DB);
  const result = await db.insert(comments).values({author: author, postId: postId, content: content})

  return c.text('Your comment is successfully published')
})

// DISCLAIMER: This whole function is something I copied from Google's "AI MODE" cause eh
app.get('/images/:key', async (c) => {
  const s3 = new S3Client({
    region: c.env.B2_REGION,
    endpoint: `https://${c.env.B2_ENDPOINT}`,
    credentials: {
      accessKeyId: c.env.B2_KEY_ID,
      secretAccessKey: c.env.B2_APPLICATION_KEY,
    },
  })

  try {
    const command = new GetObjectCommand({
      Bucket: c.env.BUCKET_NAME,
      Key: c.req.param('key'),
    })

    const { Body, ContentType } = await s3.send(command)
    
    // In Cloudflare Workers, S3 Body can be cast to a ReadableStream
    return new Response(Body as ReadableStream, {
      headers: { 
        'Content-Type': ContentType || 'image/jpeg', // Fallback if B2 doesn't return type
        'Cache-Control': 'public, max-age=31536000', // Optional: Tell browser to cache image
      }
    })
  } catch (err) {
    return c.text('Image not found', 404)
  }
})

export default app
