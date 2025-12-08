# 🎯 Detailed Work Plan: Stripe Production Setup & Webhook Handling

**Project:** Banda Chao  
**Phase:** Pre-Launch Technical Setup  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 3-5 days  
**Status:** Ready to Start

---

## 📋 Executive Summary

This plan covers the complete setup of Stripe Production mode, including:
1. Stripe account activation and verification
2. Production API keys configuration
3. Webhook endpoint implementation
4. Order fulfillment workflow
5. Testing and validation

**Goal:** Enable real customer payments and automatic order processing.

---

## 🎯 Phase 1: Stripe Account Setup (Day 1)

### Task 1.1: Activate Stripe Production Account
**Time:** 1-2 hours  
**Priority:** 🔴 Critical

#### Steps:
1. **Login to Stripe Dashboard**
   - Go to: https://dashboard.stripe.com
   - Navigate to: Settings → Account

2. **Complete Business Information**
   - Company name: **Banda Chao LLC**
   - Business type: **E-commerce / Marketplace**
   - Country: **United Arab Emirates**
   - Region: **Ras Al Khaimah**
   - License number: [From RAKEZ]
   - Legal address: [From RAKEZ]

3. **Add Bank Account Details**
   - Bank name: [Your bank]
   - Account number: [Your account]
   - IBAN: [Your IBAN]
   - SWIFT/BIC: [Your SWIFT code]

4. **Upload Required Documents**
   - Certificate of Incorporation (from RAKEZ)
   - Memorandum of Association
   - Bank statement (if required)
   - ID proof (passport)

5. **Submit for Verification**
   - Click "Submit for review"
   - Wait for approval (usually 1-3 business days)

#### Deliverables:
- ✅ Stripe account verified
- ✅ Bank account connected
- ✅ Account status: "Active"

#### Notes:
- Keep all documents ready before starting
- Stripe may request additional documents
- Verification can take 1-3 business days

---

### Task 1.2: Get Production API Keys
**Time:** 15 minutes  
**Priority:** 🔴 Critical

#### Steps:
1. **Navigate to API Keys**
   - Dashboard → Developers → API keys
   - Switch from "Test mode" to "Live mode" (toggle in top right)

2. **Copy Production Keys**
   - **Publishable key:** Starts with `pk_live_...`
   - **Secret key:** Starts with `sk_live_...`
   - ⚠️ **CRITICAL:** Never share secret key publicly!

3. **Save Keys Securely**
   - Store in password manager
   - Keep backup in secure location
   - Never commit to Git

#### Deliverables:
- ✅ Production Publishable Key: `pk_live_...`
- ✅ Production Secret Key: `sk_live_...`
- ✅ Keys stored securely

---

## 🎯 Phase 2: Environment Configuration (Day 1-2)

### Task 2.1: Update Backend Environment Variables
**Time:** 30 minutes  
**Priority:** 🔴 Critical

#### Steps:
1. **Access Render Dashboard**
   - Go to: https://dashboard.render.com
   - Select: `banda-chao-backend` service
   - Navigate to: Environment tab

2. **Add/Update Environment Variables**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_MODE=production
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
   - Replace `sk_live_...` with your production secret key
   - Replace `pk_live_...` with your production publishable key
   - `STRIPE_WEBHOOK_SECRET` will be added in Phase 3

3. **Save and Redeploy**
   - Click "Save Changes"
   - Service will automatically redeploy
   - Wait for deployment to complete (2-5 minutes)

#### Deliverables:
- ✅ Production keys added to Render
- ✅ Service redeployed successfully
- ✅ Environment variables verified

---

### Task 2.2: Update Frontend Environment Variables
**Time:** 30 minutes  
**Priority:** 🔴 Critical

#### Steps:
1. **Access Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select: `banda-chao` project
   - Navigate to: Settings → Environment Variables

2. **Add/Update Environment Variables**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```
   - Replace `pk_live_...` with your production publishable key
   - ⚠️ Note: Only publishable key goes in frontend (public)

3. **Redeploy Frontend**
   - Go to: Deployments tab
   - Click "Redeploy" on latest deployment
   - Or push a commit to trigger auto-deploy

#### Deliverables:
- ✅ Production publishable key added to Vercel
- ✅ Frontend redeployed
- ✅ Environment variables verified

---

## 🎯 Phase 3: Webhook Endpoint Implementation (Day 2-3)

### Task 3.1: Create Webhook Endpoint in Stripe
**Time:** 15 minutes  
**Priority:** 🔴 Critical

#### Steps:
1. **Navigate to Webhooks**
   - Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"

2. **Configure Endpoint**
   - **Endpoint URL:** `https://banda-chao.onrender.com/api/v1/payments/webhook`
   - **Description:** "Banda Chao Order Processing"
   - **Events to listen to:**
     - `checkout.session.completed` ✅
     - `payment_intent.succeeded` ✅
     - `payment_intent.payment_failed` ✅
     - `charge.refunded` ✅ (optional, for refunds)

