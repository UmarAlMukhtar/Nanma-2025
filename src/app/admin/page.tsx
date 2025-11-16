'use client';

import React from 'react';
import { useAuth } from '@/components/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';

function AdminPageContent() {
  const { logout } = useAuth();

  return <AdminDashboard onLogout={logout} />;
}

export default function AdminPage() {
  return <AdminPageContent />;
}