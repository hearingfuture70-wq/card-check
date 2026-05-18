import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ✅ GET ALL USERS
export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message });
  }

  return NextResponse.json({ success: true, users: data });
}

// ✅ CREATE USER
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password required" });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ username, password, role, credits: 0 }])
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" });
  }
}

// ✅ RECHARGE OR DEDUCT CREDITS
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, credits } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID required" });
    }

    // Get current credits
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ success: false, error: "User not found" });
    }

    // ✅ supports both + (recharge) and - (deduct), never goes below 0
    const newCredits = Math.max(0, (user.credits || 0) + credits);

    // ✅ Block if not enough credits for deduction
    if (credits < 0 && user.credits <= 0) {
      return NextResponse.json({
        success: false,
        error: "Insufficient credits",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" });
  }
}

// ✅ DELETE USER
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID required" });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
