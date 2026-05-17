import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const { username, password } = await req.json();

    console.log("LOGIN ATTEMPT:", username, password);

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ?",
      args: [username, password],
    });

    console.log("DB RESULT:", result.rows);

    if (result.rows.length > 0) {

      return NextResponse.json({
        success: true,
      });

    }

    return NextResponse.json({
      success: false,
    });

  } catch (error: any) {

    console.log("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      error: error.message,
    });

  }

}
