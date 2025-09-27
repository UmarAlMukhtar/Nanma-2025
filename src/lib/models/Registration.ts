import mongoose, { Schema, Document } from 'mongoose';
import { Registration, AGE_GROUPS, COUNTRY_CODES } from '../types';

export interface IRegistration extends Registration, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  ageGroup: {
    type: String,
    required: [true, 'Age group is required'],
    enum: {
      values: AGE_GROUPS,
      message: 'Please select a valid age group'
    }
  },
  fatherHusbandName: {
    type: String,
    required: [true, "Father's/Husband's name is required"],
    trim: true,
    maxlength: [100, "Father's/Husband's name cannot exceed 100 characters"]
  },
  houseName: {
    type: String,
    required: [true, 'House name is required'],
    trim: true,
    maxlength: [100, 'House name cannot exceed 100 characters']
  },
  mobileCountryCode: {
    type: String,
    required: [true, 'Mobile country code is required'],
    validate: {
      validator: function(v: string) {
        const validCodes = ['+971', '+91', '+1', '+44', '+966', '+965', '+974', '+973', '+968'];
        return validCodes.includes(v);
      },
      message: 'Please select a valid country code'
    }
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v: string) {
        // Remove any non-digits and validate length based on country code
        const digits = v.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      },
      message: 'Mobile number must be between 7-15 digits'
    }
  },
  whatsappCountryCode: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        const validCodes = ['+971', '+91', '+1', '+44', '+966', '+965', '+974', '+973', '+968'];
        return validCodes.includes(v);
      },
      message: 'Please select a valid country code'
    }
  },
  whatsappNumber: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        const digits = v.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      },
      message: 'WhatsApp number must be between 7-15 digits'
    }
  },
  residingEmirates: {
    type: String,
    required: [true, 'Residing Emirates is required'],
    trim: true,
    maxlength: [50, 'Residing Emirates cannot exceed 50 characters']
  },
  locationIfOther: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  placeOfResidenceInPuthiyakavu: {
    type: String,
    required: [true, 'Place of residence in Puthiyakavu Mahallu limit is required'],
    trim: true,
    maxlength: [100, 'Place of residence cannot exceed 100 characters']
  },
  adultsCount: {
    type: Number,
    required: [true, 'Adults count is required'],
    min: [1, 'Adults count must be at least 1'],
    max: [50, 'Adults count cannot exceed 50']
  },
  childrenCount: {
    type: Number,
    default: 0,
    min: [0, 'Children count cannot be negative'],
    max: [50, 'Children count cannot exceed 50']
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ mobileCountryCode: 1, mobileNumber: 1 }, { unique: true });
RegistrationSchema.index({ name: 'text', houseName: 'text' });

// Virtual for total attendees per registration
RegistrationSchema.virtual('totalAttendees').get(function(this: IRegistration) {
  return this.adultsCount + this.childrenCount;
});

export const RegistrationModel = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);