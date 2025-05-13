import { NextRequest, NextResponse } from 'next/server';
import { GuardianStudentResponse, Child, ChildrenListResponse } from '@/types/child';

export async function GET(
  request: NextRequest,
  { params }: { params: { guardianId: string } }
) {
  try {
    const guardianId = params.guardianId;
    console.log('API Route: Fetching data for guardian:', guardianId);

    // Call your actual API
    const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/guardian-student/guardian/${guardianId}`;
    console.log('API Route: Calling external API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('API Route: External API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Route: External API error:', errorText);
      throw new Error(`External API error: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    console.log('API Route: Raw response:', text);
    
    let data: GuardianStudentResponse;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error('API Route: JSON parse error:', jsonError);
      throw new Error('Invalid JSON response from external API');
    }

    console.log('API Route: Parsed data:', data);

    // Transform the API response to match our UI expectations
    const transformedChildren: Child[] = data.map((relation) => {
      const student = relation.studentId;
      
      // Generate some mock data since it's not in the API response
      const mockProgress = Math.floor(Math.random() * 40) + 60; // 60-100%
      const mockSubjects = Math.floor(Math.random() * 3) + 3; // 3-5 subjects
      const mockPending = Math.floor(Math.random() * 3); // 0-2 pending
      const mockStreak = Math.floor(Math.random() * 14) + 1; // 1-14 days
      
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        age: undefined, // Not available in the API
        grade: undefined, // Not available in the API
        profileImage: undefined,
        isActive: relation.isActive,
        enrolledSince: relation.createdAt,
        lastActivity: relation.updatedAt,
        overallProgress: mockProgress,
        recentActivity: {
          type: 'lecture_completed' as const,
          subject: 'Mathematics',
          item: 'Recent lesson completed',
          timestamp: relation.updatedAt
        },
        upcomingAssessment: Math.random() > 0.5 ? {
          title: 'Upcoming Test',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          subject: 'Science'
        } : undefined,
        quickStats: {
          subjectsEnrolled: mockSubjects,
          assessmentsPending: mockPending,
          studyStreakDays: mockStreak
        }
      };
    });

    const result: ChildrenListResponse = {
      children: transformedChildren,
      totalChildren: transformedChildren.length,
      metadata: {
        lastUpdated: new Date().toISOString()
      }
    };

    console.log('API Route: Returning result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route: Error occurred:', error);
    console.error('API Route: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch children data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
