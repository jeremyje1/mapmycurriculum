# Simplified Pricing Configuration

## ✅ Pricing Model Updated

**Previous**: 7 different pricing tiers with separate price IDs
**Current**: Single unified price for full platform access

### Pricing Details
- **Price**: $249
- **Access**: Full platform access
- **Stripe Price ID**: `price_1SGk9KCzPgWh4DF8Vw8mAR5d`

## 🔄 Changes Made

Updated all environment files to use the single price ID:

### Environment Variable
```bash
# Old (multiple tiers):
NEXT_PUBLIC_PRICE_SCHOOL_STARTER=...
NEXT_PUBLIC_PRICE_SCHOOL_PRO=...
NEXT_PUBLIC_PRICE_DISTRICT_PRO=...
NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE=...
NEXT_PUBLIC_PRICE_DEPARTMENT=...
NEXT_PUBLIC_PRICE_COLLEGE=...
NEXT_PUBLIC_PRICE_INSTITUTION=...

# New (single price):
NEXT_PUBLIC_PRICE_ID=price_1SGk9KCzPgWh4DF8Vw8mAR5d
```

### Files Updated
- ✅ `.env`
- ✅ `.env.production`
- ✅ `.env.railway`
- ✅ `apps/web/.env.local`

## 📝 Code Changes Required

You'll need to update your frontend code to use the new environment variable:

### Before:
```typescript
// Multiple price IDs based on tier
const priceId = process.env.NEXT_PUBLIC_PRICE_SCHOOL_STARTER
// or
const priceId = process.env.NEXT_PUBLIC_PRICE_DISTRICT_PRO
```

### After:
```typescript
// Single price ID for all users
const priceId = process.env.NEXT_PUBLIC_PRICE_ID
```

### Files to Update
Look for references to the old price variables in:
- `apps/web/app/` (any checkout/pricing pages)
- `apps/web/components/` (pricing components)
- `apps/web/api/checkout/` (checkout API routes)

Search command:
```bash
cd apps/web
grep -r "NEXT_PUBLIC_PRICE_SCHOOL" .
grep -r "NEXT_PUBLIC_PRICE_DISTRICT" .
grep -r "NEXT_PUBLIC_PRICE_DEPARTMENT" .
grep -r "NEXT_PUBLIC_PRICE_COLLEGE" .
grep -r "NEXT_PUBLIC_PRICE_INSTITUTION" .
```

## 🚀 Deployment Notes

When deploying to Vercel/Railway, use:
```bash
NEXT_PUBLIC_PRICE_ID=price_1SGk9KCzPgWh4DF8Vw8mAR5d
```

## 🔍 Verification

After code updates, test:
1. Checkout flow creates session with correct price ID
2. Stripe dashboard shows $249 charge
3. No references to old multi-tier pricing remain

---

**Benefit**: Simplified pricing = clearer value proposition, easier checkout flow, less code complexity.
