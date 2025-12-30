'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Eye, Target, Lightbulb } from 'lucide-react';

interface MarketAnalysis {
  analysisType: string;
  category?: string;
  region?: string;
  data: Record<string, any>;
  insights?: string;
  confidenceScore?: number;
}

interface ActiveUserInsights {
  totalActiveUsers: number;
  topEvents: Array<{ eventType: string; count: number }>;
  conversionRate: number;
  topCategories: Array<{ category: string; count: number }>;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  actions?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdvisorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketAnalyses, setMarketAnalyses] = useState<MarketAnalysis[]>([]);
  const [activeUserInsights, setActiveUserInsights] = useState<ActiveUserInsights | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  const fetchAdvisorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const [analysesRes, usersRes, recommendationsRes] = await Promise.all([
        const { getApiUrl } = await import('@/lib/api-utils');
        const apiUrl = getApiUrl();
        fetch(`${apiUrl}/advisor/market-analyses?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/advisor/active-users?days=7`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        // Generate recommendations for different types
        Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/advisor/recommendation`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'STRATEGIC' }),
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/advisor/recommendation`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'PRICING' }),
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/advisor/recommendation`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'MARKETING' }),
          }),
        ]),
      ]);

      if (!analysesRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch advisor data');
      }

      const analysesData = await analysesRes.json();
      const usersData = await usersRes.json();
      const recommendationsData = await Promise.all(
        recommendationsRes.map((res) => res.json())
      );

      setMarketAnalyses(analysesData.data || []);
      setActiveUserInsights(usersData.data || null);
      setRecommendations(recommendationsData.map((r) => r.data).filter(Boolean));
    } catch (err: any) {
      console.error('Error fetching advisor data:', err);
      setError(err.message || 'Failed to load advisor dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="جاري تحميل لوحة تحكم المستشار..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAdvisorData} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            لوحة تحكم المستشار 🐼
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            تحليلات السوق وسلوك المستخدمين والتوصيات الاستراتيجية
          </p>
        </div>
        <button
          onClick={fetchAdvisorData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          تحديث البيانات
        </button>
      </div>

      {/* Active Users Insights */}
      {activeUserInsights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المستخدمون النشطون</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUserInsights.totalActiveUsers}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">معدل التحويل</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(activeUserInsights.conversionRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأحداث</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUserInsights.topEvents.reduce((sum, e) => sum + e.count, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الفئات المفضلة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUserInsights.topCategories.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Events Chart */}
        {activeUserInsights && activeUserInsights.topEvents.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              أكثر الأحداث نشاطاً
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activeUserInsights.topEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="eventType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Categories Chart */}
        {activeUserInsights && activeUserInsights.topCategories.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              الفئات الأكثر مشاهدة
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activeUserInsights.topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {activeUserInsights.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Market Analyses */}
      {marketAnalyses.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              آخر تحليلات السوق
            </h3>
          </div>
          <div className="space-y-4">
            {marketAnalyses.map((analysis, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {analysis.analysisType} - {analysis.category || 'جميع الفئات'}
                  </span>
                  {analysis.confidenceScore && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      الثقة: {(analysis.confidenceScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                {analysis.insights && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {analysis.insights}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  المنتجات: {analysis.data.totalProducts || 0} | الطلبات: {analysis.data.totalOrders || 0} | الإعجابات: {analysis.data.totalLikes || 0}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              توصيات اليوم
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  rec.priority === 'HIGH'
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                    : rec.priority === 'MEDIUM'
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
                    : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'HIGH'
                        ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                        : rec.priority === 'MEDIUM'
                        ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                        : 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                {rec.actions && rec.actions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الإجراءات المقترحة:
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {rec.actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  الثقة: {(rec.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
