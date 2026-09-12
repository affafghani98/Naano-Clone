import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  const brandProtected =
    pathname.startsWith("/brand") || pathname.startsWith("/onboarding-brand");
  const creatorProtected =
    pathname.startsWith("/creator") || pathname === "/onboarding";

  if (brandProtected || creatorProtected) {
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/brand/:path*",
    "/onboarding-brand",
    "/creator/:path*",
    "/onboarding",
  ],
};
