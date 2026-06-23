import { supabase } from "@/config/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const id = (await context.params).id;

  if (!id)
    return NextResponse.json({ status: 401, reason: "Data tidak lengkap" });

  try {
    const { error } = await supabase.from("surat").delete().eq("id", id);
    if (error) {
      console.error(error);
      return NextResponse.json({ status: 401, reason: error.message });
    }

    return NextResponse.json({
      status: 200,
      message: "Berhasil menghapus surat dengan id #" + id,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 500, reason: err.message });
  }
}
