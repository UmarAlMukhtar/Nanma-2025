'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Registration, AdminStats } from '@/lib/types';
import { generateCSVFilename } from '@/lib/validation';

import { 
  Users, 
  Download, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw,
  UserCheck,
  Baby,
  UsersIcon,
  UserX,
  Trash2,
  Filter
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalRegistrations: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalAttendees: 0,
    checkedInRegistrations: 0,
    checkedInAdults: 0,
    checkedInChildren: 0,
    checkedInAttendees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Registration;
    direction: 'asc' | 'desc';
  }>({ key: 'createdAt', direction: 'desc' });
  const [checkInFilter, setCheckInFilter] = useState<'all' | 'checked-in' | 'not-checked-in'>('all');
  const [checkInModal, setCheckInModal] = useState<{
    isOpen: boolean;
    registration: Registration | null;
    adultsCount: number;
    childrenCount: number;
  }>({ isOpen: false, registration: null, adultsCount: 0, childrenCount: 0 });


  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await fetch('/api/admin/registrations?action=stats');
      const statsResult = await statsResponse.json();

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Fetch registrations
      const registrationsResponse = await fetch('/api/admin/registrations');
      const registrationsResult = await registrationsResponse.json();

      if (registrationsResult.success) {
        setRegistrations(registrationsResult.data.registrations);
      } else {
        setError(registrationsResult.message || 'Failed to fetch registrations');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort registrations
  const filteredAndSortedRegistrations = useMemo(() => {
    let filtered = registrations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${reg.mobileCountryCode}${reg.mobileNumber}`.includes(searchTerm) ||
        reg.residingEmirates.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.placeOfResidenceInPuthiyakavu.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply check-in filter
    if (checkInFilter !== 'all') {
      filtered = filtered.filter(reg => {
        if (checkInFilter === 'checked-in') {
          return reg.isCheckedIn === true;
        } else if (checkInFilter === 'not-checked-in') {
          return reg.isCheckedIn !== true;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [registrations, searchTerm, sortConfig, checkInFilter]);

  // Handle sorting
  const handleSort = (key: keyof Registration) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open check-in modal
  const openCheckInModal = (registration: Registration) => {
    setCheckInModal({
      isOpen: true,
      registration,
      adultsCount: registration.isCheckedIn ? 0 : registration.adultsCount,
      childrenCount: registration.isCheckedIn ? 0 : registration.childrenCount
    });
  };

  // Close check-in modal
  const closeCheckInModal = () => {
    setCheckInModal({ isOpen: false, registration: null, adultsCount: 0, childrenCount: 0 });
  };

  // Handle check-in with people count
  const handleCheckIn = async () => {
    if (!checkInModal.registration) return;
    
    const { registration } = checkInModal;
    const totalSelected = checkInModal.adultsCount + checkInModal.childrenCount;
    
    if (totalSelected === 0 && !registration.isCheckedIn) {
      alert('Please select at least one person to check in.');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: registration._id, 
          isCheckedIn: !registration.isCheckedIn,
          checkedInAdults: registration.isCheckedIn ? 0 : checkInModal.adultsCount,
          checkedInChildren: registration.isCheckedIn ? 0 : checkInModal.childrenCount
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update registrations state immediately for better UX
        setRegistrations(prev =>
          prev.map(reg =>
            reg._id === registration._id ? { 
              ...reg, 
              isCheckedIn: !registration.isCheckedIn,
              checkedInAdults: registration.isCheckedIn ? 0 : checkInModal.adultsCount,
              checkedInChildren: registration.isCheckedIn ? 0 : checkInModal.childrenCount
            } : reg
          )
        );
        
        // Update stats separately to avoid full refresh
        const statsResponse = await fetch('/api/admin/registrations?action=stats');
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setStats(statsResult.data);
        }
        
        closeCheckInModal();
      } else {
        console.error('Check-in update failed:', result.message);
        alert(result.message || 'Failed to update check-in status');
      }
    } catch (error) {
      console.error('Error updating check-in status:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle check-in status (legacy function - kept for simple toggle)
  const toggleCheckIn = async (id: string, currentStatus: boolean) => {
    const registration = registrations.find(r => r._id === id);
    if (!registration) return;
    
    if (!currentStatus) {
      // If checking in, open modal for people selection
      openCheckInModal(registration);
      return;
    }
    
    // If checking out, do it directly
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          isCheckedIn: false,
          checkedInAdults: 0,
          checkedInChildren: 0
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update registrations state immediately for better UX
        setRegistrations(prev =>
          prev.map(reg =>
            reg._id === id ? { 
              ...reg, 
              isCheckedIn: false,
              checkedInAdults: 0,
              checkedInChildren: 0
            } : reg
          )
        );
        
        // Update stats separately to avoid full refresh
        const statsResponse = await fetch('/api/admin/registrations?action=stats');
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } else {
        console.error('Check-out update failed:', result.message);
        alert(result.message || 'Failed to update check-in status');
      }
    } catch (error) {
      console.error('Error updating check-in status:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete registration
  const deleteRegistration = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the registration for ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/registrations?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
        // Refresh stats
        fetchData();
        alert(result.message || 'Registration deleted successfully');
      } else {
        alert(result.message || 'Failed to delete registration');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Network error. Please try again.');
    }
  };



  // Prepare CSV data
  const csvData = useMemo(() => {
    return filteredAndSortedRegistrations.map((reg, index) => ({
      'S.No': index + 1,
      'Name': reg.name,
      'Age Group': reg.ageGroup,
      "Father's/Husband's Name": reg.fatherHusbandName,
      'House/Family Name': reg.houseName,
      'Email': reg.email,
      'Mobile Number': `${reg.mobileCountryCode}${reg.mobileNumber}`,
      'WhatsApp Number': reg.whatsappNumber ? `${reg.whatsappCountryCode}${reg.whatsappNumber}` : '',
      'Residing Emirates': reg.residingEmirates,
      'Location (if other)': reg.locationIfOther || '',
      'Place of Residence in Puthiyakavu': reg.placeOfResidenceInPuthiyakavu,
      'Adults Count': reg.adultsCount,
      'Children Count': reg.childrenCount,
      'Total Attendees': reg.adultsCount + reg.childrenCount,
      'Check-in Status': reg.isCheckedIn === true ? 'Checked In' : 'Not Checked In',
      'Checked In Adults': reg.checkedInAdults || 0,
      'Checked In Children': reg.checkedInChildren || 0,
      'Total Checked In': (reg.checkedInAdults || 0) + (reg.checkedInChildren || 0),
      'Registration Date': reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) : ''
    }));
  }, [filteredAndSortedRegistrations]);

  const csvHeaders = [
    { label: 'S.No', key: 'S.No' },
    { label: 'Name', key: 'Name' },
    { label: 'Age Group', key: 'Age Group' },
    { label: "Father's/Husband's Name", key: "Father's/Husband's Name" },
    { label: 'House/Family Name', key: 'House/Family Name' },
    { label: 'Email', key: 'Email' },
    { label: 'Mobile Number', key: 'Mobile Number' },
    { label: 'WhatsApp Number', key: 'WhatsApp Number' },
    { label: 'Residing Emirates', key: 'Residing Emirates' },
    { label: 'Location (if other)', key: 'Location (if other)' },
    { label: 'Place of Residence in Puthiyakavu', key: 'Place of Residence in Puthiyakavu' },
    { label: 'Adults Count', key: 'Adults Count' },
    { label: 'Children Count', key: 'Children Count' },
    { label: 'Total Attendees', key: 'Total Attendees' },
    { label: 'Check-in Status', key: 'Check-in Status' },
    { label: 'Checked In Adults', key: 'Checked In Adults' },
    { label: 'Checked In Children', key: 'Checked In Children' },
    { label: 'Total Checked In', key: 'Total Checked In' },
    { label: 'Registration Date', key: 'Registration Date' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-800">
                NANMA Family Fest 2025
              </h1>
              <p className="text-gray-600 text-sm">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
                <p className="text-xs text-gray-400">Checked in: {stats.checkedInRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Adults</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdults}</p>
                <p className="text-xs text-gray-400">Checked in: {stats.checkedInAdults}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Baby className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChildren}</p>
                <p className="text-xs text-gray-400">Checked in: {stats.checkedInChildren}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
                <p className="text-xs text-gray-400">Checked in: {stats.checkedInAttendees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
                  />
                </div>

                {/* Check-in Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={checkInFilter}
                    onChange={(e) => setCheckInFilter(e.target.value as 'all' | 'checked-in' | 'not-checked-in')}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="checked-in">Checked In</option>
                    <option value="not-checked-in">Not Checked In</option>
                  </select>
                </div>
              </div>

              {/* CSV Export */}
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={generateCSVFilename()}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV ({filteredAndSortedRegistrations.length})
              </CSVLink>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'ageGroup', label: 'Age Group' },
                    { key: 'houseName', label: 'House/Family Name' },
                    { key: 'mobileNumber', label: 'Mobile' },
                    { key: 'residingEmirates', label: 'Emirates' },
                    { key: 'adultsCount', label: 'Adults' },
                    { key: 'childrenCount', label: 'Children' },
                    { key: 'isCheckedIn', label: 'Status' },
                    { key: 'createdAt', label: 'Registered' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as keyof Registration)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || checkInFilter !== 'all' ? 'No registrations match your filters.' : 'No registrations found.'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedRegistrations.map((registration) => (
                    <tr key={registration._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                        <div className="text-sm text-gray-500">{registration.fatherHusbandName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.ageGroup}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.houseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{registration.mobileCountryCode}{registration.mobileNumber}</div>
                        {registration.whatsappNumber && (
                          <div className="text-sm text-gray-500">WA: {registration.whatsappCountryCode}{registration.whatsappNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.residingEmirates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {registration.adultsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {registration.childrenCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            registration.isCheckedIn === true
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {registration.isCheckedIn === true ? 'Checked In' : 'Not Checked In'}
                          </span>
                          {registration.isCheckedIn && (
                            <div className="text-xs text-gray-600 mt-1">
                              A: {registration.checkedInAdults || 0}/{registration.adultsCount} | 
                              C: {registration.checkedInChildren || 0}/{registration.childrenCount}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          {/* Check-in/Check-out Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleCheckIn(registration._id!, registration.isCheckedIn || false);
                            }}
                            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                              registration.isCheckedIn === true
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            }`}
                            title={registration.isCheckedIn === true ? 'Check Out' : 'Check In'}
                            disabled={loading}
                          >
                            {registration.isCheckedIn === true ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {registration.isCheckedIn === true ? 'Check Out' : 'Check In'}
                          </button>
                          
                          {/* Separator */}
                          <div className="w-px h-6 bg-gray-300"></div>
                          
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteRegistration(registration._id!, registration.name);
                            }}
                            className="p-2 rounded text-xs bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Check-in Modal */}
      {checkInModal.isOpen && checkInModal.registration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Check In - {checkInModal.registration.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {checkInModal.registration.houseName}
              </p>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Total registered: {checkInModal.registration.adultsCount + checkInModal.registration.childrenCount} people</p>
                  <p className="text-xs text-gray-500 mt-1">Select how many people are checking in:</p>
                </div>
                
                {/* Adults Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adults (12+ years) - Max: {checkInModal.registration.adultsCount}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckInModal(prev => ({
                        ...prev,
                        adultsCount: Math.max(0, prev.adultsCount - 1)
                      }))}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                      disabled={checkInModal.adultsCount <= 0}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{checkInModal.adultsCount}</span>
                    <button
                      type="button"
                      onClick={() => setCheckInModal(prev => ({
                        ...prev,
                        adultsCount: Math.min(prev.registration!.adultsCount, prev.adultsCount + 1)
                      }))}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                      disabled={checkInModal.adultsCount >= checkInModal.registration.adultsCount}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Children Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Children (below 12 years) - Max: {checkInModal.registration.childrenCount}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckInModal(prev => ({
                        ...prev,
                        childrenCount: Math.max(0, prev.childrenCount - 1)
                      }))}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                      disabled={checkInModal.childrenCount <= 0}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{checkInModal.childrenCount}</span>
                    <button
                      type="button"
                      onClick={() => setCheckInModal(prev => ({
                        ...prev,
                        childrenCount: Math.min(prev.registration!.childrenCount, prev.childrenCount + 1)
                      }))}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                      disabled={checkInModal.childrenCount >= checkInModal.registration.childrenCount}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Total checking in: {checkInModal.adultsCount + checkInModal.childrenCount} people
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCheckInModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={loading || (checkInModal.adultsCount + checkInModal.childrenCount === 0)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Check In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}