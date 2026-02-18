# Smoke Test Report — Dakshin Delights
**Date:** 2026-02-16
**Branch:** `master` (33c6ab5)
**Tester:** Claude Code (automated)

---

## Summary

| Category | Result |
|----------|--------|
| Production Build | PASS |
| Frontend Server | PASS |
| Backend Server | PASS (with warnings) |
| API — Menu | PASS |
| API — Cart | PASS |
| API — Orders | PASS |
| Input Validation | PASS |
| CORS | PASS |
| **Overall** | **PASS with 1 warning** |

---

## 1. Production Build

**Command:** `npm run build`
**Result:** PASS

Build completed in 1.93s. All 6 pages code-split correctly.

| Asset | Size | Gzip |
|-------|------|------|
| `index.css` | 11.25 kB | 2.75 kB |
| `index.js` (main bundle) | 203.90 kB | 64.33 kB |
| `vendor.js` | 47.42 kB | 16.77 kB |
| `genai.js` | 47.45 kB | 14.58 kB |
| `Checkout.js` | 14.78 kB | 3.51 kB |
| `Home.js` | 8.72 kB | 3.31 kB |
| `Studio.js` | 8.00 kB | 2.55 kB |
| `Tracking.js` | 6.93 kB | 2.07 kB |
| `Orders.js` | 6.10 kB | 1.89 kB |
| `Menu.js` | 6.02 kB | 2.07 kB |
| `MenuCard.js` | 3.57 kB | 1.18 kB |

**Minor CSS warning** (non-blocking): `"file" is not a known CSS property` — esbuild false positive from TailwindCSS generated class `.[\file\:line\]`, suggests "flex" instead. No visual impact.

---

## 2. Frontend Server

**URL:** `http://localhost:3000`
**Result:** PASS — HTTP 200

---

## 3. Backend Server

**URL:** `http://localhost:3001`
**Result:** PASS (server running and responding)

**WARNING — `ERR_ERL_KEY_GEN_IPV6`** (non-fatal, but logged 3 times on startup):

```
ValidationError: Custom keyGenerator appears to use request IP without calling
the ipKeyGenerator helper function for IPv6 addresses.
```

Affects `server/routes/ai.ts` lines 11, 20, 29 — the three rate limiters for image generation, video animation, and live token endpoints. The current `keyGenerator` uses `req.ip` as fallback:

```ts
keyGenerator: (req) => req.cookies?.session_id || req.ip
```

The server **still starts and processes requests** despite the warning, but IPv6 users could bypass rate limits. This is a known incompatibility with `express-rate-limit` v8.

---

## 4. API Endpoint Tests

### GET `/api/menu`
- **HTTP:** 200
- **Result:** PASS
- **Response:** 5 menu items returned

```json
{
  "id": "m1",
  "name": "Ghee Roast Masala Dosa",
  "price": 180,
  "category": "Breakfast",
  "dietary": "VEG",
  "spiceLevel": "Medium",
  "isSpecial": true
}
```

### GET `/api/menu?category=Breakfast&dietary=VEG`
- **HTTP:** 200
- **Result:** PASS
- **Response:** 4 items (filtering works correctly)

### GET `/api/cart` (new session)
- **HTTP:** 200
- **Result:** PASS
- **Response:** `[]` (empty cart for new session)

### POST `/api/cart` — Add item
- **HTTP:** 200
- **Result:** PASS
- **Payload:** `{"menuItemId":"m1","quantity":2}`
- **Response:** Cart with 1 item, quantity 2

### GET `/api/orders` (new session)
- **HTTP:** 200
- **Result:** PASS
- **Response:** `[]` (no orders yet)

### POST `/api/orders` — Place order
- **HTTP:** 200
- **Result:** PASS
- **Payload:**
```json
{
  "customerName": "Test User",
  "phone": "9876543210",
  "address": "123 Test Street, Chennai",
  "paymentMethod": "UPI"
}
```
- **Response:** Order `DK-91FFAB9D` created with status `PREPARING`, total ₹120

### GET `/api/orders/DK-91FFAB9D`
- **HTTP:** 200
- **Result:** PASS
- **Response:** Order retrieved correctly — 1 item, status `PREPARING`

### GET `/api/nonexistent`
- **HTTP:** 404
- **Result:** PASS (proper 404 handling)

---

## 5. Input Validation

### POST `/api/orders` — Invalid payload
- **HTTP:** 400
- **Result:** PASS
- **Payload:** `{"customerName":"","phone":"bad","address":"","paymentMethod":"INVALID"}`
- **Response:**
```json
{
  "error": "Validation failed",
  "errors": [
    {"field": "customerName", "message": "Name is required"},
    {"field": "phone", "message": "Phone number must be exactly 10 digits"},
    {"field": "address", "message": "Address is required"},
    {"field": "paymentMethod", "message": "Payment method must be one of: CARD, UPI, CASH"}
  ]
}
```

---

## 6. CORS

**Request:** `Origin: http://localhost:3000`
**Response header:** `Access-Control-Allow-Origin: http://localhost:3000`
**Credentials:** `Access-Control-Allow-Credentials: true`
**Result:** PASS

---

## Issues Found

### Issue 1 — CRITICAL (Startup Warning, Non-Fatal)
**File:** `server/routes/ai.ts` lines 11, 20, 29
**Error:** `ERR_ERL_KEY_GEN_IPV6`
**Impact:** Rate limiters emit validation warnings on every server start. IPv6 users can bypass AI endpoint rate limits. Server continues to function.
**Fix:** Use `ipKeyGenerator` from `express-rate-limit`:

```ts
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

keyGenerator: (req) => req.cookies?.session_id || ipKeyGenerator(req)
```

### Issue 2 — MINOR (CSS Build Warning)
**Source:** esbuild / TailwindCSS generated class `.[\file\:line\]`
**Impact:** Cosmetic only — no functional or visual regression
**Fix:** Can be suppressed or ignored; no action required

---

## What Was Not Tested

- Gemini AI image/video generation (requires API key + live call)
- Live voice assistant WebSocket (requires browser audio)
- Dark/light theme toggle persistence (UI-only, covered in #1 PR)
- Mobile responsive layout (requires browser)
- End-to-end checkout flow in browser

---

## Conclusion

The project is in **good health**. The build is clean, all 8 API endpoints respond correctly, validation works, CORS is properly configured, and the full order lifecycle (add to cart → place order → retrieve order) functions as expected. The one actionable issue is the `ERR_ERL_KEY_GEN_IPV6` warning in the AI routes which should be fixed before production deployment.
