import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const id = (await context.params).id;
  if (!id)
    return NextResponse.json({
      status: 401,
      reason: "ID harus disertakan",
    });

  try {
    const { data, error } = await supabase
      .from("disposisi")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({ status: 200, data });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
