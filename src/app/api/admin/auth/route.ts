import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required.'
      }, { status: 400 });
    }

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Configuration error',
        message: 'Admin credentials not configured.'
      }, { status: 500 });
    }

    // Verify credentials
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password.'
      }, { status: 401 });
    }

    // Create session token (simple JWT alternative)
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    // Set HTTP-only cookie
    const response = NextResponse.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token: sessionToken },
      message: 'Login successful.'
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Logout successful.'
    });

    // Clear the session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during logout.'
    }, { status: 500 });
  }
}