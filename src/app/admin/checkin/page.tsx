'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Users, Phone, MapPin, CheckCircle, X, Plus, Minus, ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import AdminLogin from '@/components/AdminLogin';
import { Loader2 } from 'lucide-react';
import { Registration } from '@/lib/types';

interface CheckInModalProps {
  registration: Registration;
  onClose: () => void;
  onConfirm: (adults: number, children: number) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ registration, onClose, onConfirm }) => {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const handleConfirm = () => {
    onConfirm(adults, children);
    onClose();
  };

  const incrementAdults = () => {
    setAdults(prev => Math.min(prev + 1, registration.adultsCount));
  };

  const decrementAdults = () => {
    setAdults(prev => Math.max(prev - 1, 0));
  };

  const incrementChildren = () => {
    setChildren(prev => Math.min(prev + 1, registration.childrenCount));
  };

  const decrementChildren = () => {
    setChildren(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Check In</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Checking in: <span className="font-medium">{registration.name}</span></p>
          <p className="text-xs text-gray-500">Registered: {registration.adultsCount} adults, {registration.childrenCount} children</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of Adults
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={decrementAdults}
                disabled={adults <= 0}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 w-16">{adults}</div>
                <div className="text-xs text-gray-500">of {registration.adultsCount}</div>
              </div>
              <button
                onClick={incrementAdults}
                disabled={adults >= registration.adultsCount}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of Children
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={decrementChildren}
                disabled={children <= 0}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 w-16">{children}</div>
                <div className="text-xs text-gray-500">of {registration.childrenCount}</div>
              </div>
              <button
                onClick={incrementChildren}
                disabled={children >= registration.childrenCount}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
};

function CheckInPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Registration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Debounced search
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/checkin?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  const handleCheckIn = async (adults: number, children: number) => {
    if (!selectedRegistration) return;

    try {
      const response = await fetch('/api/admin/checkin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRegistration._id,
          checkedInAdults: adults,
          checkedInChildren: children,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setSelectedRegistration(null);
        setSearchTerm('');
        setSearchResults([]);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage({ type: 'error', text: 'Failed to check in. Please try again.' });
    }
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.location.href = '/admin'}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Check In</h1>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm">{message.text}</span>
                <button onClick={clearMessage} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {loading && (
              <div className="mt-2 text-center">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((registration) => (
                  <button
                    key={registration._id}
                    onClick={() => setSelectedRegistration(registration)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{registration.name}</p>
                        <p className="text-sm text-gray-600">{registration.houseName}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Registration Details */}
          {selectedRegistration && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Registration:</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">{selectedRegistration.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {selectedRegistration.adultsCount} adults, {selectedRegistration.childrenCount} children
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {selectedRegistration.mobileCountryCode} {selectedRegistration.mobileNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {selectedRegistration.residingEmirates}
                      {selectedRegistration.locationIfOther && ` - ${selectedRegistration.locationIfOther}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Check In
                </button>
              </div>
            </div>
          )}

          {/* No results message */}
          {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No registrations found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different name</p>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {showModal && selectedRegistration && (
        <CheckInModal
          registration={selectedRegistration}
          onClose={() => setShowModal(false)}
          onConfirm={handleCheckIn}
        />
      )}
    </div>
  );
}

function CheckInPageContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <CheckInPage />;
}

export default function CheckInPageWithAuth() {
  return (
    <AuthProvider>
      <CheckInPageContent />
    </AuthProvider>
  );
}