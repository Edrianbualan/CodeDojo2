import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase/server";
import { trainingReturn } from "../../../lib/auth/training-return";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token_hash");
  const type = params.get("type");
  const code = params.get("code");
  const client = await supabase();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const recovery =
    type === "recovery" || (!token && params.get("flow") === "recovery");
  if (client) {
    const result =
      token && (type === "email" || type === "signup" || type === "recovery")
        ? await client.auth.verifyOtp({ token_hash: token, type })
        : code
          ? await client.auth.exchangeCodeForSession(code)
          : null;
    if (result && !result.error) {
      const destination = trainingReturn(
        request.cookies.get("training-return")?.value,
      );
      const response = NextResponse.redirect(
        new URL(
          recovery ? "/reset-password" : (destination ?? "/dashboard"),
          origin,
        ),
      );
      response.cookies.set("training-return", "", {
        path: "/auth/confirm",
        maxAge: 0,
      });
      return response;
    }
  }
  return NextResponse.redirect(new URL("/login?link=expired", origin));
}
