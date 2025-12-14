import { prisma } from '../utils/prisma';

/**
 * Tracking Service - Visual Order Tracking
 * Provides order status and timeline for customer tracking
 */

interface TrackingEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: Date;
  location?: string;
  completed: boolean;
}

interface TrackingTimeline {
  orderId: string;
  currentStatus: string;
  events: TrackingEvent[];
  estimatedArrival?: Date;
  trackingNumber?: string;
}

/**
 * Get order status
 */
export async function getOrderStatus(orderId: string, userId: string): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                name_ar: true,
                name_zh: true,
                image_url: true,
              } as any,
            },
          },
        },
      },
    } as any);

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify ownership
    if (order.user_id !== userId) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      
      if (user?.role !== 'ADMIN' && user?.role !== 'FOUNDER') {
        return { success: false, error: 'Forbidden' };
      }
    }

    return {
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: (order as any).totalAmount || order.totalAmount || 0,
        currency: (order as any).currency || 'USD',
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingCountry: order.shipping_country,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: (order as any).order_items || [],
      },
    };
  } catch (error: any) {
    console.error('Error getting order status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tracking timeline
 */
export async function getTrackingTimeline(orderId: string, userId: string): Promise<TrackingTimeline> {
  try {
    const orderResult = await getOrderStatus(orderId, userId);
    
    if (!orderResult.success || !orderResult.order) {
      throw new Error('Order not found');
    }

    const order = orderResult.order;
    const status = order.status || 'PENDING';
    const createdAt = new Date(order.createdAt);
    
    // Define all possible tracking events
    const allEvents: Array<{
      status: string;
      title: Record<string, string>;
      description: Record<string, string>;
      location?: string;
      estimatedDays?: number;
    }> = [
      {
        status: 'PENDING',
        title: { ar: 'تم الطلب', en: 'Order Placed', zh: '已下单' },
        description: { ar: 'تم استلام طلبك', en: 'Your order has been received', zh: '您的订单已收到' },
        location: 'Online',
        estimatedDays: 0,
      },
      {
        status: 'PROCESSING',
        title: { ar: 'قيد المعالجة', en: 'Processing', zh: '处理中' },
        description: { ar: 'جاري تحضير طلبك', en: 'Preparing your order', zh: '正在准备您的订单' },
        location: 'Warehouse',
        estimatedDays: 1,
      },
      {
        status: 'PACKED',
        title: { ar: 'تم التغليف', en: 'Packed', zh: '已打包' },
        description: { ar: 'تم تغليف طلبك', en: 'Your order has been packed', zh: '您的订单已打包' },
        location: 'Warehouse',
        estimatedDays: 2,
      },
      {
        status: 'SHIPPED',
        title: { ar: 'تم الشحن', en: 'Shipped', zh: '已发货' },
        description: { ar: 'تم شحن طلبك', en: 'Your order has been shipped', zh: '您的订单已发货' },
        location: 'Airport',
        estimatedDays: 3,
      },
      {
        status: 'IN_TRANSIT',
        title: { ar: 'في الطريق', en: 'In Transit', zh: '运输中' },
        description: { ar: 'طلبك في الطريق إليك', en: 'Your order is on the way', zh: '您的订单正在运输中' },
        location: 'In Transit',
        estimatedDays: 7,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: { ar: 'خرج للتوصيل', en: 'Out for Delivery', zh: '配送中' },
        description: { ar: 'طلبك خرج للتوصيل', en: 'Your order is out for delivery', zh: '您的订单正在配送中' },
        location: 'Local',
        estimatedDays: 10,
      },
      {
        status: 'DELIVERED',
        title: { ar: 'تم التسليم', en: 'Delivered', zh: '已送达' },
        description: { ar: 'تم تسليم طلبك', en: 'Your order has been delivered', zh: '您的订单已送达' },
        location: 'Destination',
        estimatedDays: 12,
      },
    ];

    // Determine which events are completed based on order status
    const statusOrder = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentStatusIndex = statusOrder.indexOf(status);
    
    // Calculate estimated arrival (12 days from order date)
    const estimatedArrival = new Date(createdAt);
    estimatedArrival.setDate(estimatedArrival.getDate() + 12);

    // Build timeline events
    const events: TrackingEvent[] = allEvents.map((event, index) => {
      const isCompleted = index <= currentStatusIndex;
      const isCurrent = index === currentStatusIndex;
      
      // Calculate timestamp based on order creation + estimated days
      const eventDate = new Date(createdAt);
      if (event.estimatedDays) {
        eventDate.setDate(eventDate.getDate() + event.estimatedDays);
      }

      return {
        id: `event-${index}`,
        status: event.status,
        title: event.title.en, // Will be localized on frontend
        description: event.description.en, // Will be localized on frontend
        timestamp: isCompleted ? eventDate : new Date(), // Use actual date if completed, placeholder if not
        location: event.location,
        completed: isCompleted,
        isCurrent,
      } as TrackingEvent & { isCurrent?: boolean };
    });

    return {
      orderId,
      currentStatus: status,
      events,
      estimatedArrival,
      trackingNumber: orderId.substring(0, 8).toUpperCase(), // Generate tracking number from order ID
    };
  } catch (error: any) {
    console.error('Error getting tracking timeline:', error);
    return {
      orderId,
      currentStatus: 'UNKNOWN',
      events: [],
    };
  }
}

/**
 * Get order tracking data (combined)
 */
export async function getOrderTracking(orderId: string, userId: string, locale: string = 'en'): Promise<{
  success: boolean;
  order?: any;
  timeline?: TrackingTimeline;
  error?: string;
}> {
  try {
    const [orderResult, timeline] = await Promise.all([
      getOrderStatus(orderId, userId),
      getTrackingTimeline(orderId, userId),
    ]);

    if (!orderResult.success) {
      return { success: false, error: orderResult.error };
    }

    // Localize timeline events
    const localizedTimeline: TrackingTimeline = {
      ...timeline,
      events: timeline.events.map((event) => {
        const eventTitles: Record<string, Record<string, string>> = {
          PENDING: { ar: 'تم الطلب', en: 'Order Placed', zh: '已下单' },
          PROCESSING: { ar: 'قيد المعالجة', en: 'Processing', zh: '处理中' },
          PACKED: { ar: 'تم التغليف', en: 'Packed', zh: '已打包' },
          SHIPPED: { ar: 'تم الشحن', en: 'Shipped', zh: '已发货' },
          IN_TRANSIT: { ar: 'في الطريق', en: 'In Transit', zh: '运输中' },
          OUT_FOR_DELIVERY: { ar: 'خرج للتوصيل', en: 'Out for Delivery', zh: '配送中' },
          DELIVERED: { ar: 'تم التسليم', en: 'Delivered', zh: '已送达' },
        };

        const eventDescriptions: Record<string, Record<string, string>> = {
          PENDING: { ar: 'تم استلام طلبك', en: 'Your order has been received', zh: '您的订单已收到' },
          PROCESSING: { ar: 'جاري تحضير طلبك', en: 'Preparing your order', zh: '正在准备您的订单' },
          PACKED: { ar: 'تم تغليف طلبك', en: 'Your order has been packed', zh: '您的订单已打包' },
          SHIPPED: { ar: 'تم شحن طلبك', en: 'Your order has been shipped', zh: '您的订单已发货' },
          IN_TRANSIT: { ar: 'طلبك في الطريق إليك', en: 'Your order is on the way', zh: '您的订单正在运输中' },
          OUT_FOR_DELIVERY: { ar: 'طلبك خرج للتوصيل', en: 'Your order is out for delivery', zh: '您的订单正在配送中' },
          DELIVERED: { ar: 'تم تسليم طلبك', en: 'Your order has been delivered', zh: '您的订单已送达' },
        };

        const localizedEvent = {
          ...event,
          title: eventTitles[event.status as keyof typeof eventTitles]?.[locale] || event.title,
          description: eventDescriptions[event.status as keyof typeof eventDescriptions]?.[locale] || event.description,
        };
        return localizedEvent;
      }),
    };

    return {
      success: true,
      order: orderResult.order,
      timeline: localizedTimeline,
    };
  } catch (error: any) {
    console.error('Error getting order tracking:', error);
    return { success: false, error: error.message };
  }
}
