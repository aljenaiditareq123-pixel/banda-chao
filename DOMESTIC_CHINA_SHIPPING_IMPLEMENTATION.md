# ✅ Domestic China Shipping Implementation

## Overview

Implemented "China Domestic Shipping" logic to support direct, low-cost shipping for domestic sales (China to China) versus international sales via the UAE Hub.

## Changes Made

### 1. ✅ Backend: Shipping Rates Configuration (`server/src/config/shippingRates.ts`)

**Added:**
- `DOMESTIC_CN_RATE_PER_KG: 5` AED per kg (low domestic rate)
- `DOMESTIC_CN_FLAT_FEE: 10` AED flat fee (base handling)

**New Function:**
- `calculateDomesticChinaShipping(weightInKg)` - Calculates domestic shipping costs

**Updated Functions:**
- `calculateHubShipping()` - Now accepts `originCountry` parameter (defaults to 'CN')
  - Checks if `originCountry === 'CN' && destinationCountry === 'CN'`
  - If true, uses `calculateDomesticChinaShipping()` instead of Hub Model
  - Returns `isDomestic: true` flag

- `calculateHubShippingForItems()` - Now accepts `originCountry` parameter
  - Passes `originCountry` to `calculateHubShipping()`

**Updated Interface:**
- `ShippingCalculationDetails` now includes:
  - `isDomestic: boolean` - Indicates if shipping is domestic (CN -> CN)
  - `region: 'US' | 'EU' | 'GCC' | 'DEFAULT' | 'DOMESTIC_CN'` - Added 'DOMESTIC_CN'

### 2. ✅ Backend: Orders API (`server/src/api/orders.ts`)

**Updated `GET /orders/shipping/calculate`:**
- Accepts optional `originCountry` query parameter
- Defaults to 'CN' if not provided
- Passes `originCountry` to `calculateHubShippingForItems()`
- Returns `isDomestic` and `originCountry` in response

**Updated `POST /orders` (Create Order):**
- Fetches product information with maker details to determine origin country
- Queries `products` table with `users.makers` relation to get maker's country
- Logic:
  - If all products are from China makers → `originCountry = 'CN'`
  - If mixed origins → Uses first product's maker country (defaults to 'CN')
- Passes `originCountry` to shipping calculation
- Includes `isDomestic` and `originCountry` in order response

### 3. ✅ Frontend: API Client (`lib/api.ts`)

**Updated `ordersAPI.calculateShipping()`:**
- Accepts optional `originCountry` parameter
- Passes `originCountry` to backend if provided
- Backend defaults to 'CN' if not provided

### 4. ✅ Frontend: Checkout Page (`app/[locale]/checkout/page-client.tsx`)

**No changes required:**
- UI already hides detailed shipping breakdown (per previous request)
- Only displays total shipping cost
- Domestic vs international shipping automatically handled by backend
- Customer sees single "Shipping Cost" regardless of shipping type

## How It Works

### Scenario 1: Domestic China Order (CN → CN)
1. Customer in China selects China as shipping country
2. Backend fetches products and checks maker countries
3. If all products from China makers → `originCountry = 'CN'`
4. Shipping calculation detects: `originCountry === 'CN' && destinationCountry === 'CN'`
5. Uses `calculateDomesticChinaShipping()`:
   - Formula: `10 AED (flat) + (weight × 5 AED/kg)`
   - No UAE hub fees
   - No international handling
6. Customer sees low domestic shipping cost

### Scenario 2: International Order (CN → Any other country)
1. Customer selects non-China country
2. Backend determines origin (defaults to 'CN' for China artisans)
3. Shipping calculation: `originCountry === 'CN' && destinationCountry !== 'CN'`
4. Uses Hub Model:
   - China → UAE: `weight × 15 AED/kg`
   - UAE handling: `25 AED`
   - UAE → Customer: `weight × rate (varies by region)`
5. Customer sees international shipping cost

## Shipping Rates Summary

### Domestic China (CN → CN)
- Flat fee: **10 AED**
- Per kg: **5 AED/kg**
- Example (1kg): **15 AED total**
- Example (2kg): **20 AED total**

### International (CN → World via UAE Hub)
- China → UAE: **15 AED/kg**
- UAE handling: **25 AED** (fixed)
- UAE → Customer:
  - US: **40 AED/kg**
  - EU: **35 AED/kg**
  - GCC: **20 AED/kg**
  - Default: **50 AED/kg**
- Example (1kg to US): **80 AED total** (15 + 25 + 40)

## Testing

### Test Case 1: Domestic China Order
```bash
# Request
GET /api/v1/orders/shipping/calculate?country=CN&items=[{"weightInKg":1,"quantity":1}]&originCountry=CN

# Expected Response
{
  "success": true,
  "shipping": {
    "cost": 15,  // 10 + (1 × 5)
    "details": {
      "chinaToUae": 0,
      "handling": 0,
      "uaeToCustomer": 0,
      "region": "DOMESTIC_CN",
      "isDomestic": true,
      "originCountry": "CN"
    }
  }
}
```

### Test Case 2: International Order
```bash
# Request
GET /api/v1/orders/shipping/calculate?country=US&items=[{"weightInKg":1,"quantity":1}]&originCountry=CN

# Expected Response
{
  "success": true,
  "shipping": {
    "cost": 80,  // 15 + 25 + 40
    "details": {
      "chinaToUae": 15,
      "handling": 25,
      "uaeToCustomer": 40,
      "region": "US",
      "isDomestic": false,
      "originCountry": "CN"
    }
  }
}
```

## Database Schema

**No schema changes required.** Uses existing:
- `products` table (with `user_id`)
- `users` table (with `makers` relation)
- `makers` table (with `country` field)

## Backward Compatibility

✅ **Fully backward compatible:**
- `originCountry` parameter is optional (defaults to 'CN')
- Existing API calls without `originCountry` continue to work
- Frontend doesn't need to pass `originCountry` (backend determines it from products)
- UI unchanged (already hides shipping details)

## Files Modified

1. ✅ `server/src/config/shippingRates.ts` - Added domestic shipping logic
2. ✅ `server/src/api/orders.ts` - Updated to fetch origin country and use domestic rates
3. ✅ `lib/api.ts` - Updated `calculateShipping` to accept optional `originCountry`

## Files NOT Modified (No Changes Needed)

- ✅ `app/[locale]/checkout/page-client.tsx` - Already hides shipping details, works automatically
- ✅ Database schema - No changes needed
- ✅ Other API endpoints - Unaffected

## Next Steps

1. ✅ Implementation complete
2. ⏳ Test with real orders (CN → CN vs CN → International)
3. ⏳ Monitor shipping cost calculations in production
4. ⏳ Consider adding UI indicator for "Domestic Shipping" if needed (optional)

---

**Status:** ✅ **COMPLETE** - Ready for testing and deployment
