import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Kamal proxy to verify the application is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'vintee',
      version: process.env.npm_package_version || '1.0.0'
    },
    { status: 200 }
  );
}
