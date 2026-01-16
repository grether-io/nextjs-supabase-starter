import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // First update the session (handles Supabase auth)
  const response = await updateSession(request);

  // Then apply custom redirects and auth guards

  // Redirect /protected to /dashboard for backwards compatibility
  if (request.nextUrl.pathname === "/protected") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if route requires authentication
  const isAuthenticatedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/admin");

  // If authenticated route and no user session, redirect to login
  if (isAuthenticatedRoute) {
    // Check if user is authenticated by looking at the response
    // The updateSession function already handles auth checks
    const supabaseResponse = response as NextResponse;

    // If updateSession redirected to login, pass it through
    if (supabaseResponse.redirected || supabaseResponse.status === 307 || supabaseResponse.status === 308) {
      return supabaseResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
