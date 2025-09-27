export interface Registration {
  _id?: string;
  name: string;
  ageGroup: string;
  fatherHusbandName: string;
  houseName: string;
  mobileCountryCode: string;
  mobileNumber: string;
  whatsappCountryCode?: string;
  whatsappNumber?: string;
  residingEmirates: string;
  locationIfOther?: string;
  placeOfResidenceInPuthiyakavu: string;
  adultsCount: number;
  childrenCount: number;
  isCheckedIn?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegistrationFormData {
  name: string;
  ageGroup: string;
  fatherHusbandName: string;
  houseName: string;
  mobileCountryCode: string;
  mobileNumber: string;
  whatsappCountryCode?: string;
  whatsappNumber?: string;
  residingEmirates: string;
  locationIfOther?: string;
  placeOfResidenceInPuthiyakavu: string;
  adultsCount: number;
  childrenCount: number;
}

export interface AdminStats {
  totalRegistrations: number;
  totalAdults: number;
  totalChildren: number;
  totalAttendees: number;
  checkedInRegistrations: number;
  checkedInAdults: number;
  checkedInChildren: number;
  checkedInAttendees: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const AGE_GROUPS = [
  '15-20 Years',
  '20-30 Years',
  '30-40 Years',
  '40-50 Years',
  'Above 50 Years'
] as const;

export type AgeGroup = typeof AGE_GROUPS[number];

export const COUNTRY_CODES = [
  // Middle East (most common for this event)
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  
  // Other Popular Countries
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+84', country: 'Vietnam', flag: '��' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+92', country: 'Pakistan', flag: '��🇰' },
  { code: '+98', country: 'Iran', flag: '�🇷' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+27', country: 'South Africa', flag: '�🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '�🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'Estonia', flag: '��' }
] as const;

export type CountryCode = typeof COUNTRY_CODES[number]['code'];