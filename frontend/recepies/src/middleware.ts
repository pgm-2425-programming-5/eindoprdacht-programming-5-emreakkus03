import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/posts/create",
];

function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some((route) => path.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  if (isProtectedRoute(currentPath)) {
    // JWT ophalen uit inkomende request cookies
    const jwt = request.cookies.get("jwt")?.value;

    // Als geen JWT aanwezig is, redirect naar login
    if (!jwt) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    // User check bij Strapi
    const user = await getUserMeLoader(jwt);

    // Als user niet geldig is, redirect naar login
    if (user.ok === false) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
