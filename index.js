import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bodyParser from 'body-parser'
import { ObjectId } from 'mongodb'
import { initDB, getPostsCollection } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(join(__dirname, 'public')))
app.use(bodyParser.json())

await initDB()

// Routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'))
})

// Get all posts
app.get('/posts', async (req, res) => {
  const posts = await getPostsCollection().find().toArray()
  res.json(posts)
})

// Create a post
app.post('/posts', async (req, res) => {
  const { title, text } = req.body
  const result = await getPostsCollection().insertOne({ title, text })
  res.json({ _id: result.insertedId, title, text })
})

// Update a post
app.put('/posts/:id', async (req, res) => {
  const { id } = req.params
  const { title, text } = req.body
  console.log(`Updating post with ID: ${id}, Title: ${title}, Text: ${text}`)

  const result = await getPostsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { title, text } }
  )

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Post not found' })
  }

  res.json({ _id: id, title, text })
})

// Delete a post
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params

  const result = await getPostsCollection().deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Post not found' })
  }

  res.json({ message: 'Post deleted successfully' })
})

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
