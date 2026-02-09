import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is an admin route
  if (pathname.startsWith("/admin")) {
    // Allow access to login page
    if (pathname === "/admin/login" || pathname === "/admin/sign-in") {
      return NextResponse.next();
    }

    // For protected admin routes, we'll let the page component handle auth checking
    // This allows for more granular control and better UX
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
