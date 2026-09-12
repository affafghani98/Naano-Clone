import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session-token";

const AUTH_PAGES = new Set(["/login", "/signup", "/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/brand") || pathname.startsWith("/onboarding-brand")) {
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    if (pathname.startsWith("/brand") && !session.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding-brand", request.url));
    }
    if (pathname.startsWith("/onboarding-brand") && session.onboardingComplete) {
      return NextResponse.redirect(new URL("/brand", request.url));
    }
    return NextResponse.next();
  }

  if (session && AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(
      new URL(session.onboardingComplete ? "/brand" : "/onboarding-brand", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/brand/:path*", "/onboarding-brand", "/login", "/signup", "/register"],
};
