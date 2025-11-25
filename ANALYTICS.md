# Analytics & Tracking Guide - Banda Chao

**تاريخ الإنشاء**: ديسمبر 2024  
**الهدف**: توثيق نظام Analytics والتتبع في مشروع Banda Chao

---

## 📊 Overview

نظام Analytics في Banda Chao مصمم ليكون بسيطاً ومرناً، مع إمكانية التوسع مستقبلاً لربطه بأدوات خارجية مثل Google Analytics أو Plausible.

---

## 🎯 Event Types

الأحداث التي يتم تتبعها حالياً:

### Page Views
- `PAGE_VIEW` - عند زيارة صفحة معينة
  - Metadata: `{ page: string }`

### User Actions
- `CLICK` - عند النقر على عنصر معين
  - Metadata: `{ element: string, location: string }`

### E-commerce Events
- `CHECKOUT_STARTED` - عند بدء عملية الدفع
  - Metadata: `{ productId: string, quantity: number, amount: number }`
- `CHECKOUT_COMPLETED` - عند إتمام عملية الدفع
  - Metadata: `{ orderId: string, sessionId?: string }`
- `CHECKOUT_CANCELLED` - عند إلغاء عملية الدفع
  - Metadata: `{ orderId?: string }`

### Content Views
- `PRODUCT_VIEWED` - عند عرض صفحة منتج
  - Metadata: `{ productId: string }`
- `MAKER_VIEWED` - عند عرض صفحة حرفي
  - Metadata: `{ makerId: string }`
- `VIDEO_VIEWED` - عند عرض فيديو
  - Metadata: `{ videoId: string }`

### AI Events
- `AI_MESSAGE_SENT` - عند إرسال رسالة للـ AI Assistant
  - Metadata: `{ messageLength: number, assistant: string }`

---

## 🔧 Implementation

### Backend

**API Endpoint**: `POST /api/v1/analytics/event`

**Request Body**:
```json
{
  "eventType": "PAGE_VIEW",
  "metadata": {
    "page": "/zh/products"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

**Analytics Summary** (for Founder/Admin):
- `GET /api/v1/analytics/summary`
- Returns: total events, events by type, recent events

### Frontend

**Location**: `lib/analytics.ts`

**Usage**:
```typescript
import { trackEvent, trackPageView, trackCheckoutStarted } from '@/lib/analytics';

// Track a custom event
trackEvent({
  eventType: 'CUSTOM_EVENT',
  metadata: { key: 'value' },
});

// Track page view
trackPageView('/zh/products');

// Track checkout started
trackCheckoutStarted(productId, quantity, amount);
```

---

## 📈 Current Tracking Points

### Automatic Tracking
- **Checkout Flow**: 
  - Checkout started (when user clicks "Buy")
  - Checkout completed (on success page)
  - Checkout cancelled (on cancel page)

### Manual Tracking (TODO)
- Page views on main pages
- Product/Maker/Video views
- AI message sent
- Button clicks (important actions)

---

## 🔮 Future Integration

النظام مصمم ليكون جاهزاً للتكامل مع:

### Google Analytics
```typescript
// TODO: Add to trackEvent function
if (window.gtag) {
  window.gtag('event', eventType, metadata);
}
```

### Plausible
```typescript
// TODO: Add to trackEvent function
if (window.plausible) {
  window.plausible(eventType, { props: metadata });
}
```

### Mixpanel / Amplitude
```typescript
// TODO: Add to trackEvent function
if (window.mixpanel) {
  window.mixpanel.track(eventType, metadata);
}
```

---

## 🗄️ Database Schema

**Model**: `AnalyticsEvent`

```prisma
model AnalyticsEvent {
  id        String   @id @default(uuid())
  userId    String?  // Optional - can track anonymous events
  eventType String
  metadata  Json?
  createdAt DateTime @default(now())

  user      User?    @relation(...)

  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
}
```

---

## 📊 Analytics Dashboard (Future)

مستقبلاً، يمكن بناء لوحة تحكم Analytics في `/founder/analytics` تعرض:

- Total events over time
- Events by type
- Most viewed products/makers/videos
- Checkout conversion rate
- User engagement metrics

---

## 🔒 Privacy & GDPR

- Events can be tracked anonymously (userId is optional)
- Metadata should not contain sensitive information
- Consider implementing user consent mechanism for GDPR compliance

---

## 🛠️ Troubleshooting

### Events not being tracked
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check authentication token if event requires auth
4. Verify eventType is valid

### Performance concerns
- Events are sent asynchronously
- Failed events don't block user experience
- Consider batching events in the future for high-traffic scenarios

---

**آخر تحديث**: ديسمبر 2024


