import { z } from 'zod';
import { AGE_GROUPS, COUNTRY_CODES, PLACE_OF_RESIDENCE_OPTIONS } from './types';

const validCountryCodes = COUNTRY_CODES.map(c => c.code);

// Helper function to extract only digits from phone number
const extractDigits = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Zod schema for form validation
export const registrationSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  
  ageGroup: z.enum(AGE_GROUPS, {
    errorMap: () => ({ message: 'Please select a valid age group' })
  }),
  
  fatherHusbandName: z.string()
    .min(1, "Father's/Husband's name is required")
    .max(100, "Father's/Husband's name cannot exceed 100 characters")
    .trim(),
  
  houseName: z.string()
    .min(1, 'House name is required')
    .max(100, 'House name cannot exceed 100 characters')
    .trim(),
  
  mobileCountryCode: z.string()
    .min(1, 'Country code is required')
    .refine((val) => validCountryCodes.includes(val as typeof validCountryCodes[number]), {
      message: 'Please select a valid country code'
    }),
  
  mobileNumber: z.string()
    .min(1, 'Mobile number is required')
    .transform(extractDigits) // Extract digits before validation
    .refine((val) => /^[0-9]+$/.test(val), {
      message: 'Mobile number must contain only digits'
    })
    .refine((val) => val.length >= 7, {
      message: 'Mobile number must be at least 7 digits'
    })
    .refine((val) => val.length <= 15, {
      message: 'Mobile number cannot exceed 15 digits'
    }),
  
  whatsappCountryCode: z.string()
    .optional()
    .refine((val) => !val || validCountryCodes.includes(val as typeof validCountryCodes[number]), {
      message: 'Please select a valid country code'
    }),
  
  whatsappNumber: z.string()
    .optional()
    .transform((val) => val ? extractDigits(val) : val) // Extract digits before validation
    .refine((val) => {
      if (!val || val === '') return true; // Allow empty for optional field
      return /^[0-9]+$/.test(val) && val.length >= 7 && val.length <= 15;
    }, {
      message: 'WhatsApp number must be 7-15 digits'
    }),
  
  residingEmirates: z.string()
    .min(1, 'Residing Emirates is required')
    .max(50, 'Residing Emirates cannot exceed 50 characters')
    .trim(),
  
  locationIfOther: z.string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  
  placeOfResidenceInPuthiyakavu: z.enum(PLACE_OF_RESIDENCE_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid place of residence' })
  }),
  
  adultsCount: z.number()
    .min(1, 'Adults count must be at least 1')
    .max(50, 'Adults count cannot exceed 50'),
  
  childrenCount: z.number()
    .min(0, 'Children count cannot be negative')
    .max(50, 'Children count cannot exceed 50')
});

export type RegistrationFormSchema = z.infer<typeof registrationSchema>;

// Utility functions
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits and format for display
  const digits = extractDigits(value);
  
  // Format based on length
  if (digits.length >= 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (digits.length >= 7) {
    return digits.replace(/(\d{3})(\d{4})/, '$1 $2');
  }
  
  return digits;
};

