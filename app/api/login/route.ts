import { connectDB } from "@/lib/mongodb"

export async function POST(req: Request) {

  const { username, password } = await req.json()

  const db = await connectDB()

  const user = await db.collection("users").findOne({
    username,
    password
  })

  if (!user) {
    return Response.json({ success:false })
  }

  return Response.json({ success:true })
}
