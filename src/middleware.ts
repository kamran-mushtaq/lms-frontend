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
      pathname.startsWith("/") && userType !== "admin";
    const isAccessingTeacherRoutes =
      pathname.startsWith("/teacher") && userType !== "teacher";
    const isAccessingParentRoutes =
      pathname.startsWith("/parent") && userType !== "parent";
    const isAccessingStudentRoutes =
      pathname.startsWith("/student") && userType !== "student";

    // Log values immediately before the main role/path check
    console.log(`[Middleware] PRE-CHECK: pathname='${pathname}', userType='${userType}'`);

    if (
      isAccessingAdminRoutes ||
      isAccessingTeacherRoutes ||
      isAccessingParentRoutes ||
      isAccessingStudentRoutes ||
      // Add check for student accessing generic dashboard
      (pathname === '/dashboard' && userType === 'student')
    ) {
      console.log(`[Middleware] Role/Path mismatch detected or student accessing /dashboard.`);
      // Default dashboard path based on user type
      let dashboardPath = `/${userType}/dashboard`;

      // If it's a student accessing /dashboard, first check if they passed all required tests
      if (pathname === '/dashboard' && userType === 'student') {
        console.log(`[Middleware] Student accessing /dashboard. Checking all required tests status...`);
        try {
          // --- Call the backend endpoint you created ---
          const checkUrl = new URL(`/api/enrollment/status/all-required-tests-passed/${userId}`, request.url);
          console.log(`[Middleware] Calling API: ${checkUrl.toString()}`);
          console.log(`[Middleware] Using Token: ${token ? 'Present - Length: ' + token.length : 'MISSING!'}`); // Check token presence and length
          
          const response = await fetch(checkUrl.toString(), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`[Middleware] API Response Status: ${response.status}`); // Log status code
          
          if (response.ok) {
            const responseData = await response.json(); // Get JSON data
            console.log(`[Middleware] API Response Data:`, responseData); // Log response data
            const { allTestsPassed } = responseData;
            console.log(`[Middleware] All required tests passed status for student ${userId}: ${allTestsPassed}`);
            if (!allTestsPassed) {
              // Redirect to aptitude test page if not all tests passed
              console.log(`[Middleware] Redirecting student ${userId} to /aptitude-test`);
              return NextResponse.redirect(new URL('/aptitude-test', request.url));
            }
            // If all tests passed, proceed to redirect to the standard student dashboard below
          } else {
            const errorBody = await response.text(); // Get error body as text
            console.error(`[Middleware] API check failed (${response.status}): ${errorBody}`); // Log error body
            // Handle API failure - redirecting to login as a fallback
            return NextResponse.redirect(new URL("/login?error=middleware_check_failed", request.url));
          }
        } catch (error) {
          console.error('[Middleware] Error checking all required tests status:', error);
          // Handle fetch error - redirecting to login as a fallback
          return NextResponse.redirect(new URL("/login?error=middleware_fetch_failed", request.url));
        }
      }
      // End of new check for student on /dashboard

      // Redirect user to their appropriate dashboard (e.g., /student/dashboard)
      console.log(`[Middleware] Redirecting user ${userId} to their dashboard: ${dashboardPath}`);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // APTITUDE TEST CHECK (for specific subject content paths - keep this logic)
    if (
      userType === "student" &&
      SUBJECT_CONTENT_PATHS.some(p => pathname.startsWith(p)) &&
      !APTITUDE_TEST_EXEMPT_PATHS.some(p => pathname.startsWith(p))
    ) {
      console.log(`[Middleware] Checking specific subject access for path: ${pathname}`);
      // Extract subject ID from path if present (e.g., /dashboard/subjects/123)
      let subjectId: string | null = null;
      
      for (const prefix of SUBJECT_CONTENT_PATHS) {
        if (pathname.startsWith(prefix)) {
          const match = pathname.match(new RegExp(`^${prefix}/([^/]+)`));
          console.log(`[Middleware] Path matches prefix ${prefix}. Regex match:`, match);
          if (match && match[1]) {
            subjectId = match[1];
            console.log(`[Middleware] Extracted subjectId: ${subjectId}`);
            break;
          }
        }
      }
      
      if (subjectId) {
        console.log(`[Middleware] Checking access for student ${userId} to subject ${subjectId}`);
        // Check if user has access to this subject
        try {
          const apiUrl = new URL(`/api/enrollment/access/${userId}/${subjectId}`, request.url);
          const response = await fetch(apiUrl.toString(), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`[Middleware] Subject access API response status: ${response.status}`);
          
          if (response.ok) {
            const { hasAccess } = await response.json();
            console.log(`[Middleware] Subject access result: ${hasAccess}`);
            
            if (!hasAccess) {
              console.log(`[Middleware] Student ${userId} lacks access to subject ${subjectId}. Redirecting...`);
              // If no access, redirect to the assessment pending page
              if (pathname.startsWith('/student')) {
                return NextResponse.redirect(new URL('/student/assessment/pending', request.url));
              } else {
                return NextResponse.redirect(new URL('/assessment/pending', request.url));
              }
            }
          } else {
             console.error(`[Middleware] Subject access API check failed (${response.status}): ${await response.text()}`);
             // Decide how to handle API failure - allowing access for now as per original logic
          }
        } catch (error) {
          console.error('[Middleware] Error checking subject access:', error);
          // In case of error checking access, continue rather than blocking
        }
      }
    }

    // Allow the request to proceed if none of the above conditions caused a redirect
    console.log(`[Middleware] Allowing request for path: ${pathname}`);
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