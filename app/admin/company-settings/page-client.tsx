'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, FileText, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CompanyProfile {
  companyName: string;
  tradeLicenseNumber: string | null;
  taxRegistrationNumber: string | null;
  licenseExpiryDate: string | null;
  licenseFileUrl: string | null;
  taxCertFileUrl: string | null;
}

export default function CompanySettingsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CompanyProfile>({
    companyName: 'Banda Chao FZ-LLC',
    tradeLicenseNumber: null,
    taxRegistrationNumber: null,
    licenseExpiryDate: null,
    licenseFileUrl: null,
    taxCertFileUrl: null,
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [taxCertFile, setTaxCertFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [taxCertPreview, setTaxCertPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Use centralized API URL utility
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/company/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company profile');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setFormData(result.data);
        if (result.data.licenseFileUrl) {
          setLicensePreview(result.data.licenseFileUrl);
        }
        if (result.data.taxCertFileUrl) {
          setTaxCertPreview(result.data.taxCertFileUrl);
        }
      }
    } catch (err: any) {
      console.error('Error fetching company profile:', err);
      setError(err.message || 'Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: 'license' | 'taxCert', file: File | null) => {
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      if (field === 'license') {
        setLicenseFile(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        setLicensePreview(url);
      } else {
        setTaxCertFile(file);
        const url = URL.createObjectURL(file);
        setTaxCertPreview(url);
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Use centralized API URL utility
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('companyName', formData.companyName);
      if (formData.tradeLicenseNumber) {
        formDataToSend.append('tradeLicenseNumber', formData.tradeLicenseNumber);
      }
      if (formData.taxRegistrationNumber) {
        formDataToSend.append('taxRegistrationNumber', formData.taxRegistrationNumber);
      }
      if (formData.licenseExpiryDate) {
        formDataToSend.append('licenseExpiryDate', formData.licenseExpiryDate);
      }
      if (licenseFile) {
        formDataToSend.append('licenseFile', licenseFile);
      }
      if (taxCertFile) {
        formDataToSend.append('taxCertFile', taxCertFile);
      }

      const response = await fetch(`${apiUrl}/api/v1/company/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save company profile');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Company profile saved successfully!');
        setLicenseFile(null);
        setTaxCertFile(null);
        // Reload profile to get updated file URLs
        await fetchCompanyProfile();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err: any) {
      console.error('Error saving company profile:', err);
      setError(err.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            إعدادات الشركة
          </h1>
          <p className="mt-2 text-gray-600">
            إدارة معلومات الشركة الرسمية ووثائق التحقق
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Company Verification Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              التحقق من الشركة
            </h2>
            <p className="text-sm text-gray-600">
              قم بإدخال المعلومات الرسمية للشركة وتحميل الوثائق المطلوبة
            </p>
          </div>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                اسم الشركة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Banda Chao FZ-LLC"
              />
            </div>

            {/* Trade License Number */}
            <div>
              <label htmlFor="tradeLicenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الرخصة التجارية
              </label>
              <input
                type="text"
                id="tradeLicenseNumber"
                value={formData.tradeLicenseNumber || ''}
                onChange={(e) => setFormData({ ...formData, tradeLicenseNumber: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="45033234"
              />
            </div>

            {/* Tax Registration Number */}
            <div>
              <label htmlFor="taxRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                رقم التسجيل الضريبي (TRN)
              </label>
              <input
                type="text"
                id="taxRegistrationNumber"
                value={formData.taxRegistrationNumber || ''}
                onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="TRN-XXXXX"
              />
            </div>

            {/* License Expiry Date */}
            <div>
              <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ انتهاء الرخصة
              </label>
              <input
                type="date"
                id="licenseExpiryDate"
                value={formData.licenseExpiryDate || ''}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Trade License File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رخصة تجارية (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center w-full">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="licenseFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 mx-auto"
                    >
                      <span>اختر ملف PDF</span>
                      <input
                        id="licenseFile"
                        name="licenseFile"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => handleFileChange('license', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF حتى 10 ميجابايت</p>
                  {licensePreview && (
                    <div className="mt-2">
                      <a
                        href={licensePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        {licenseFile ? licenseFile.name : 'عرض الملف المرفوع'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Certificate File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شهادة ضريبية (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center w-full">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="taxCertFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 mx-auto"
                    >
                      <span>اختر ملف PDF</span>
                      <input
                        id="taxCertFile"
                        name="taxCertFile"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => handleFileChange('taxCert', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF حتى 10 ميجابايت</p>
                  {taxCertPreview && (
                    <div className="mt-2">
                      <a
                        href={taxCertPreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        {taxCertFile ? taxCertFile.name : 'عرض الملف المرفوع'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
