// middleware/aptitude-test-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';
import { getPendingAssessments } from '@/app/assessment/api/assessment-api';

// Paths that should be protected by this middleware
const PROTECTED_PATHS = [
  '/dashboard/subjects/',
  '/dashboard/courses/',
  '/lecture/',
  '/chapter/'
];

// Paths that should be exempt even if they match the patterns above
const EXEMPT_PATHS = [
  '/dashboard/subjects/manage',
  '/dashboard/courses/manage',
  '/api/'
];

// Session configuration
const sessionConfig = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'iron-session-lms',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function middleware(request: NextRequest) {
  // Get current path
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // Skip middleware for non-protected paths or exempt paths
  if (!PROTECTED_PATHS.some(p => path.startsWith(p)) || EXEMPT_PATHS.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }
  
  try {
    // Get user session
    const session = await getIronSession(request, NextResponse, sessionConfig);
    
    // If no user is logged in, redirect to login
    if (!session.user?.id) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Skip aptitude check for non-student users
    if (session.user?.type !== 'student') {
      return NextResponse.next();
    }
    
    // Get user ID from session
    const studentId = session.user.id;
    
    // Extract subject ID from path if present
    let subjectId = '';
    const subjectPathMatch = path.match(/\/dashboard\/subjects\/([^\/]+)/);
    if (subjectPathMatch && subjectPathMatch[1]) {
      subjectId = subjectPathMatch[1];
    }
    
    // Check for pending aptitude tests
    const pendingData = await getPendingAssessments(studentId);
    
    // If there are pending aptitude tests that match the requested subject, redirect
    if (pendingData.hasPendingTest) {
      const pendingAptitudeTests = pendingData.pendingTests.filter(
        (test: any) => test.type === 'aptitude'
      );
      
      // If there are pending aptitude tests for this subject, redirect
      if (
        pendingAptitudeTests.length > 0 && 
        (!subjectId || pendingAptitudeTests.some((test: any) => test.subjectId === subjectId))
      ) {
        url.pathname = '/assessment/pending';
        return NextResponse.redirect(url);
      }
    }
    
    // Everything is fine, proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Error in aptitude test middleware:', error);
    
    // Continue in case of error (to avoid locking users out)
    return NextResponse.next();
  }
}