import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import { nanoid } from 'nanoid'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { db, initDB } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(join(__dirname, 'public')))
app.use(bodyParser.json())

// ininitialize the database
await initDB()

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Get all posts
app.get('/posts', async (req, res) => {
  await db.read()
  res.json(db.data.posts)
})
// Create a post
app.post('/posts', async (req, res) => {
  const { title, text } = req.body
  const newPost = { id: nanoid(), title, text }
  db.data.posts.push(newPost)
  await db.write()
  res.json(newPost)
})
// Edit a post
app.put('/posts/:id', async (req, res) => {
  const { id } = req.params
  const { title, text } = req.body
  await db.read()
  const post = db.data.posts.find(p => p.id === id)
  if (!post) return res.status(404).json({ message: 'Post not found' })
  post.title = title
  post.text = text
  await db.write()
  res.json(post)
})
// Delete a post
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params
  await db.read()
  db.data.posts = db.data.posts.filter(p => p.id !== id)
  await db.write()
  res.json({ message: 'Post deleted successfully' })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
console.log(`Visit http://localhost:${PORT} to view the app`);