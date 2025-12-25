'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { UserRole } from '../../../types';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="mt-2 text-gray-600">Configure your business information and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Business settings will be implemented in Milestone 5</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

