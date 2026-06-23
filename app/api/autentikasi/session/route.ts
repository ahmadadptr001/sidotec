import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth");

  return Response.json({
    isLogin: !!auth,
    user: auth?.value || null,
  });
}
