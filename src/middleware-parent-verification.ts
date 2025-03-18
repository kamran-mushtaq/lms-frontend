// middleware-parent-verification.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware function adds:
// 1. Parent verification
// 2. Aptitude test verification for students

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get user data from cookies
  const userDataCookie = request.cookies.get("userData")?.value;

  // If no user data, redirect to login to refresh
  if (!userDataCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Parse user data
    const userData = JSON.parse(userDataCookie);

    // For student dashboard paths, check aptitude test status
    if (request.nextUrl.pathname.startsWith("/(dashboard)/student")) {
      // First check if class has been selected
      if (userData.type === "student" && !userData.classId) {
        return NextResponse.redirect(new URL("/select-class", request.url));
      }

      // Then check if student hasn't passed aptitude test
      if (
        userData.type === "student" &&
        (!userData.aptitudeTestStatus || !userData.aptitudeTestStatus.passed)
      ) {
        return NextResponse.redirect(new URL("/aptitude-test", request.url));
      }
    }

    // For parent dashboard paths, check parent verification
    if (request.nextUrl.pathname.startsWith("/(dashboard)/parent")) {
      // Check parent verification status
      const isVerified = userData.isVerified;

      // If parent is not verified, redirect to verification page
      if (!isVerified) {
        return NextResponse.redirect(new URL("/verify-otp", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If any error parsing or processing, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/(dashboard)/:path*"]
};
