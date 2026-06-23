import { supabase } from "@/config/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  if (!id)
    return new Response(
      JSON.stringify({ status: 400, reason: "ID harus disertakan" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );

  try {
    const { data, error } = await supabase
      .from("disposisi")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ status: 401, reason: error.message }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return new Response(JSON.stringify({ status: 200, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 500, reason: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
