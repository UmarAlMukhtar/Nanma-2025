'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationFormSchema, formatPhoneNumber, parsePhoneNumber, validatePhoneNumber } from '@/lib/validation';
import { AGE_GROUPS, COUNTRY_CODES, PLACE_OF_RESIDENCE_OPTIONS, UAE_EMIRATES } from '@/lib/types';
import { cn } from '@/utils/cn';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<RegistrationFormSchema>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      mobileCountryCode: '+971',
      whatsappCountryCode: '+971',
      adultsCount: 1,
      childrenCount: 0
    }
  });

  const watchedResidingEmirates = watch('residingEmirates');
  const shouldShowLocationField = watchedResidingEmirates?.toLowerCase().includes('other');

  const handlePhoneInput = (fieldName: 'mobileNumber' | 'whatsappNumber', countryCodeField: 'mobileCountryCode' | 'whatsappCountryCode') => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      
      // Try to parse if it looks like a full international number
      const parsed = parsePhoneNumber(input);
      if (parsed) {
        setValue(countryCodeField, parsed.countryCode);
        setValue(fieldName, parsed.phoneNumber);
        return;
      }
      
      // Otherwise, just format the number
      const formatted = formatPhoneNumber(input);
      setValue(fieldName, formatted);
    };
  };
  
  const handlePhoneBlur = (fieldName: 'mobileNumber' | 'whatsappNumber', countryCodeField: 'mobileCountryCode' | 'whatsappCountryCode') => {
    return () => {
      const countryCode = watch(countryCodeField);
      const phoneNumber = watch(fieldName);
      
      if (countryCode && phoneNumber) {
        const isValid = validatePhoneNumber(countryCode, phoneNumber);
        if (!isValid) {
          // You could set a custom error here if needed
          console.warn(`Invalid phone number format for ${countryCode}: ${phoneNumber}`);
        }
      }
    };
  };

  const onSubmit = async (data: RegistrationFormSchema) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage({
          type: 'success',
          message: result.message || 'Registration successful! Welcome to NANMA Family Fest 2025!'
        });
        reset();
        onSuccess?.();
      } else {
        // Enhanced error handling for specific error types
        let errorMessage = result.message || 'Registration failed. Please try again.';
        
        // Handle duplicate registration errors with specific guidance
        if (response.status === 409) {
          if (result.error === 'Mobile number already registered') {
            errorMessage = 'This mobile number is already registered. If this is your number, please contact support or use a different mobile number.';
          } else if (result.error === 'Email already registered') {
            errorMessage = 'This email address is already registered. If this is your email, please contact support or use a different email address.';
          }
        }
        
        setSubmitMessage({
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage({
        type: 'error',
        message: 'Network error. Please check your internet connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
          NANMA Family Fest 2025
        </h2>
        <p className="text-gray-600 mb-1">Registration Form</p>
        <div className="text-sm text-gray-500">
          <p>&apos;നന്മ&apos; പുതിയകാവ് മഹല്ല്  അസ്സോസിയേഷൻ, ദുബായ് കമ്മിറ്റി</p>
          <p className="mt-1">Date: November 16th, 2025 | Venue: Woodlem Park School, Qusais, Dubai</p>
        </div>
      </div>

      {submitMessage && (
        <div className={cn(
          "p-4 rounded-lg mb-6 flex items-center gap-3",
          submitMessage.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {submitMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p>{submitMessage.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.name ? "border-red-300" : "border-gray-300"
            )}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Age Group */}
        <div>
          <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
            Age Group *
          </label>
          <select
            id="ageGroup"
            {...register('ageGroup')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.ageGroup ? "border-red-300" : "border-gray-300"
            )}
          >
            <option value="">Select age group</option>
            {AGE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          {errors.ageGroup && (
            <p className="mt-1 text-sm text-red-600">{errors.ageGroup.message}</p>
          )}
        </div>

        {/* Father's / Husband's Name */}
        <div>
          <label htmlFor="fatherHusbandName" className="block text-sm font-medium text-gray-700 mb-2">
            Father&apos;s / Husband&apos;s Name *
          </label>
          <input
            type="text"
            id="fatherHusbandName"
            {...register('fatherHusbandName')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.fatherHusbandName ? "border-red-300" : "border-gray-300"
            )}
            placeholder="Enter father's or husband's name"
          />
          {errors.fatherHusbandName && (
            <p className="mt-1 text-sm text-red-600">{errors.fatherHusbandName.message}</p>
          )}
        </div>

        {/* House/Family Name */}
        <div>
          <label htmlFor="houseName" className="block text-sm font-medium text-gray-700 mb-2">
            House/Family Name *
          </label>
          <input
            type="text"
            id="houseName"
            {...register('houseName')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.houseName ? "border-red-300" : "border-gray-300"
            )}
            placeholder="Enter your house/family name"
          />
          {errors.houseName && (
            <p className="mt-1 text-sm text-red-600">{errors.houseName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.email ? "border-red-300" : "border-gray-300"
            )}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              {...register('mobileCountryCode')}
              className={cn(
                "w-full sm:w-auto min-w-0 sm:min-w-[120px] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                errors.mobileCountryCode ? "border-red-300" : "border-gray-300"
              )}
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              id="mobileNumber"
              {...register('mobileNumber')}
              onChange={handlePhoneInput('mobileNumber', 'mobileCountryCode')}
              onBlur={handlePhoneBlur('mobileNumber', 'mobileCountryCode')}
              className={cn(
                "flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                errors.mobileNumber ? "border-red-300" : "border-gray-300"
              )}
              placeholder="Enter mobile number"
            />
          </div>
          {(errors.mobileCountryCode || errors.mobileNumber) && (
            <p className="mt-1 text-sm text-red-600">
              {errors.mobileCountryCode?.message || errors.mobileNumber?.message}
            </p>
          )}
        </div>

        {/* WhatsApp Number */}
        <div>
          <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number (Optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              {...register('whatsappCountryCode')}
              className={cn(
                "w-full sm:w-auto min-w-0 sm:min-w-[120px] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                errors.whatsappCountryCode ? "border-red-300" : "border-gray-300"
              )}
            >
              <option value="">Select</option>
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              id="whatsappNumber"
              {...register('whatsappNumber')}
              onChange={handlePhoneInput('whatsappNumber', 'whatsappCountryCode')}
              onBlur={handlePhoneBlur('whatsappNumber', 'whatsappCountryCode')}
              className={cn(
                "flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                errors.whatsappNumber ? "border-red-300" : "border-gray-300"
              )}
              placeholder="Enter WhatsApp number"
            />
          </div>
          {(errors.whatsappCountryCode || errors.whatsappNumber) && (
            <p className="mt-1 text-sm text-red-600">
              {errors.whatsappCountryCode?.message || errors.whatsappNumber?.message}
            </p>
          )}
        </div>

        {/* Residing Emirates */}
        <div>
          <label htmlFor="residingEmirates" className="block text-sm font-medium text-gray-700 mb-2">
            Residing Emirates *
          </label>
          <select
            id="residingEmirates"
            {...register('residingEmirates')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.residingEmirates ? "border-red-300" : "border-gray-300"
            )}
          >
            <option value="">Select your emirate</option>
            {UAE_EMIRATES.map((emirate) => (
              <option key={emirate} value={emirate}>
                {emirate}
              </option>
            ))}
          </select>
          {errors.residingEmirates && (
            <p className="mt-1 text-sm text-red-600">{errors.residingEmirates.message}</p>
          )}
        </div>

        {/* Location if Other */}
        {shouldShowLocationField && (
          <div>
            <label htmlFor="locationIfOther" className="block text-sm font-medium text-gray-700 mb-2">
              Location (if above is &quot;other&quot;)
            </label>
            <input
              type="text"
              id="locationIfOther"
              {...register('locationIfOther')}
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                errors.locationIfOther ? "border-red-300" : "border-gray-300"
              )}
              placeholder="Please specify the location"
            />
            {errors.locationIfOther && (
              <p className="mt-1 text-sm text-red-600">{errors.locationIfOther.message}</p>
            )}
          </div>
        )}

        {/* Place of Residence in Puthiyakavu */}
        <div>
          <label htmlFor="placeOfResidenceInPuthiyakavu" className="block text-sm font-medium text-gray-700 mb-2">
            Place of Residence in Puthiyakavu Mahallu Limit *
          </label>
          <select
            id="placeOfResidenceInPuthiyakavu"
            {...register('placeOfResidenceInPuthiyakavu')}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.placeOfResidenceInPuthiyakavu ? "border-red-300" : "border-gray-300"
            )}
          >
            <option value="">Select your place of residence</option>
            {PLACE_OF_RESIDENCE_OPTIONS.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
          {errors.placeOfResidenceInPuthiyakavu && (
            <p className="mt-1 text-sm text-red-600">{errors.placeOfResidenceInPuthiyakavu.message}</p>
          )}
        </div>

        {/* Adults Count */}
        <div>
          <label htmlFor="adultsCount" className="block text-sm font-medium text-gray-700 mb-2">
            Adults Count * <span className="text-sm text-gray-500">(12 years and above)</span>
          </label>
          <input
            type="number"
            id="adultsCount"
            min="1"
            max="50"
            {...register('adultsCount', { valueAsNumber: true })}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.adultsCount ? "border-red-300" : "border-gray-300"
            )}
            placeholder="1"
          />
          {errors.adultsCount && (
            <p className="mt-1 text-sm text-red-600">{errors.adultsCount.message}</p>
          )}
        </div>

        {/* Children Count */}
        <div>
          <label htmlFor="childrenCount" className="block text-sm font-medium text-gray-700 mb-2">
            Children Count <span className="text-sm text-gray-500">(below 12 years)</span>
          </label>
          <input
            type="number"
            id="childrenCount"
            min="0"
            max="50"
            {...register('childrenCount', { valueAsNumber: true })}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              errors.childrenCount ? "border-red-300" : "border-gray-300"
            )}
            placeholder="0"
          />
          {errors.childrenCount && (
            <p className="mt-1 text-sm text-red-600">{errors.childrenCount.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Register for NANMA Family Fest 2025'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>For queries, please contact the organizing committee.</p>
        <p className="mt-1">All fields marked with * are required.</p>
      </div>
    </div>
  );
}