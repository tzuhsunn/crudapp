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
