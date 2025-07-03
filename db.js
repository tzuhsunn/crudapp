// db.js
import { MongoClient } from 'mongodb'

const uri = 'mongodb://mongo:27017'  // mongodb servive name in docker-compose.yml
const client = new MongoClient(uri)

let db

export async function initDB() {
  await client.connect()
  db = client.db('blogdb')
}

export function getPostsCollection() {
  return db.collection('posts')
}
