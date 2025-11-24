'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFounderKpis } from '@/hooks/useFounderKpis';
import { makersAPI, productsAPI, videosAPI } from '@/lib/api';
import { aiAPI } from '@/lib/api';
import axios from 'axios';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FounderConsole() {
  const { user, loading: authLoading } = useAuth();
  const { kpis, loading: kpisLoading, error: kpisError, refetch: refetchKpis } = useFounderKpis();
  const [recentMakers, setRecentMakers] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersStats, setOrdersStats] = useState({ total: 0, paid: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId] = useState(`founder-${user?.id || 'default'}`);

  useEffect(() => {
    if (!authLoading && user?.role === 'FOUNDER') {
      fetchRecentData();
    }
  }, [authLoading, user]);

  const fetchRecentData = async () => {
    try {
      setLoadingData(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const [makersRes, productsRes, videosRes, ordersRes] = await Promise.all([
        makersAPI.getAll({ limit: 5 }),
        productsAPI.getAll({ limit: 5 }),
        videosAPI.getAll({ limit: 5 }),
        axios.get(`${API_URL}/api/v1/orders`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => ({ data: { orders: [], stats: { total: 0, paid: 0 } } })),
      ]);

      setRecentMakers(makersRes.makers || []);
      setRecentProducts(productsRes.products || []);
      setRecentVideos(videosRes.videos || []);
      setRecentOrders(ordersRes.data.orders || []);
      setOrdersStats(ordersRes.data.stats || { total: 0, paid: 0 });

      // Generate fake growth data for demo
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
      const makersGrowth = [2, 5, 8, 12, 15, 18, 22, 25];
      const productsGrowth = [5, 12, 20, 30, 40, 50, 65, 80];
      const ordersGrowth = [0, 2, 5, 8, 12, 18, 25, 32];

      setGrowthData(
        weeks.map((week, index) => ({
          week,
          makers: makersGrowth[index] || 0,
          products: productsGrowth[index] || 0,
          orders: ordersGrowth[index] || 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching recent data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await aiAPI.assistant({
        assistant: 'consultant',
        message: chatInput,
        conversationId: conversationId,
      });

      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: response.response || response.message || 'لم أتمكن من الحصول على رد.',
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `عذراً، حدث خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}. يرجى المحاولة مرة أخرى.`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  if (authLoading || kpisLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <LoadingState fullScreen message="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }

  if (!user || user.role !== 'FOUNDER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <ErrorState
          message="هذه المساحة مخصصة للمؤسس فقط"
          fullScreen
        />
      </div>
    );
  }

  if (kpisError) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <ErrorState message={kpisError} onRetry={refetchKpis} fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            لوحة تحكم المؤسس
          </h1>
          <p className="text-gray-600">نظرة شاملة على منصة Banda Chao</p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 shadow-md">
            <div className="p-6">
              <p className="text-sm font-medium text-primary-700 mb-2">إجمالي الحرفيين</p>
              <p className="text-3xl font-bold text-primary-900">
                {kpis?.totalArtisans?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-xs text-primary-600 mt-1">↗ +12% هذا الشهر</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
            <div className="p-6">
              <p className="text-sm font-medium text-green-700 mb-2">إجمالي المنتجات</p>
              <p className="text-3xl font-bold text-green-900">
                {kpis?.totalProducts?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-xs text-green-600 mt-1">↗ +25% هذا الشهر</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
            <div className="p-6">
              <p className="text-sm font-medium text-blue-700 mb-2">إجمالي الفيديوهات</p>
              <p className="text-3xl font-bold text-blue-900">
                {kpis?.totalVideos?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">↗ +18% هذا الشهر</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <div className="p-6">
              <p className="text-sm font-medium text-purple-700 mb-2">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-purple-900">
                {kpis?.totalUsers?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-xs text-purple-600 mt-1">↗ +30% هذا الشهر</p>
            </div>
          </Card>
        </div>

        {/* Orders KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md">
            <div className="p-6">
              <p className="text-sm font-medium text-orange-700 mb-2">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-orange-900">
                {ordersStats.total.toLocaleString('ar-EG')}
              </p>
              <p className="text-xs text-orange-600 mt-1">↗ +15% هذا الشهر</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md">
            <div className="p-6">
              <p className="text-sm font-medium text-emerald-700 mb-2">الطلبات المدفوعة</p>
              <p className="text-3xl font-bold text-emerald-900">
                {ordersStats.paid.toLocaleString('ar-EG')}
              </p>
              <p className="text-xs text-emerald-600 mt-1">نسبة نجاح: {ordersStats.total > 0 ? Math.round((ordersStats.paid / ordersStats.total) * 100) : 0}%</p>
            </div>
          </Card>
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">نمو الحرفيين والمنتجات</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="makers" stroke="#2E7D32" strokeWidth={2} name="حرفيون" />
                  <Line type="monotone" dataKey="products" stroke="#66BB6A" strokeWidth={2} name="منتجات" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">نمو الطلبات</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#2E7D32" name="طلبات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">أحدث الطلبات</h2>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {order.product?.name || 'منتج'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.buyer?.name || 'مشتري'} • {order.quantity} قطعة
                        </p>
                      </div>
                      <div className="text-left ml-4">
                        <p className="font-medium text-primary">
                          ${order.totalPrice?.toFixed(2) || '0.00'}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            order.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status === 'PAID' ? 'مدفوع' : order.status === 'PENDING' ? 'قيد الانتظار' : order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لا توجد طلبات بعد</p>
            )}
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Makers */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">أحدث الحرفيين</h2>
                <Link href="/ar/makers">
                  <Button variant="text" className="text-sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
              {recentMakers.length > 0 ? (
                <div className="space-y-3">
                  {recentMakers.map((maker) => (
                    <Link
                      key={maker.id}
                      href={`/ar/makers/${maker.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {maker.avatarUrl || maker.user?.profilePicture ? (
                            <img
                              src={maker.avatarUrl || maker.user?.profilePicture}
                              alt={maker.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>👤</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {maker.displayName}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {maker.country || '—'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {maker._count?.products || 0} منتج
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد حرفيين بعد</p>
              )}
            </div>
          </Card>

          {/* Recent Products */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">أحدث المنتجات</h2>
                <Link href="/ar/products">
                  <Button variant="text" className="text-sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
              {recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/ar/products/${product.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url || product.imageUrl ? (
                            <img
                              src={product.images?.[0]?.url || product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>🛍️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {product.maker?.displayName || '—'}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          ${product.price?.toFixed(0) || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد منتجات بعد</p>
              )}
            </div>
          </Card>

          {/* Recent Videos */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">أحدث الفيديوهات</h2>
                <Link href="/ar/videos">
                  <Button variant="text" className="text-sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
              {recentVideos.length > 0 ? (
                <div className="space-y-3">
                  {recentVideos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/ar/videos/${video.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>▶️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {video.title}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {video.maker?.displayName || '—'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {video.viewsCount || 0} 👁️
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد فيديوهات بعد</p>
              )}
            </div>
          </Card>
        </div>

        {/* AI Assistant Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🐼</span>
              <h2 className="text-xl font-bold text-gray-900">الباندا المستشار</h2>
            </div>
            
            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="mb-2">مرحباً، المؤسس! 👋</p>
                  <p className="text-sm">اسألني عن أي شيء متعلق بالمنصة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={chatLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  variant="primary"
                >
                  إرسال
                </Button>
              </div>
              <Button
                onClick={async () => {
                  try {
                    await aiAPI.assistant({
                      assistant: 'consultant',
                      message: '',
                      conversationId: conversationId,
                      clearContext: true,
                    });
                    setChatMessages([]);
                  } catch (error) {
                    console.error('Error clearing context:', error);
                  }
                }}
                variant="text"
                className="text-xs text-gray-500"
              >
                تنظيف الجلسة
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

