/**
 * Founder Console Types
 * Single source of truth for Founder-related TypeScript interfaces
 */

export interface FounderKPIs {
  /** إجمالي الحرفيين - Total Artisans */
  totalArtisans: number;
  /** إجمالي المنتجات - Total Products */
  totalProducts: number;
  /** إجمالي الفيديوهات - Total Videos */
  totalVideos: number;
  /** إجمالي الطلبات - Total Orders */
  totalOrders: number;
  /** إجمالي المستخدمين - Total Users */
  totalUsers: number;
  /** إجمالي الخدمات - Total Services */
  totalServices: number;
  /** حرفيون جدد هذا الأسبوع - New Artisans This Week */
  newArtisansThisWeek: number;
  /** طلبات جديدة هذا الأسبوع - New Orders This Week */
  newOrdersThisWeek: number;
  /** خدمات جديدة هذا الأسبوع - New Services This Week */
  newServicesThisWeek: number;
  /** إجمالي طلبات البيتا - Total Beta Applications */
  totalBetaApplications: number;
  /** طلبات بيتا جديدة هذا الأسبوع - New Beta Applications This Week */
  newBetaApplicationsThisWeek: number;
  /** أحدث الخدمات - Latest Services */
  latestServices?: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    type: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER';
    created_at: Date | string;
    makers?: {
      id: string;
      name: string;
    };
  }>;
}

export interface FounderUser {
  id: string;
  email: string;
  name: string;
  role: 'FOUNDER' | 'MAKER' | 'USER';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface WelcomeMessage {
  greeting: string;
  kpisSummary?: string;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
}





