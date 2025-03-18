// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the paths that don't require authentication
const publicPaths = [
  "/login",
  "/signup",
  "/register",
  "/verify-otp",
  "/reset-password", // This will match /reset-password and anything that comes after it
  "/forgot-password",
  "/verify-email"
];

// Route patterns based on user types
const rolePatterns = {
  student: /^\/student/,
  parent: /^\/parent/,
  teacher: /^\/teacher/,
  admin: /^\/admin/
};

// Define protected paths that require aptitude test completion
const SUBJECT_CONTENT_PATHS = [
  '/dashboard/subjects',
  '/lectures',
  '/chapters',
  '/student/subjects',
  '/student/lectures',
  '/student/chapters'
];

// Paths that are exempt from the aptitude test check
const APTITUDE_TEST_EXEMPT_PATHS = [
  '/assessment',
  '/api',
  '/admin',
  '/parent',
  '/teacher'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication token from cookies only
  const token = request.cookies.get("token")?.value;
  const userJson = request.cookies.get("user")?.value;

  // If no token found, redirect to login
  if (!token || !userJson) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Check for cookie token
    let user;
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      throw new Error("Unable to parse user data");
    }

    const userType = user.type;
    const userId = user.id || user._id;

    // Check if user is trying to access a role-specific area they don't have access to
    const isAccessingAdminRoutes =
      pathname.startsWith("/admin") && userType !== "admin";
    const isAccessingTeacherRoutes =
      pathname.startsWith("/teacher") && userType !== "teacher";
    const isAccessingParentRoutes =
      pathname.startsWith("/parent") && userType !== "parent";
    const isAccessingStudentRoutes =
      pathname.startsWith("/student") && userType !== "student";

    if (
      isAccessingAdminRoutes ||
      isAccessingTeacherRoutes ||
      isAccessingParentRoutes ||
      isAccessingStudentRoutes
    ) {
      // Redirect to their appropriate dashboard
      let dashboardPath = `/${userType}/dashboard`;

      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // APTITUDE TEST CHECK
    // Only check for aptitude tests for students and only for specific paths
    if (
      userType === "student" && 
      SUBJECT_CONTENT_PATHS.some(p => pathname.startsWith(p)) &&
      !APTITUDE_TEST_EXEMPT_PATHS.some(p => pathname.startsWith(p))
    ) {
      // Extract subject ID from path if present (e.g., /dashboard/subjects/123)
      let subjectId: string | null = null;
      
      for (const prefix of SUBJECT_CONTENT_PATHS) {
        if (pathname.startsWith(prefix)) {
          const match = pathname.match(new RegExp(`^${prefix}/([^/]+)`));
          if (match && match[1]) {
            subjectId = match[1];
            break;
          }
        }
      }
      
      if (subjectId) {
        // Check if user has access to this subject
        try {
          const apiUrl = new URL(`/api/enrollment/access/${userId}/${subjectId}`, request.url);
          const response = await fetch(apiUrl.toString(), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const { hasAccess } = await response.json();
            
            if (!hasAccess) {
              // If no access, redirect to the assessment pending page
              if (pathname.startsWith('/student')) {
                return NextResponse.redirect(new URL('/student/assessment/pending', request.url));
              } else {
                return NextResponse.redirect(new URL('/assessment/pending', request.url));
              }
            }
          }
        } catch (error) {
          console.error('Error checking subject access:', error);
          // In case of error checking access, continue rather than blocking
        }
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // If there's an error parsing the user info, redirect to login
    console.error("Middleware error:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     * - _next (Next.js files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|images|_next).*)"
  ]
};