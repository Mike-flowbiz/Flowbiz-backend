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
  smtpHost: string | null;
  smtpPort: string | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
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
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
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
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SettingsFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'email' | 'branding'>('company');

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
          smtpHost: data.settings.smtpHost || '',
          smtpPort: data.settings.smtpPort || '587',
          smtpSecure: data.settings.smtpSecure || false,
          smtpUser: data.settings.smtpUser || '',
          smtpPass: data.settings.smtpPass || '',
          smtpFrom: data.settings.smtpFrom || '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

      setLogoPreview(data.url);
      setLogoFile(null);
      return data.url;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to upload logo');
      return null;
    } finally {
      setLogoUploading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          smtpHost: formData.smtpHost,
          smtpPort: formData.smtpPort,
          smtpSecure: formData.smtpSecure,
          smtpUser: formData.smtpUser,
          smtpPass: formData.smtpPass,
          smtpFrom: formData.smtpFrom,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test email');
      setTestEmailResult({ type: 'success', message: data.message });
    } catch (err) {
      setTestEmailResult({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send test email' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

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
        smtpHost: formData.smtpHost.trim() || null,
        smtpPort: formData.smtpPort.trim() || '587',
        smtpSecure: formData.smtpSecure,
        smtpUser: formData.smtpUser.trim() || null,
        smtpPass: formData.smtpPass.trim() || null,
        smtpFrom: formData.smtpFrom.trim() || null,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      await fetchSettings();
      setFormSuccess('Settings saved successfully!');
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setFormLoading(false);
    }
  };

  const isSmtpConfigured = !!(formData.smtpHost && formData.smtpUser && formData.smtpPass);

  const tabs = [
    { id: 'company' as const, label: 'Company & Billing', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'email' as const, label: 'Email Configuration', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'branding' as const, label: 'Branding & Logo', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  ];

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
          <p className="mt-2 text-gray-600">Configure your business information, email, and branding</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button onClick={fetchSettings} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                  </svg>
                  {tab.label}
                  {tab.id === 'email' && (
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isSmtpConfigured
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isSmtpConfigured ? 'Active' : 'Not Set'}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ─── Company & Billing Tab ─── */}
          {activeTab === 'company' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Company Information</h2>
                <p className="text-sm text-gray-500 mb-4">This information appears on your invoices and emails</p>
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

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">VAT Settings</h2>
                <p className="text-sm text-gray-500 mb-4">Configure VAT for automatic invoice calculations</p>
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

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Bank Details</h2>
                <p className="text-sm text-gray-500 mb-4">Displayed on invoices for client payments</p>
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
            </>
          )}

          {/* ─── Email Configuration Tab ─── */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">SMTP Email Configuration</h2>
                  <p className="text-sm text-gray-500">
                    Configure your email provider to send invoices and password reset emails.
                    Works with Gmail, Mailgun, SendGrid, Resend, AWS SES, or any SMTP provider.
                  </p>
                </div>
                {isSmtpConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Not Configured
                  </span>
                )}
              </div>

              {/* Quick setup guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Quick Setup Guide</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Gmail:</strong> Host: smtp.gmail.com, Port: 587, Use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">App Password</a> (not your regular password)</p>
                  <p><strong>Outlook:</strong> Host: smtp-mail.outlook.com, Port: 587</p>
                  <p><strong>SendGrid:</strong> Host: smtp.sendgrid.net, Port: 587, User: apikey</p>
                  <p><strong>Mailgun:</strong> Host: smtp.mailgun.org, Port: 587</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="smtpHost"
                    value={formData.smtpHost}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <select
                    name="smtpPort"
                    value={formData.smtpPort}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="587">587 (TLS - Recommended)</option>
                    <option value="465">465 (SSL)</option>
                    <option value="25">25 (Unencrypted)</option>
                    <option value="2525">2525 (Alternative)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="smtpUser"
                    value={formData.smtpUser}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="smtpPass"
                    value={formData.smtpPass}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="App password or API key"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
                  <input
                    type="text"
                    name="smtpFrom"
                    value={formData.smtpFrom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Company <noreply@yourdomain.com>"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use the SMTP username. Format: &quot;Display Name &lt;email@domain.com&gt;&quot;
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="smtpSecure"
                      checked={formData.smtpSecure}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Use SSL/TLS (enable for port 465)</span>
                  </label>
                </div>
              </div>

              {/* Test Email Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={!isSmtpConfigured || testEmailLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    {testEmailLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Test Email
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500">
                    Sends a test email to your SMTP username to verify the configuration works
                  </p>
                </div>
                {testEmailResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    testEmailResult.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {testEmailResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Branding Tab ─── */}
          {activeTab === 'branding' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Company Logo</h2>
                <p className="text-sm text-gray-500 mb-4">Your logo appears on invoices, PDFs, and email headers</p>
                <div className="space-y-4">
                  {logoPreview ? (
                    <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                        <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Current logo</p>
                        <p className="text-xs text-gray-500 mt-1">Used on invoices and emails</p>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove logo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">No logo uploaded yet</p>
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
                    <p className="mt-1 text-xs text-gray-500">Recommended: PNG or SVG with transparent background, max 5MB</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Brand Colors</h2>
                <p className="text-sm text-gray-500 mb-4">These colors are used in your invoice PDFs and emails sent to clients</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleInputChange}
                        className="h-12 w-16 border border-gray-300 rounded-lg cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Used for headers, buttons, and accents in emails/PDFs</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleInputChange}
                        className="h-12 w-16 border border-gray-300 rounded-lg cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="#1E40AF"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Used for secondary elements and gradients</p>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Email Header Preview</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200 max-w-md">
                    <div style={{ background: formData.primaryColor, padding: '20px 24px' }}>
                      <div className="flex items-center gap-3">
                        {logoPreview && (
                          <img src={logoPreview} alt="Logo" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
                        )}
                        <span className="text-white font-bold text-lg">
                          {formData.companyName || 'Your Company'}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mt-1">Invoice INV-0001</p>
                    </div>
                    <div className="bg-white p-4">
                      <p className="text-gray-600 text-sm">Hi Client Name,</p>
                      <p className="text-gray-500 text-xs mt-2">Please find your invoice attached...</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Success/Error Messages */}
          {formSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formLoading || logoUploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {(formLoading || logoUploading) && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              Save All Settings
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
