import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET USERS
export async function GET() {

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json({
    success: true,
    users: data,
  });
}

// CREATE USER
export async function POST(req: Request) {

  try {

    const body = await req.json();

    const { username, password, role } = body;

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password,
          role,
          credits: 0,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
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