// Enhanced phone number validation with country-specific rules
export const validatePhoneNumber = (countryCode: string, phoneNumber: string): boolean => {
  const digits = extractDigits(phoneNumber);
  
  // Comprehensive validation rules for different country codes
  const validationRules: { [key: string]: RegExp } = {
    // Middle East & Gulf
    '+971': /^[0-9]{9}$/, // UAE: 9 digits
    '+966': /^[0-9]{9}$/, // Saudi Arabia: 9 digits
    '+965': /^[0-9]{8}$/, // Kuwait: 8 digits
    '+974': /^[0-9]{8}$/, // Qatar: 8 digits
    '+973': /^[0-9]{8}$/, // Bahrain: 8 digits
    '+968': /^[0-9]{8}$/, // Oman: 8 digits
    '+962': /^[0-9]{9}$/, // Jordan: 9 digits
    '+961': /^[0-9]{8}$/, // Lebanon: 8 digits
    '+964': /^[0-9]{10}$/, // Iraq: 10 digits
    '+972': /^[0-9]{9}$/, // Israel: 9 digits
    '+98': /^[0-9]{10}$/, // Iran: 10 digits
    '+90': /^[0-9]{10}$/, // Turkey: 10 digits
    
    // South Asia
    '+91': /^[0-9]{10}$/, // India: 10 digits
    '+92': /^[0-9]{10}$/, // Pakistan: 10 digits
    '+94': /^[0-9]{9}$/, // Sri Lanka: 9 digits
    '+880': /^[0-9]{10}$/, // Bangladesh: 10 digits
    
    // Southeast Asia
    '+65': /^[0-9]{8}$/, // Singapore: 8 digits
    '+60': /^[0-9]{9,10}$/, // Malaysia: 9-10 digits
    '+66': /^[0-9]{9}$/, // Thailand: 9 digits
    '+62': /^[0-9]{9,12}$/, // Indonesia: 9-12 digits
    '+63': /^[0-9]{10}$/, // Philippines: 10 digits
    '+84': /^[0-9]{9}$/, // Vietnam: 9 digits
    
    // East Asia
    '+86': /^[0-9]{11}$/, // China: 11 digits
    '+81': /^[0-9]{10,11}$/, // Japan: 10-11 digits
    '+82': /^[0-9]{10,11}$/, // South Korea: 10-11 digits
    
    // North America
    '+1': /^[0-9]{10}$/, // USA/Canada: 10 digits
    '+52': /^[0-9]{10}$/, // Mexico: 10 digits
    
    // Europe
    '+44': /^[0-9]{10,11}$/, // UK: 10-11 digits
    '+49': /^[0-9]{10,12}$/, // Germany: 10-12 digits
    '+33': /^[0-9]{9}$/, // France: 9 digits
    '+39': /^[0-9]{10}$/, // Italy: 10 digits
    '+34': /^[0-9]{9}$/, // Spain: 9 digits
    '+31': /^[0-9]{9}$/, // Netherlands: 9 digits
    '+32': /^[0-9]{9}$/, // Belgium: 9 digits
    '+41': /^[0-9]{9}$/, // Switzerland: 9 digits
    '+43': /^[0-9]{10,11}$/, // Austria: 10-11 digits
    '+46': /^[0-9]{9}$/, // Sweden: 9 digits
    '+47': /^[0-9]{8}$/, // Norway: 8 digits
    '+45': /^[0-9]{8}$/, // Denmark: 8 digits
    '+351': /^[0-9]{9}$/, // Portugal: 9 digits
    '+30': /^[0-9]{10}$/, // Greece: 10 digits
    '+48': /^[0-9]{9}$/, // Poland: 9 digits
    '+36': /^[0-9]{9}$/, // Hungary: 9 digits
    '+420': /^[0-9]{9}$/, // Czech Republic: 9 digits
    '+421': /^[0-9]{9}$/, // Slovakia: 9 digits
    '+385': /^[0-9]{8,9}$/, // Croatia: 8-9 digits
    '+386': /^[0-9]{8}$/, // Slovenia: 8 digits
    '+370': /^[0-9]{8}$/, // Lithuania: 8 digits
    '+371': /^[0-9]{8}$/, // Latvia: 8 digits
    '+372': /^[0-9]{7,8}$/, // Estonia: 7-8 digits
    
    // Oceania
    '+61': /^[0-9]{9}$/, // Australia: 9 digits
    
    // Africa
    '+27': /^[0-9]{9}$/, // South Africa: 9 digits
    '+20': /^[0-9]{10}$/, // Egypt: 10 digits
    '+234': /^[0-9]{10}$/, // Nigeria: 10 digits
    '+254': /^[0-9]{9}$/, // Kenya: 9 digits
    
    // South America
    '+55': /^[0-9]{10,11}$/, // Brazil: 10-11 digits
    '+54': /^[0-9]{10}$/, // Argentina: 10 digits
    
    // Other
    '+7': /^[0-9]{10}$/, // Russia: 10 digits
  };
  
  const rule = validationRules[countryCode];
  return rule ? rule.test(digits) : /^[0-9]{7,15}$/.test(digits);
};

// Alternative validation function using country-specific rules
export const validatePhoneNumberWithCountry = (countryCode: string, phoneNumber: string): { isValid: boolean; message?: string } => {
  const digits = extractDigits(phoneNumber);
  
  if (digits.length === 0) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  const validationRules: { [key: string]: { pattern: RegExp; expectedLength: string } } = {
    '+971': { pattern: /^[0-9]{9}$/, expectedLength: '9 digits' }, // UAE
    '+91': { pattern: /^[0-9]{10}$/, expectedLength: '10 digits' }, // India
    '+1': { pattern: /^[0-9]{10}$/, expectedLength: '10 digits' }, // USA/Canada
    '+44': { pattern: /^[0-9]{10,11}$/, expectedLength: '10-11 digits' }, // UK
    // Add more as needed
  };
  
  const rule = validationRules[countryCode];
  
  if (rule) {
    if (!rule.pattern.test(digits)) {
      return { 
        isValid: false, 
        message: `Invalid format for ${countryCode}. Expected ${rule.expectedLength}` 
      };
    }
  } else {
    // Generic validation for unknown country codes
    if (digits.length < 7 || digits.length > 15) {
      return { 
        isValid: false, 
        message: 'Phone number must be 7-15 digits' 
      };
    }
  }
  
  return { isValid: true };
};

// Parse phone number from pasted text to auto-fill country code
export const parsePhoneNumber = (input: string): { countryCode: string; phoneNumber: string } | null => {
  // Remove all non-digit and non-plus characters
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // Check if it starts with a plus sign
  if (!cleaned.startsWith('+')) {
    return null;
  }
  
  // Try to match known country codes (sort by length desc to match longer codes first)
  const sortedCodes = COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length);
  
  for (const { code } of sortedCodes) {
    if (cleaned.startsWith(code)) {
      const phoneNumber = cleaned.substring(code.length);
      if (phoneNumber.length >= 7) { // Minimum phone number length
        return { countryCode: code, phoneNumber };
      }
    }
  }
  
  return null;
};

export const generateCSVFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `nanma-family-fest-registrations-${year}-${month}-${day}.csv`;
};