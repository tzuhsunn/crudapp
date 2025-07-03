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



import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
// import { nanoid } from 'nanoid'; // MongoDB generates its own _id, nanoid might not be needed for primary IDs
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import MongoDB connection functions
import { connectDB, getCollection } from './db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'public')));
app.use(bodyParser.json());


// Initialize the database connection
// This should be done once when the server starts
let postsCollection; // Declare collection variable to use across routes
(async () => {
    try {
        const database = await connectDB();
        postsCollection = getCollection('posts'); // Get the 'posts' collection
        console.log('MongoDB collections ready.');

        // Start the server only after successful DB connection
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Visit http://localhost:${PORT} to view the app`);
        });
    } catch (error) {
        console.error('Failed to start server due to database connection error:', error);
        process.exit(1);
    }
})();


// Routes

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await postsCollection.find({}).toArray();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Create a post
app.post('/posts', async (req, res) => {
    const { title, text } = req.body;
    if (!title || !text) {
        return res.status(400).json({ message: 'Title and text are required' });
    }
    try {
        // MongoDB automatically adds an _id. You can still use nanoid for a custom 'id' field if needed,
        // but typically you'd rely on _id. I'll remove nanoid for simplicity here.
        const newPost = { title, text, createdAt: new Date() };
        const result = await postsCollection.insertOne(newPost);
        // MongoDB inserts an _id property into the newPost object after insertion
        res.status(201).json({ ...newPost, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// Edit a post
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params; // This 'id' now refers to MongoDB's _id (as a string)
    const { title, text } = req.body;

    // MongoDB's _id is an ObjectId, not just a string, so we need to convert it.
    // If your client-side is sending a string `id` that matches the `_id` string from MongoDB,
    // you need to convert it to an ObjectId for the query.
    // If you used `nanoid` for a custom `id` field, you would query by `{ id: id }` directly.
    let objectId;
    try {
        objectId = new MongoClient.ObjectId(id); // Import ObjectId from mongodb
    } catch (e) {
        return res.status(400).json({ message: 'Invalid Post ID format' });
    }

    try {
        const result = await postsCollection.findOneAndUpdate(
            { _id: objectId },
            { $set: { title, text, updatedAt: new Date() } },
            { returnDocument: 'after' } // Return the updated document
        );

        if (!result.value) { // In MongoDB driver v4+, findOneAndUpdate returns an object with a 'value' property
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(result.value);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post' });
    }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;

    let objectId;
    try {
        objectId = new MongoClient.ObjectId(id); // Import ObjectId from mongodb
    } catch (e) {
        return res.status(400).json({ message: 'Invalid Post ID format' });
    }

    try {
        const result = await postsCollection.deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Optional: Add a shutdown hook to close the DB connection gracefully
process.on('SIGINT', async () => {
    console.log('Server shutting down...');
    await closeDB();
    process.exit(0);
});
