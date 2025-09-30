import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import { RegistrationModel } from '@/lib/models/Registration';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if email already exists
    const existingRegistration = await RegistrationModel.findOne({ 
      email: email.toLowerCase().trim() 
    });

    return NextResponse.json({
      isUnique: !existingRegistration,
      email: email
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check email availability',
        isUnique: null 
      },
      { status: 500 }
    );
  }
}