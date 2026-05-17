import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    console.log("BODY:", body);

    const { username, password } = body;

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ?",
      args: [username.trim(), password.trim()],
    });

    console.log("RESULT:", result.rows);

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
