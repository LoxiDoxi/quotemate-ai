console.log("MIDDLEWARE RUNNING");

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(
              name,
              value,
              options
            );
          });
        },
      },
    }
  );


  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();


  console.log(
    "MIDDLEWARE USER:",
    user?.email ?? "NO USER"
  );


  if (error) {
    console.log(
      "MIDDLEWARE AUTH ERROR:",
      error.message
    );
  }


  return response;
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};