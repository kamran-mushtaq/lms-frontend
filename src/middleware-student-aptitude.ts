// src/middleware-student-aptitude.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware checks if a student has passed the aptitude test before accessing the student dashboard
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication token and user data using cookies
  const token = request.cookies.get("token")?.value;
  const userJson = request.cookies.get("user")?.value;

  // If no token or no user data, redirect to login
  if (!token || !userJson) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Parse user info
    const user = JSON.parse(userJson);

    // Only apply this middleware to student routes
    if (user.type !== "student") {
      return NextResponse.next();
    }

    // Get aptitude test status
    const aptitudeTestStatus = user.aptitudeTestStatus || {
      attempted: false,
      passed: false
    };

    // If student hasn't passed aptitude test, redirect to aptitude test page
    if (!aptitudeTestStatus.passed) {
      // Only redirect if not already on the aptitude-test page
      if (!pathname.includes("/aptitude-test")) {
        return NextResponse.redirect(new URL("/aptitude-test", request.url));
      }
    }

    // Student has passed aptitude test, allow them to proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Student aptitude middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/student/:path*"]
};
