import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!

export async function POST(req: Request) {

  const { username, password } = await req.json()

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db("cardcheck")

  const user = await db.collection("users").findOne({
    username,
    password
  })

  if (!user) {
    return Response.json({ success:false })
  }

  return Response.json({ success:true })
}
