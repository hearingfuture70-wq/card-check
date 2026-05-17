import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username = body.username;
    const password = body.password;

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
