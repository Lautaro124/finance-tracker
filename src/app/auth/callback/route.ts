import { createSSRClient } from "@/lib/supabase/server.lib";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSSRClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL para redireccionar al usuario después de la autenticación
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
