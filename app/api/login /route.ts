import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ?",
      args: [username, password],
    });

    if (result.rows.length > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }

  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
