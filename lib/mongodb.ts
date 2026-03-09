import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!

let client = new MongoClient(uri)

export async function connectDB() {
  if (!client) {
    client = new MongoClient(uri)
  }

  await client.connect()
  return client.db("cardcheck")
}
