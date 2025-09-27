import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      JWT_SECRET: !!process.env.JWT_SECRET,
    };

    // Test database connection
    let dbStatus = 'disconnected';
    try {
      await connectToDatabase();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`;
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      envVars,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'unknown error',
    }, { status: 500 });
  }
}