3. **Save Endpoint**
   - Click "Add endpoint"
   - Copy the **Signing secret** (starts with `whsec_...`)
   - This is your `STRIPE_WEBHOOK_SECRET`

#### Deliverables:
- ✅ Webhook endpoint created
- ✅ Webhook signing secret: `whsec_...`
- ✅ Events configured

---

### Task 3.2: Update Backend with Webhook Secret
**Time:** 15 minutes  
**Priority:** 🔴 Critical

#### Steps:
1. **Add Webhook Secret to Render**
   - Render Dashboard → `banda-chao-backend` → Environment
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx`
   - Save and redeploy

2. **Verify Webhook Secret in Code**
   - Check: `server/src/lib/stripe.ts`
   - Ensure webhook secret is read from environment

#### Deliverables:
- ✅ Webhook secret added to environment
- ✅ Backend code verified
- ✅ Service redeployed

---

### Task 3.3: Implement Webhook Handler (Code Review)
**Time:** 2-3 hours  
**Priority:** 🔴 Critical

#### Current Status Check:
Let me verify the current webhook implementation:

**Files to Check:**
1. `server/src/api/payments.ts` - Webhook route handler
2. `server/src/lib/stripe.ts` - Stripe utilities
3. `server/src/api/orders.ts` - Order creation logic

#### Implementation Requirements:

1. **Webhook Route Handler**
   ```typescript
   // server/src/api/payments.ts
   router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
     const sig = req.headers['stripe-signature'];
     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
     
     let event;
     try {
       event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
     } catch (err) {
       return res.status(400).send(`Webhook Error: ${err.message}`);
     }
     
     // Handle the event
     switch (event.type) {
       case 'checkout.session.completed':
         await handleCheckoutCompleted(event.data.object);
         break;
       case 'payment_intent.succeeded':
         await handlePaymentSucceeded(event.data.object);
         break;
       // ... other events
     }
     
     res.json({ received: true });
   });
   ```

2. **Order Creation Logic**
   - Create order in database
   - Update order status to "PAID"
   - Send notification to maker
   - Send confirmation email to buyer

3. **Error Handling**
   - Log all webhook events
   - Handle duplicate events (idempotency)
   - Retry failed operations

#### Deliverables:
- ✅ Webhook handler implemented
- ✅ Order creation on payment success
- ✅ Notifications sent
- ✅ Error handling in place

---

## 🎯 Phase 4: Order Fulfillment Workflow (Day 3-4)

### Task 4.1: Order Status Management
**Time:** 2-3 hours  
**Priority:** 🟡 High

#### Implementation:

1. **Order Status Flow**
   ```
   PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
                      ↓
                   CANCELLED (if payment fails)
   ```

2. **Database Schema Check**
   - Verify `orders` table has all required fields
   - Ensure `order_items` table is properly linked
   - Check status enum values

3. **Status Update Endpoints**
   - `PATCH /api/v1/orders/:id/status` - Update order status
   - `GET /api/v1/orders/:id` - Get order details
   - `GET /api/v1/orders` - List orders (with filters)

#### Deliverables:
- ✅ Order status flow defined
- ✅ Status update endpoints implemented
- ✅ Database schema verified

---

### Task 4.2: Maker Notification System
**Time:** 1-2 hours  
**Priority:** 🟡 High

#### Implementation:

1. **Notification on Order Placed**
   - When order is created, notify maker
   - Include: Product name, buyer name, quantity, total
   - Send via: Database notification + Socket.IO (real-time)

2. **Notification Types**
   - `order-placed` - New order received
   - `order-cancelled` - Order cancelled
   - `payment-received` - Payment confirmed

#### Deliverables:
- ✅ Maker notifications implemented
- ✅ Real-time notifications via Socket.IO
- ✅ Notification history in database

---

### Task 4.3: Buyer Confirmation System
**Time:** 1-2 hours  
**Priority:** 🟡 High

#### Implementation:

1. **Order Confirmation**
   - Send confirmation when order is created
   - Include: Order number, items, total, estimated delivery

2. **Status Update Notifications**
   - Notify buyer when order status changes
   - Email notifications (if email service configured)
   - In-app notifications

#### Deliverables:
- ✅ Buyer confirmation implemented
- ✅ Status update notifications
- ✅ Email notifications (if configured)

---

## 🎯 Phase 5: Testing & Validation (Day 4-5)

### Task 5.1: Test Payment Flow
**Time:** 2-3 hours  
**Priority:** 🔴 Critical

#### Test Scenarios:

1. **Successful Payment**
   - Create test order
   - Complete payment with test card
   - Verify order created in database
   - Verify order status is "PAID"
   - Verify notifications sent

2. **Failed Payment**
   - Attempt payment with declined card
   - Verify order status is "FAILED"
   - Verify error message shown to user

3. **Webhook Delivery**
   - Check Stripe Dashboard → Webhooks → Events
   - Verify webhook events are received
   - Verify webhook responses are 200 OK

#### Test Cards (Stripe Test Mode):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

#### Deliverables:
- ✅ Payment flow tested
- ✅ Webhook delivery verified
- ✅ All test scenarios passed

---

### Task 5.2: Production Testing (Small Amount)
**Time:** 1 hour  
**Priority:** 🔴 Critical

#### Steps:

1. **Make Real Test Purchase**
   - Use real card (small amount: $1-5)
   - Complete checkout
   - Verify payment in Stripe Dashboard
   - Verify order in database
   - Verify webhook received

2. **Verify Funds**
   - Check Stripe Dashboard → Balance
   - Verify funds received
   - Check payout schedule

#### Deliverables:
- ✅ Real payment tested
- ✅ Funds received
- ✅ System working in production

---

### Task 5.3: Error Handling & Edge Cases
**Time:** 2-3 hours  
**Priority:** 🟡 High

#### Test Cases:

1. **Duplicate Webhook Events**
   - Stripe may send same event twice
   - Ensure idempotency (no duplicate orders)

2. **Network Failures**
   - Test webhook retry logic
   - Verify order creation on retry

3. **Invalid Webhook Signatures**
   - Test with wrong signature
   - Verify proper error handling

#### Deliverables:
- ✅ Edge cases tested
- ✅ Error handling verified
- ✅ System resilient to failures

---

## 📊 Progress Tracking

### Checklist:

#### Phase 1: Stripe Account Setup
- [ ] Stripe account verified
- [ ] Bank account connected
- [ ] Production API keys obtained

#### Phase 2: Environment Configuration
- [ ] Backend environment variables updated
- [ ] Frontend environment variables updated
- [ ] Services redeployed

#### Phase 3: Webhook Implementation
- [ ] Webhook endpoint created in Stripe
- [ ] Webhook secret added to backend
- [ ] Webhook handler implemented
- [ ] Order creation on payment success

#### Phase 4: Order Fulfillment
- [ ] Order status management implemented
- [ ] Maker notifications working
- [ ] Buyer confirmations working

#### Phase 5: Testing
- [ ] Payment flow tested
- [ ] Webhook delivery verified
- [ ] Production test completed
- [ ] Edge cases handled

---

## 🚨 Risk Mitigation

### Potential Issues:

1. **Stripe Account Verification Delay**
   - **Risk:** Takes longer than expected
   - **Mitigation:** Start early, have all documents ready
   - **Backup:** Use test mode for development

2. **Webhook Delivery Failures**
   - **Risk:** Webhooks not received
   - **Mitigation:** Implement retry logic, monitor webhook logs
   - **Backup:** Manual order creation endpoint

3. **Payment Processing Errors**
   - **Risk:** Orders not created on payment
   - **Mitigation:** Comprehensive testing, error logging
   - **Backup:** Manual reconciliation process

---

## 📞 Support & Resources

### Documentation:
- Stripe API Docs: https://stripe.com/docs/api
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Stripe Testing: https://stripe.com/docs/testing

### Tools:
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe CLI (for local testing): https://stripe.com/docs/stripe-cli

---

## 🎯 Next Steps After Completion

Once this plan is complete:
1. ✅ Real payments will work
2. ✅ Orders will be created automatically
3. ✅ Makers will be notified
4. ✅ System ready for real customers

**Then move to:**
- Shipping integration
- Inventory management
- Advanced order management UI

---

**Created:** $(date)  
**Last Updated:** $(date)  
**Status:** Ready to Execute  
**Estimated Completion:** 3-5 days

---

**Let's make Banda Chao ready for real customers! 🚀**

