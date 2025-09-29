import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import { RegistrationModel } from '@/lib/models/Registration';
import { registrationSchema } from '@/lib/validation';
import { ApiResponse, Registration } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation failed',
        message: validationResult.error.errors.map(err => err.message).join(', ')
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Check if mobile number already exists
    const existingRegistration = await RegistrationModel.findOne({
      mobileCountryCode: validatedData.mobileCountryCode,
      mobileNumber: validatedData.mobileNumber
    });

    if (existingRegistration) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Duplicate registration',
        message: 'A registration with this mobile number already exists.'
      }, { status: 409 });
    }

    // Create new registration
    const registration = new RegistrationModel(validatedData);

    await registration.save();

    // Return success response
    return NextResponse.json<ApiResponse<Registration>>({
      success: true,
      data: {
        _id: registration._id.toString(),
        name: registration.name,
        ageGroup: registration.ageGroup,
        fatherHusbandName: registration.fatherHusbandName,
        houseName: registration.houseName,
        email: registration.email,
        mobileCountryCode: registration.mobileCountryCode,
        mobileNumber: registration.mobileNumber,
        whatsappCountryCode: registration.whatsappCountryCode,
        whatsappNumber: registration.whatsappNumber,
        residingEmirates: registration.residingEmirates,
        locationIfOther: registration.locationIfOther,
        placeOfResidenceInPuthiyakavu: registration.placeOfResidenceInPuthiyakavu,
        adultsCount: registration.adultsCount,
        childrenCount: registration.childrenCount,
        isCheckedIn: registration.isCheckedIn,
        checkedInAdults: registration.checkedInAdults,
        checkedInChildren: registration.checkedInChildren,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt
      },
      message: 'Registration successful! Thank you for registering for NANMA Family Fest 2025.'
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors (mobile number or email already exists)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const mongoError = error as { keyPattern?: Record<string, number> };
      const duplicateField = mongoError.keyPattern;
      if (duplicateField?.email) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Email already registered',
          message: 'This email address is already registered. Please use a different email or contact support if this is your email.'
        }, { status: 409 });
      }
      if (duplicateField?.mobileNumber || duplicateField?.mobileCountryCode) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Mobile number already registered',
          message: 'This mobile number is already registered. Please use a different mobile number or contact support if this is your number.'
        }, { status: 409 });
      }
      // Generic duplicate error
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Duplicate registration',
        message: 'Some information provided is already registered. Please check your details and try again.'
      }, { status: 409 });
    }
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as { errors: Record<string, { message: string }> };
      const validationErrors = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation failed',
        message: `Please fix the following errors: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }
    
    // Handle timeout errors
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('ECONNRESET'))) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Database timeout',
        message: 'Database connection timed out. Please try again.'
      }, { status: 504 });
    }
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation failed',
        message: error.message
      }, { status: 400 });
    }

    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Duplicate registration',
        message: 'A registration with this mobile number already exists.'
      }, { status: 409 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
}