'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { DollarSign, TrendingUp, Percent, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PricingRule {
  id: string;
  ruleName: string;
  ruleType: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  validFrom: Date | null;
  validUntil: Date | null;
}

interface RevenueOptimization {
  currentRevenue: number;
  potentialRevenue: number;
  optimizationSuggestions: Array<{
    type: string;
    description: string;
    potentialIncrease: number;
  }>;
}

export default function TreasurerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [revenueOptimization, setRevenueOptimization] = useState<RevenueOptimization | null>(null);

  useEffect(() => {
    fetchTreasurerData();
  }, []);

  const fetchTreasurerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const [rulesRes, optimizationRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/treasurer/pricing-rules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/treasurer/revenue-optimization?timeRange=30d`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!rulesRes.ok || !optimizationRes.ok) {
        throw new Error('Failed to fetch treasurer data');
      }

      const rulesData = await rulesRes.json();
      const optimizationData = await optimizationRes.json();

      setPricingRules(rulesData.data || []);
      setRevenueOptimization(optimizationData.data || null);
    } catch (err: any) {
      console.error('Error fetching treasurer data:', err);
      setError(err.message || 'Failed to load treasurer dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getRuleTypeColor = (ruleType: string) => {
    switch (ruleType) {
      case 'DISCOUNT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'SEASONAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DYNAMIC':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'SURGE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isRuleActive = (rule: PricingRule) => {
    const now = new Date();
    if (rule.validFrom && new Date(rule.validFrom) > now) return false;
    if (rule.validUntil && new Date(rule.validUntil) < now) return false;
    return true;
  };

  if (loading) {
    return <LoadingState message="جاري تحميل لوحة تحكم الخازن..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTreasurerData} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            لوحة تحكم الخازن 💰
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة التسعير الديناميكي وتحسين الإيرادات
          </p>
        </div>
        <button
          onClick={fetchTreasurerData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          تحديث البيانات
        </button>
      </div>

      {/* Revenue Optimization Stats */}
      {revenueOptimization && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الإيرادات الحالية</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueOptimization.currentRevenue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الإيرادات المحتملة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueOptimization.potentialRevenue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">نمو محتمل</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((revenueOptimization.potentialRevenue - revenueOptimization.currentRevenue) / revenueOptimization.currentRevenue * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Optimization Suggestions */}
      {revenueOptimization && revenueOptimization.optimizationSuggestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            اقتراحات تحسين الإيرادات
          </h3>
          <div className="space-y-3">
            {revenueOptimization.optimizationSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{suggestion.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      نوع: {suggestion.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      +{formatCurrency(suggestion.potentialIncrease)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pricing Rules */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            قواعد التسعير النشطة
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pricingRules.length} قاعدة
          </span>
        </div>
        <div className="space-y-4">
          {pricingRules.length > 0 ? (
            pricingRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-lg border-2 ${
                  isRuleActive(rule)
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{rule.ruleName}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getRuleTypeColor(rule.ruleType)}`}>
                        {rule.ruleType}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        أولوية: {rule.priority}
                      </span>
                      {isRuleActive(rule) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الشروط:</p>
                        <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                          {JSON.stringify(rule.conditions, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الإجراءات:</p>
                        <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                          {JSON.stringify(rule.actions, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {rule.validFrom && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>من: {new Date(rule.validFrom).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                  {rule.validUntil && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>إلى: {new Date(rule.validUntil).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                  {!rule.validUntil && (
                    <span className="text-green-600 dark:text-green-400">دائم</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              لا توجد قواعد تسعير نشطة
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
