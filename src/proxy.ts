import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, parseAdminSession } from "@/lib/admin-auth";
import { applySupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/media" || pathname.startsWith("/media/")) {
    return NextResponse.next();
  }

  const adminMatch = pathname.match(/^\/(fr|en)\/admin(\/.*)?$/);
  if (adminMatch) {
    const locale = adminMatch[1] ?? "fr";
    const rest = adminMatch[2] ?? "";
    if (locale === "en") {
      const url = request.nextUrl.clone();
      url.pathname = `/fr/admin${rest}`;
      return applySupabaseSession(request, NextResponse.redirect(url));
    }

    const isLogin = rest === "/login" || rest.startsWith("/login/");
    const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";
    const signedIn = sessionToken.length > 0 && parseAdminSession(sessionToken);
    if (!isLogin && !signedIn) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      url.search = "";
      return applySupabaseSession(request, NextResponse.redirect(url));
    }

    if (isLogin && signedIn) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin`;
      url.search = "";
      return applySupabaseSession(request, NextResponse.redirect(url));
    }
  }

  const hasLocale =
    pathname === "/fr" ||
    pathname.startsWith("/fr/") ||
    pathname === "/en" ||
    pathname.startsWith("/en/");

  if (hasLocale) {
    return applySupabaseSession(request, continueWithPath(request));
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
  return applySupabaseSession(request, NextResponse.redirect(url, 308));
}

function continueWithPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cip-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
