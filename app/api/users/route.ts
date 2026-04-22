import { db } from "@/lib/db";

// CREATE USER
export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return Response.json({ success: false, error: "Missing fields" });
    }

    await db.execute({
      sql: "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      args: [username, password, role || "user"],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: "Insert failed" });
  }
}

// GET USERS
export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM users");

    return Response.json({ success: true, users: result.rows });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false });
  }
}
