import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const result = await db.execute({
    sql: "SELECT * FROM users WHERE username = ? AND password = ?",
    args: [username, password],
  });

  if (result.rows.length > 0) {
    return Response.json({ success: true });
  } else {
    return Response.json({ success: false });
  }
}
