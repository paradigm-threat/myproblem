import { NextRequest, NextResponse } from "next/server";

const APEX = "myproblem.app";

/** Force apex HTTPS if a request still hits www (belt-and-suspenders to Vercel domain redirect). */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  if (host === `www.${APEX}`) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = APEX;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
