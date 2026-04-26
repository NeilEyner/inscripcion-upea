import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_PREFIX = "pgposgrado_session_";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger rutas /programa/[sesionId]
  const match = pathname.match(/^\/programa\/([^/]+)/);
  if (!match) return NextResponse.next();

  const sesionId = match[1];
  const cookieName = `${SESSION_COOKIE_PREFIX}${sesionId}`;
  const isAuthenticated = request.cookies.has(cookieName);

  if (!isAuthenticated) {
    // Redirigir al inicio con parámetro para que el grid abra el modal correcto
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", sesionId);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/programa/:path*"],
};
