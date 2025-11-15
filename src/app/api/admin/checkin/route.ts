import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import { RegistrationModel } from '@/lib/models/Registration';
import { ApiResponse, Registration } from '@/lib/types';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!search || search.length < 2) {
      return NextResponse.json<ApiResponse<Registration[]>>({
        success: true,
        data: []
      });
    }

    // Search by name with case-insensitive regex
    const registrations = await RegistrationModel
      .find({
        name: { $regex: search, $options: 'i' },
        isCheckedIn: false // Only show not checked-in registrations
      })
      .limit(limit)
      .sort({ name: 1 })
      .lean();

    const transformedRegistrations: Registration[] = registrations.map((reg) => ({
      _id: (reg._id as Types.ObjectId).toString(),
      name: reg.name,
      ageGroup: reg.ageGroup,
      fatherHusbandName: reg.fatherHusbandName,
      houseName: reg.houseName,
      email: reg.email,
      mobileCountryCode: reg.mobileCountryCode,
      mobileNumber: reg.mobileNumber,
      whatsappCountryCode: reg.whatsappCountryCode,
      whatsappNumber: reg.whatsappNumber,
      residingEmirates: reg.residingEmirates,
      locationIfOther: reg.locationIfOther,
      placeOfResidenceInPuthiyakavu: reg.placeOfResidenceInPuthiyakavu,
      adultsCount: reg.adultsCount,
      childrenCount: reg.childrenCount,
      isCheckedIn: Boolean(reg.isCheckedIn),
      checkedInAdults: reg.checkedInAdults || 0,
      checkedInChildren: reg.checkedInChildren || 0,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt
    }));

    return NextResponse.json<ApiResponse<Registration[]>>({
      success: true,
      data: transformedRegistrations
    });

  } catch (error) {
    console.error('Check-in search error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'Failed to search registrations'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { id, checkedInAdults, checkedInChildren } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing registration ID',
        message: 'Registration ID is required'
      }, { status: 400 });
    }

    if (typeof checkedInAdults !== 'number' || typeof checkedInChildren !== 'number') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid counts',
        message: 'Adult and children counts must be numbers'
      }, { status: 400 });
    }

    // Get the registration to validate counts
    const existingReg = await RegistrationModel.findById(id);
    if (!existingReg) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Registration not found',
        message: 'Registration not found'
      }, { status: 404 });
    }

    // Validate counts don't exceed registered amounts
    if (checkedInAdults > existingReg.adultsCount || checkedInChildren > existingReg.childrenCount) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid counts',
        message: `Cannot check in more than registered: ${existingReg.adultsCount} adults, ${existingReg.childrenCount} children`
      }, { status: 400 });
    }

    // Update check-in status
    const registration = await RegistrationModel.findByIdAndUpdate(
      id,
      {
        isCheckedIn: true,
        checkedInAdults,
        checkedInChildren
      },
      { new: true, runValidators: true }
    );

    if (!registration) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Update failed',
        message: 'Failed to update check-in status'
      }, { status: 500 });
    }

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
      message: `${registration.name} checked in successfully with ${checkedInAdults} adults and ${checkedInChildren} children`
    });

  } catch (error) {
    console.error('Check-in update error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update check-in status'
    }, { status: 500 });
  }
}