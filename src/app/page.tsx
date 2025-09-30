import React from 'react';
import Image from 'next/image';
import RegistrationForm from '@/components/RegistrationForm';
import { Calendar, MapPin, Users, Clock, Phone, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="NANMA Logo" width={120} height={120} className="h-30 w-auto flex-shrink-0" />
              <Image src="/nanma.png" alt="NANMA" width={120} height={120} className="h-30 w-auto flex-shrink-0 md:hidden" />
            </div>
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-2">
                NANMA Family Fest 2025
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-1">
                NANMA Puthiyakavu Mahallu Association, Dubai Committee
              </p>
              <p className="text-base text-gray-500">
                &apos;നന്മ&apos; പുതിയകാവ് മഹല്ല്  അസ്സോസിയേഷൻ, ദുബായ് കമ്മിറ്റി
              </p>
            </div>
            <Image src="/nanma.png" alt="NANMA" width={120} height={120} className="h-30 w-auto flex-shrink-0 hidden md:block" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Event Information */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Join Our Family Celebration!
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Come together with the NANMA community for an unforgettable day of family fun, 
                  cultural activities, delicious food, and memorable moments.
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Date & Time</h3>
                    <p className="text-gray-600">November 16th, 2025</p>
                    <p className="text-sm text-gray-500">Full day event</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Venue</h3>
                    <p className="text-gray-600">Woodlem Park School</p>
                    <p className="text-sm text-gray-500">Qusais, Dubai, UAE</p>
                    <a 
                      href="https://maps.google.com/maps?q=Woodlem+Park+School+Qusais+Dubai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                  <Clock className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Registration</h3>
                    <p className="text-gray-600">Open now!</p>
                    <p className="text-sm text-red-600 font-medium">Registration ends: November 14th, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What to Expect: </h3>
              <div className="space-y-4 mb-6">
                {[
                  { event: 'Badminton Competition', date: '01/11/2025' },
                  { event: 'Football Competition', date: '08/11/2025' },
                  { event: 'Volleyball Competition', date: '15/11/2025' },
                  { event: 'Cooking Competition', date: '15/11/2025' },
                  { event: 'Tug of War', date: '16/11/2025' },
                  { event: 'Great Family Fest Meet', date: '16/11/2025' }
                ].map((competition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-800 font-medium">{competition.event}</span>
                    </div>
                    <span className="text-green-600 font-semibold text-sm">{competition.date}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Activities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Cultural Performances',
                    'Traditional Food',
                    'Kids Activities',
                    'Prize Distribution',
                    'Photography Session',
                    'Family Entertainment'
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">For queries: +971 XX XXX XXXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700"><a href="mailto:nanmadubai2019@gmail.com">nanmadubai2019@gmail.com</a></span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Registration is mandatory for attendance. 
                  Only one registration is required for all family members.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:sticky lg:top-8">
            <RegistrationForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">NANMA Puthiyakavu Mahallu Association</h3>
            <p className="text-green-100 mb-2">Dubai Committee</p>
            <p className="text-green-200 text-sm mb-6">
              &apos;നന്മ&apos; പുതിയകാവ് മഹല്ല്  അസ്സോസിയേഷൻ, ദുബായ് കമ്മിറ്റി
            </p>
            
            <div className="border-t border-green-700 pt-6">
              <p className="text-green-200 text-sm">
                © 2025 NANMA Dubai Committee. All rights reserved.
              </p>
              <p className="text-green-300 text-xs mt-2">
                Building stronger communities, one family at a time.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
