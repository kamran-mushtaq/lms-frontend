import { NextRequest, NextResponse } from 'next/server';

// Simple test API endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'API route is working',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}
