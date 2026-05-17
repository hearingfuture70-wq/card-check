import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ?",
      args: [username, password],
    });

    if (result.rows.length > 0) {
      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json({
      success: false,
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
