import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const username = body.username?.trim();
    const password = body.password?.trim();

    console.log("LOGIN:", username, password);

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ?",
      args: [username, password],
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

  } catch (error: any) {

    console.log("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      error: error.message,
    });

  }

}
