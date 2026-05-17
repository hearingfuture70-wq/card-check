import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// CREATE USER
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, password, role } = body;

    const { data, error } = await supabase
      .from("users")
      .insert([{ username, password, role }]);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}
