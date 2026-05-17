import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Workaround: We know this exact query works perfectly in your Admin panel!
    const result = await db.execute("SELECT * FROM users");

    // Find the matching user in JavaScript to bypass the Turso parameter bug
    // The .trim() ensures that accidental spaces in the database don't break the login
    const userFound = result.rows.find(
      (row) => 
        String(row.username).trim() === username && 
        String(row.password).trim() === password
    );

    if (userFound) {
      return NextResponse.json({ success: true });
    }

    // If no match is found, send success: false
    return NextResponse.json({ success: false });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
