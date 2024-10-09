import {NextResponse} from "next/server";
import {auth} from "./auth";

export async function middleware(req) {
  const {pathname} = req.nextUrl;
  const session = await auth();

  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!session && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
