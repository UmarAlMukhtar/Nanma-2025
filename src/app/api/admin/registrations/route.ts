import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import { RegistrationModel } from '@/lib/models/Registration';
import { ApiResponse, Registration, AdminStats } from '@/lib/types';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Ensure all existing registrations have isCheckedIn field
    await RegistrationModel.updateMany(
      { isCheckedIn: { $exists: false } },
      { $set: { isCheckedIn: false } }
    );

    // Step 1: Ensure all registrations have the new fields with default values
    await RegistrationModel.updateMany(
      { checkedInAdults: { $exists: false } },
      { $set: { checkedInAdults: 0 } }
    );
    
    await RegistrationModel.updateMany(
      { checkedInChildren: { $exists: false } },
      { $set: { checkedInChildren: 0 } }
    );

    // Step 2: Fix existing checked-in registrations that have zero counts
    // These were likely checked in before we added the granular counting
    const migrationResult = await RegistrationModel.updateMany(
      { 
        isCheckedIn: true,
        checkedInAdults: 0,
        checkedInChildren: 0,
        $expr: { 
          $or: [
            { $gt: ['$adultsCount', 0] },
            { $gt: ['$childrenCount', 0] }
          ]
        }
      },
      [
        {
          $set: {
            checkedInAdults: '$adultsCount',
            checkedInChildren: '$childrenCount'
          }
        }
      ]
    );
    
    console.log('Migration result - Fixed checked-in registrations:', {
      matchedCount: migrationResult.matchedCount,
      modifiedCount: migrationResult.modifiedCount
    });
    
    // Force save all modified documents to ensure persistence
    if (migrationResult.modifiedCount > 0) {
      const modifiedRegistrations = await RegistrationModel.find({
        isCheckedIn: true,
        $or: [
          { checkedInAdults: { $gt: 0 } },
          { checkedInChildren: { $gt: 0 } }
        ]
      });
      
      for (const reg of modifiedRegistrations) {
        await reg.save();
      }
      
      console.log('Forced save completed for', modifiedRegistrations.length, 'registrations');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'stats') {
      // Calculate statistics
      const totalRegistrations = await RegistrationModel.countDocuments();
      const checkedInRegistrations = await RegistrationModel.countDocuments({ isCheckedIn: true });
      
      const aggregateResult = await RegistrationModel.aggregate([
        {
          $group: {
            _id: null,
            totalAdults: { $sum: '$adultsCount' },
            totalChildren: { $sum: '$childrenCount' }
          }
        }
      ]);

      // FIX: Only aggregate checked-in registrations for checked-in stats
      const checkedInAggregateResult = await RegistrationModel.aggregate([
        {
          $match: { isCheckedIn: true }
        },
        {
          $group: {
            _id: null,
            checkedInAdults: { $sum: '$checkedInAdults' },
            checkedInChildren: { $sum: '$checkedInChildren' }
          }
        }
      ]);

      // Debug: Let's see what's in the database
      const debugRegistrations = await RegistrationModel.find({ isCheckedIn: true }).lean();
      console.log('Debug - Checked in registrations:', debugRegistrations.map(r => ({
        name: r.name,
        isCheckedIn: r.isCheckedIn,
        adultsCount: r.adultsCount,
        childrenCount: r.childrenCount,
        checkedInAdults: r.checkedInAdults,
        checkedInChildren: r.checkedInChildren
      })));

      const stats = aggregateResult[0] || { totalAdults: 0, totalChildren: 0 };
      const checkedInStats = checkedInAggregateResult[0] || { checkedInAdults: 0, checkedInChildren: 0 };
      
      console.log('Stats calculation:', {
        totalStats: stats,
        checkedInStats: checkedInStats,
        checkedInRegistrations
      });
      
      const totalAttendees = stats.totalAdults + stats.totalChildren;
      const checkedInAttendees = checkedInStats.checkedInAdults + checkedInStats.checkedInChildren;

      const adminStats: AdminStats = {
        totalRegistrations,
        totalAdults: stats.totalAdults,
        totalChildren: stats.totalChildren,
        totalAttendees,
        checkedInRegistrations,
        checkedInAdults: checkedInStats.checkedInAdults,
        checkedInChildren: checkedInStats.checkedInChildren,
        checkedInAttendees
      };

      return NextResponse.json<ApiResponse<AdminStats>>({
        success: true,
        data: adminStats
      });
    }

    // Default: return all registrations
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { houseName: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
          { mobileCountryCode: { $regex: search, $options: 'i' } },
          { residingEmirates: { $regex: search, $options: 'i' } },
          { placeOfResidenceInPuthiyakavu: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get registrations with pagination and sorting
    const registrations = await RegistrationModel
      .find(searchQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await RegistrationModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    // Transform data for response
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

    return NextResponse.json<ApiResponse<{
      registrations: Registration[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
      };
    }>>({
      success: true,
      data: {
        registrations: transformedRegistrations,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Admin registrations error:', error);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch registrations. Please try again later.'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { id, isCheckedIn, checkedInAdults, checkedInChildren } = body;

    console.log('PATCH request received:', { id, isCheckedIn, checkedInAdults, checkedInChildren });

    if (!id || typeof isCheckedIn !== 'boolean') {
      console.log('Invalid request data:', { id, isCheckedIn, typeofIsCheckedIn: typeof isCheckedIn });
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required fields',
        message: 'Registration ID and check-in status are required.'
      }, { status: 400 });
    }

    // Prepare update object
    const updateData: { 
      isCheckedIn: boolean; 
      checkedInAdults?: number; 
      checkedInChildren?: number; 
    } = { isCheckedIn };
    
    // If checking in, include the checked-in counts
    if (isCheckedIn) {
      updateData.checkedInAdults = checkedInAdults || 0;
      updateData.checkedInChildren = checkedInChildren || 0;
    } else {
      // If checking out, reset the counts
      updateData.checkedInAdults = 0;
      updateData.checkedInChildren = 0;
    }

    console.log('Update data being sent to database:', updateData);

    // Update registration check-in status with explicit persistence
    const registration = await RegistrationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Ensure data is persisted - explicit save operation
    if (registration) {
      await registration.save();
      console.log('Registration saved successfully to database');
    }

    console.log('Updated registration result:', registration ? {
      id: registration._id,
      name: registration.name,
      isCheckedIn: registration.isCheckedIn,
      checkedInAdults: registration.checkedInAdults,
      checkedInChildren: registration.checkedInChildren,
      adultsCount: registration.adultsCount,
      childrenCount: registration.childrenCount
    } : 'not found');

    // Verify the data was actually saved by re-fetching
    const verifyRegistration = await RegistrationModel.findById(id).lean();
    const verifyData = verifyRegistration as {
      _id: unknown;
      name: string;
      isCheckedIn: boolean;
      checkedInAdults: number;
      checkedInChildren: number;
    } | null;
    console.log('Verification - Data in database after save:', {
      id: verifyData?._id?.toString(),
      name: verifyData?.name,
      isCheckedIn: verifyData?.isCheckedIn,
      checkedInAdults: verifyData?.checkedInAdults,
      checkedInChildren: verifyData?.checkedInChildren
    });

    if (!registration) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Registration not found',
        message: 'Registration with the specified ID was not found.'
      }, { status: 404 });
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
      message: `Registration ${isCheckedIn ? 'checked in' : 'checked out'} successfully.`
    });

  } catch (error) {
    console.error('Update check-in status error:', error);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update check-in status. Please try again later.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get ID from URL search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required field',
        message: 'Registration ID is required.'
      }, { status: 400 });
    }

    // Delete registration
    const registration = await RegistrationModel.findByIdAndDelete(id);

    if (!registration) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Registration not found',
        message: 'Registration with the specified ID was not found.'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: `Registration for ${registration.name} has been deleted successfully.`
    });

  } catch (error) {
    console.error('Delete registration error:', error);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete registration. Please try again later.'
    }, { status: 500 });
  }
}