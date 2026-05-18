import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: "Username and password are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: false,
        error: "Invalid username or password",
      });
    }

    return NextResponse.json({
      success: true,
      user: data,
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}
