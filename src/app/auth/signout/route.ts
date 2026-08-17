import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  // 303 See Other převede POST na GET. Výchozí 307 by metodu zachoval
  // a na /login by dorazil POST, což skončí chybou 405.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
