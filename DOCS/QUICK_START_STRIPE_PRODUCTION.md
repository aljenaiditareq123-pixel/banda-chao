# ⚡ Quick Start: Stripe Production Setup

**Time:** 3-5 days  
**Priority:** 🔴 CRITICAL  
**Status:** Ready to Execute

---

## 🎯 What We're Building

Enable real customer payments with automatic order processing.

---

## ✅ Current Status

### Already Implemented:
- ✅ Webhook endpoint exists (`/api/v1/payments/webhook`)
- ✅ Stripe utilities (`server/src/lib/stripe.ts`)
- ✅ Order creation logic
- ✅ Notification system
- ✅ Test payment page

### Needs Completion:
- ⏳ Stripe account verification
- ⏳ Production API keys
- ⏳ Webhook endpoint configuration in Stripe
- ⏳ Testing with real payments

---

## 📋 Step-by-Step Execution

### Day 1: Stripe Account Setup (2-3 hours)

#### Step 1: Verify Stripe Account
1. Go to: https://dashboard.stripe.com
2. Complete business information:
   - Company: Banda Chao LLC
   - Type: E-commerce / Marketplace
   - Country: UAE, Region: Ras Al Khaimah
   - License: [From RAKEZ]
3. Add bank account details
4. Upload documents (Certificate of Incorporation)
5. Submit for review (1-3 business days)

#### Step 2: Get Production Keys
1. Switch to "Live mode" in Stripe Dashboard
2. Go to: Developers → API keys
3. Copy:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`
4. Save securely (password manager)

---

### Day 2: Environment Configuration (1 hour)

#### Step 3: Update Backend (Render)
1. Go to: https://dashboard.render.com
2. Select: `banda-chao-backend`
3. Environment tab → Add:
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_MODE=production
   ```
4. Save → Auto-redeploy

#### Step 4: Update Frontend (Vercel)
1. Go to: https://vercel.com/dashboard
2. Select: `banda-chao`
3. Settings → Environment Variables → Add:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```
4. Redeploy frontend

---

### Day 3: Webhook Setup (2-3 hours)

#### Step 5: Create Webhook in Stripe
1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://banda-chao.onrender.com/api/v1/payments/webhook`
4. Events to listen:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Copy signing secret: `whsec_...`

#### Step 6: Add Webhook Secret to Backend
1. Render → `banda-chao-backend` → Environment
2. Add: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`
3. Save → Redeploy

#### Step 7: Verify Webhook Handler
The webhook handler already exists in `server/src/api/payments.ts`. Verify it handles:
- ✅ `checkout.session.completed` → Create order, notify maker
- ✅ `payment_intent.succeeded` → Update order status
- ✅ Error handling and logging

---

### Day 4-5: Testing (3-4 hours)

#### Step 8: Test Payment Flow
1. Use test card: `4242 4242 4242 4242`
2. Complete checkout
3. Verify:
   - ✅ Order created in database
   - ✅ Order status = "PAID"
   - ✅ Maker notification sent
   - ✅ Webhook received in Stripe Dashboard

#### Step 9: Production Test (Small Amount)
1. Make real purchase ($1-5)
2. Verify:
   - ✅ Payment in Stripe Dashboard
   - ✅ Funds received
   - ✅ Order in database
   - ✅ Webhook delivered

---

## 🚨 Critical Notes

1. **Never commit API keys to Git**
   - Only use environment variables
   - Keep keys in password manager

2. **Webhook Security**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoint
   - Monitor webhook delivery in Stripe Dashboard

3. **Testing**
   - Test thoroughly before going live
   - Start with small amounts
   - Monitor first few real transactions

---

## 📊 Progress Checklist

- [ ] Stripe account verified
- [ ] Production keys obtained
- [ ] Backend environment updated
- [ ] Frontend environment updated
- [ ] Webhook endpoint created
- [ ] Webhook secret added
- [ ] Payment flow tested
- [ ] Production test completed

---

## 🎯 Success Criteria

✅ Real payments work  
✅ Orders created automatically  
✅ Makers notified  
✅ System ready for customers  

---

**Ready to start? Begin with Day 1: Stripe Account Setup! 🚀**

