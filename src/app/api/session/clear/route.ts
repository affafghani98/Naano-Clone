import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-token";

export function GET(request: Request) {
  const login = new URL("/login", request.url);
  const response = NextResponse.redirect(login);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
