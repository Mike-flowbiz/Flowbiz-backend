'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { UserRole } from '../../../types';
import { useEffect, useState } from 'react';

type BusinessSettings = {
  id: string;
  companyName: string;
  companyEmail: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  vatNumber: string | null;
  vatRate: number;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  bankName: string | null;
  accountNumber: string | null;
  sortCode: string | null;
  createdAt: string;
  updatedAt: string;
};

type SettingsFormData = {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  vatNumber: string;
  vatRate: string;
  bankName: string;
  accountNumber: string;
  sortCode: string;
  primaryColor: string;
  secondaryColor: string;
};

const emptyFormData: SettingsFormData = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  vatNumber: '',
  vatRate: '20',
  bankName: '',
  accountNumber: '',
  sortCode: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SettingsFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/settings', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setFormData({
          companyName: data.settings.companyName || '',
          companyEmail: data.settings.companyEmail || '',
          companyPhone: data.settings.companyPhone || '',
          companyAddress: data.settings.companyAddress || '',
          vatNumber: data.settings.vatNumber || '',
          vatRate: data.settings.vatRate?.toString() || '20',
          bankName: data.settings.bankName || '',
          accountNumber: data.settings.accountNumber || '',
          sortCode: data.settings.sortCode || '',
          primaryColor: data.settings.primaryColor || '#3B82F6',
          secondaryColor: data.settings.secondaryColor || '#1E40AF',
        });
        if (data.settings.logo) {
          setLogoPreview(data.settings.logo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setLogoUploading(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo');

      setFormData((prev) => ({ ...prev, logo: data.url }));
      setLogoFile(null);
      return data.url;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to upload logo');
      return null;
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.companyName.trim()) {
      setFormError('Company name is required');
      return;
    }

    const vatRateNum = parseFloat(formData.vatRate);
    if (isNaN(vatRateNum) || vatRateNum < 0 || vatRateNum > 100) {
      setFormError('VAT rate must be between 0 and 100');
      return;
    }

    setFormLoading(true);

    try {
      // Upload logo first if a new one was selected
      let logoUrl = logoPreview;
      if (logoFile) {
        logoUrl = await handleLogoUpload();
        if (!logoUrl) {
          setFormLoading(false);
          return;
        }
      }

      const payload: any = {
        companyName: formData.companyName.trim(),
        companyEmail: formData.companyEmail.trim() || null,
        companyPhone: formData.companyPhone.trim() || null,
        companyAddress: formData.companyAddress.trim() || null,
        vatNumber: formData.vatNumber.trim() || null,
        vatRate: vatRateNum,
        bankName: formData.bankName.trim() || null,
        accountNumber: formData.accountNumber.trim() || null,
        sortCode: formData.sortCode.trim() || null,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        logo: logoUrl || settings?.logo || null,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      // Refresh settings
      await fetchSettings();
      alert('Settings saved successfully!');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
            <p className="mt-2 text-gray-600">Configure your business information and preferences</p>
          </div>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="mt-2 text-gray-600">Configure your business information and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button onClick={fetchSettings} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
                <input
                  type="tel"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                <textarea
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* VAT Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">VAT Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                <input
                  type="text"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="GB123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="vatRate"
                  value={formData.vatRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
                <input
                  type="text"
                  name="sortCode"
                  value={formData.sortCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12-34-56"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Logo</h2>
            <div className="space-y-4">
              {logoPreview && (
                <div className="flex items-center gap-4">
                  <img src={logoPreview} alt="Logo preview" className="h-20 w-auto object-contain border border-gray-200 rounded" />
                  <div>
                    <p className="text-sm text-gray-600">Current logo</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended: PNG or JPG, max 5MB</p>
              </div>
            </div>
          </div>

          {/* Branding Colors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formLoading || logoUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(formLoading || logoUploading) && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
