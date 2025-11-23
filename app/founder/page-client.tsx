"use client";

import { useAuth } from "@/contexts/AuthContext";
import FounderTopBar from "@/components/founder/FounderTopBar";
import FounderKPICard from "@/components/founder/FounderKPICard";
import PlatformHealthPanel from "@/components/founder/PlatformHealthPanel";
import MakerActivityPanel from "@/components/founder/MakerActivityPanel";
import ContentPerformancePanel from "@/components/founder/ContentPerformancePanel";
import AIAdvisorsSection from "@/components/founder/AIAdvisorsSection";
import { useFounderAnalytics } from "@/components/founder/useFounderAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

/**
 * Founder Dashboard Page Client Component
 * 
 * Luxury Gulf Founder Style Dashboard
 * 
 * Layout:
 * - Top Bar: Founder identity, time, status
 * - KPI Row: 4 primary KPIs (Active Makers, Revenue, Orders, AI Insights)
 * - Secondary Panels: Platform Health, Maker Activity, Content Performance
 * - AI Advisors Section: 6 Pandas as strategic advisors
 */
export default function FounderPageClient() {
  const { user } = useAuth();
  const { analytics, loading: analyticsLoading } = useFounderAnalytics();

  // Calculate active orders from analytics
  const activeOrders = analytics?.orders?.byStatus
    ? Object.values(analytics.orders.byStatus).reduce((sum, count) => sum + count, 0)
    : 0;

  // Calculate revenue (in AED or USD - placeholder)
  const revenue = analytics?.summary?.totalRevenue || 0;
  const formattedRevenue = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(revenue);

  // Calculate AI insights (placeholder: total AI interactions)
  // In future, this could come from a dedicated endpoint
  const aiInteractions = analytics?.summary?.totalUsers 
    ? Math.floor(analytics.summary.totalUsers * 2.5) // Placeholder calculation
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <FounderTopBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Primary KPI Row */}
        <section className="mb-8">
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >
                  <div className="animate-pulse">
                    <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-8 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Makers - Dark variant (primary) */}
              <FounderKPICard
                title="الحرفيون النشطون"
                value={analytics?.summary?.totalMakers || 0}
                change="+12.5%"
                trend="up"
                variant="dark"
                icon="🎨"
                description="إجمالي الحرفيين المسجلين"
              />

              {/* Monthly Revenue - Dark variant (primary) */}
              <FounderKPICard
                title="إجمالي المعاملات"
                value={formattedRevenue}
                change="+31.4%"
                trend="up"
                variant="dark"
                icon="💰"
                description="إجمالي الإيرادات"
              />

              {/* Active Orders - Light variant */}
              <FounderKPICard
                title="الطلبات النشطة"
                value={activeOrders}
                change="+8.2%"
                trend="up"
                variant="light"
                icon="📦"
                description="جميع الطلبات النشطة"
              />

              {/* AI Insights - Light variant */}
              <FounderKPICard
                title="جلسات الذكاء الاصطناعي"
                value={aiInteractions}
                change="+45.8%"
                trend="up"
                variant="light"
                icon="🤖"
                description="إجمالي التفاعلات مع AI"
              />
            </div>
          )}
        </section>

        {/* Secondary Panels */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlatformHealthPanel />
            <MakerActivityPanel />
            <ContentPerformancePanel />
          </div>
        </section>

        {/* AI Advisors Section */}
        <section>
          <AIAdvisorsSection />
        </section>
      </main>
    </div>
  );
}
