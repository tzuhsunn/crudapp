// db.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// DB setup
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, { posts: [] })

// initialize the database
export async function initDB() {
  await db.read()
  db.data ||= { posts: [] }
  await db.write()
}

export { db }


import { MongoClient } from 'mongodb';

// --- MongoDB Configuration ---
// IMPORTANT: Replace with your actual MongoDB connection string.
// For local MongoDB: 'mongodb://localhost:27017'
// For MongoDB Atlas: Go to your cluster -> Connect -> Drivers -> Node.js -> Copy connection string
const mongoUri = 'mongodb://localhost:27017'; // CHANGE THIS!
const mongoDbName = 'crudAppDb'; // Name for your MongoDB database

let client;
let db;

export async function connectDB() {
    if (db) {
        return db; // Return existing connection if already connected
    }
    try {
        client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db(mongoDbName);
        console.log(`Connected to MongoDB database: ${mongoDbName}`);
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit if unable to connect to the database
    }
}

export async function closeDB() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

// Export a function to get a specific collection
export function getCollection(name) {
    if (!db) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return db.collection(name);
}
