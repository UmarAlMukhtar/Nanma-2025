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
        mobileCountryCode: registration.mobileCountryCode,
        mobileNumber: registration.mobileNumber,
        whatsappCountryCode: registration.whatsappCountryCode,
        whatsappNumber: registration.whatsappNumber,
        residingEmirates: registration.residingEmirates,
        locationIfOther: registration.locationIfOther,
        placeOfResidenceInPuthiyakavu: registration.placeOfResidenceInPuthiyakavu,
        adultsCount: registration.adultsCount,
        childrenCount: registration.childrenCount,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt
      },
      message: 'Registration successful! Thank you for registering for NANMA Family Fest 2025.'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
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