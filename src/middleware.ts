import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;

  const protectedPaths = ["/my-tickets", "/checkout", "/admin"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && request.nextUrl.pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my-tickets/:path*", "/checkout/:path*", "/admin/:path*"],
};