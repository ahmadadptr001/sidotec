import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase.from("instansi").select();
    if (error) {
      console.error(error);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({ status: 200, data });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
