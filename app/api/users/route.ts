import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // ✅ CREATE TABLE (runs once)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    )
  `);

  // ✅ INSERT USER
  await db.execute({
    sql: "INSERT INTO users (username, password) VALUES (?, ?)",
    args: [username, password],
  });

  return Response.json({ success: true });
}
