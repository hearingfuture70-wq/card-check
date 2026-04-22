
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  await db.execute({
    sql: "INSERT INTO users (username, password) VALUES (?, ?)",
    args: [username, password],
  });

  return Response.json({ success: true });
}
