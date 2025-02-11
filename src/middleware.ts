// import { handlers } from "@/auth"; // Referring to the auth.ts we just created
// console.log("handlers", handlers);
// export const { GET, POST } = handlers;
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  if (isMobile) {
    // Redirect to the "not-found" page
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/about")) {
    return NextResponse.rewrite(new URL("/about-2", request.url));
  }

  // if (request.nextUrl.pathname.startsWith("/dashboard")) {
  //   return NextResponse.rewrite(new URL("/dashboard/user", request.url));
  // }
}

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
