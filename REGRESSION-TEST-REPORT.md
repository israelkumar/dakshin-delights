# Regression Test Report — Dakshin Delights
**Date:** 2026-02-16
**Branch:** `master` (33c6ab5)
**Environment:** Local development
**Frontend:** `http://localhost:3000` (Vite dev server)
**Backend:** `http://localhost:3001` (Express + SQLite)

---

## Executive Summary

| Suite | Tests | Pass | Fail | Warn |
|-------|-------|------|------|------|
| Frontend | 7 | 7 | 0 | 0 |
| Menu API | 6 | 6 | 0 | 0 |
| Cart CRUD | 8 | 7 | 1 | 0 |
| Orders Lifecycle | 7 | 7 | 0 | 0 |
| Order Validation | 5 | 5 | 0 | 0 |
| Payment Methods | 3 | 3 | 0 | 0 |
| Security | 5 | 5 | 0 | 0 |
| Error Handling | 4 | 3 | 1 | 0 |
| E2E Checkout Flow | 6 | 6 | 0 | 0 |
| **TOTAL** | **51** | **49** | **2** | **1** |

**Overall: PASS with 2 bugs and 1 startup warning**

---

## Bugs Found

### BUG-01 — HTTP 500 on Missing Content-Type (Medium Severity)

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/cart` |
| **Severity** | Medium |
| **File** | `server/routes/cart.ts:35` |

**Steps to reproduce:**
```bash
curl -X POST http://localhost:3001/api/cart \
  -d '{"menuItemId":"m1","quantity":1}'   # no Content-Type header
```

**Expected:** HTTP 400 with `{"error": "Content-Type must be application/json"}`
**Actual:** HTTP 500 — `TypeError: Cannot destructure property 'menuItemId' of 'req.body' as it is undefined`

**Root cause:** Express `json()` middleware does not parse the body when `Content-Type` is absent. The route handler immediately destructures `req.body` without a null guard.

**Affected routes:** Same issue likely affects `POST /api/orders` and `PUT /api/cart/:id`.

---

### BUG-02 — Cart POST is Additive (Not Idempotent) — Design Ambiguity (Low Severity)

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/cart` |
| **Severity** | Low / Design |
| **File** | `server/routes/cart.ts:50-55` |

**Behavior:** Adding item `m3` with `quantity: 1`, then `POST` again with `quantity: 2`, results in `quantity: 3` (1 + 2), not `quantity: 2`.

**SQL used:**
```sql
ON CONFLICT(session_id, menu_item_id)
DO UPDATE SET quantity = quantity + excluded.quantity
```

This is intentional (correct "add to cart" UX), but should be documented. The frontend should use `PUT /api/cart/:id` to set absolute quantities. If the frontend ever calls `POST` on an item already in the cart, quantities will double.

---

### WARNING-01 — Rate Limiter IPv6 Validation (Startup Warning)

| Field | Value |
|-------|-------|
| **Severity** | Low / Security |
| **File** | `server/routes/ai.ts:11, 20, 29` |

Three `ValidationError: ERR_ERL_KEY_GEN_IPV6` warnings are emitted on every server start. The custom `keyGenerator` uses `req.ip` as a fallback without the `ipKeyGenerator` helper required by `express-rate-limit` v8. IPv6 users could bypass rate limits on AI endpoints.

```ts
// Current (triggers warning)
keyGenerator: (req) => req.cookies?.session_id || req.ip

// Fix
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
keyGenerator: (req) => req.cookies?.session_id || ipKeyGenerator(req)
```

---

## Full Test Results

### Frontend (7/7 PASS)

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| `GET /` | 200 | 200 | PASS |
| `GET /#/menu` | 200 | 200 | PASS |
| `GET /#/checkout` | 200 | 200 | PASS |
| `GET /#/orders` | 200 | 200 | PASS |
| `GET /#/studio` | 200 | 200 | PASS |
| `GET /#/tracking/test` | 200 | 200 | PASS |
| Static assets (11 files: JS + CSS) | 200 each | 200 each | PASS |

---

### Menu API (6/6 PASS)

| Test | Input | Expected | Actual | Result |
|------|-------|----------|--------|--------|
| GET all items | — | 200, count=5 | 200, count=5 | PASS |
| Filter by category | `category=Breakfast` | 200, count=4 | 200, count=4 | PASS |
| Filter by dietary | `dietary=NON-VEG` | 200, count=1, all NON-VEG | 200, count=1, all NON-VEG | PASS |
| Filter by spice level | `spiceLevel=Spicy` | 200, count=1, all Spicy | 200, count=1, all Spicy | PASS |
| Combined filters | `dietary=VEG&spiceLevel=Medium` | 200, count=2 | 200, count=2 | PASS |
| Invalid category | `category=INVALID` | 200, count=0 | 200, count=0 | PASS |

---

### Cart CRUD (7/8 PASS)

| Test | Input | Expected | Actual | Result |
|------|-------|----------|--------|--------|
| GET empty cart (new session) | — | 200, `[]` | 200, `[]` | PASS |
| POST add item m1 qty=2 | `m1, qty=2` | 200, 1 item, qty=2 | 200, 1 item, qty=2 | PASS |
| POST add different item m2 | `m2, qty=1` | 200, 2 items | 200, 2 items | PASS |
| GET cart state | — | 200, `[m1:qty2, m2:qty1]` | 200, `[m1:qty2, m2:qty1]` | PASS |
| PUT update qty | `m1, qty=5` | 200, m1_qty=5 | 200, m1_qty=5 | PASS |
| PUT qty=0 removes item | `m1, qty=0` | 200, m1 removed | 200, m1 removed | PASS |
| DELETE item | DELETE m2 | 200, cart empty | 200, cart empty | PASS |
| POST without Content-Type | no header | 400 | **500** | **FAIL** |

---

### Orders Lifecycle (7/7 PASS)

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| GET orders (empty session) | 200, `[]` | 200, `[]` | PASS |
| POST place order | 201, id=DK-*, status=PREPARING | 201, DK-57A4C92A, PREPARING | PASS |
| POST returns correct total | total=(sum of items) | ₹470 (180×2 + 110×1) | PASS |
| POST clears cart | cart → empty after order | cart=0 items | PASS |
| GET all orders (session) | 200, count=1 | 200, count=1 | PASS |
| GET order by ID | 200, correct order data | 200, 2 items, total=470 | PASS |
| GET non-existent order | 404, `{"error":"Order not found"}` | 404, `{"error":"Order not found"}` | PASS |

---

### Order Validation (5/5 PASS)

| Test | Payload | Expected | Actual | Result |
|------|---------|----------|--------|--------|
| All fields missing | `{}` | 400, 4 errors | 400, 4 errors | PASS |
| Phone too short (3 digits) | `phone: "123"` | 400, phone error | 400, phone error | PASS |
| Phone too long (11 digits) | `phone: "12345678901"` | 400, phone error | 400, phone error | PASS |
| Invalid payment method | `paymentMethod: "INVALID"` | 400, payment error | 400, payment error | PASS |
| Empty cart checkout | valid body, empty cart | 400, `{"error":"Cart is empty"}` | 400, `{"error":"Cart is empty"}` | PASS |

**Validation rules confirmed:**
- `customerName`: required, 2–50 chars, letters and spaces only
- `phone`: required, exactly 10 digits
- `address`: required, 10–200 characters
- `paymentMethod`: required, one of `CARD`, `UPI`, `CASH`

---

### Payment Methods (3/3 PASS)

| Method | HTTP | Order ID | Total | Result |
|--------|------|----------|-------|--------|
| UPI | 201 | DK-0556E4A8 | ₹120 | PASS |
| CASH | 201 | DK-78E90EB1 | ₹120 | PASS |
| CARD | 201 | DK-E02431FC | ₹120 | PASS |

---

### Security (5/5 PASS)

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| IDOR — GET order without session | 404 | 404 | PASS |
| IDOR — GET order with wrong session | 404 | 404 | PASS |
| CORS — allowed origin | ACAO: `http://localhost:3000` | `http://localhost:3000` | PASS |
| CORS — rejected origin (`evil.com`) | No reflected evil origin | ACAO: `http://localhost:3000` (not reflected) | PASS |
| CORS — OPTIONS preflight | 204 + CORS headers | 204 + correct headers | PASS |

**IDOR protection confirmed:** `GET /api/orders/:id` uses `WHERE id = ? AND session_id = ?`. An order can only be retrieved by the session that created it.

---

### Error Handling (3/4 PASS)

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| GET non-existent route | 404 | 404 | PASS |
| POST order with malformed JSON | 400 | 400 (Express JSON parser handles it) | PASS |
| POST cart without Content-Type | 400 | **500 — unhandled TypeError** | **FAIL** |
| DELETE non-existent cart item | 200, `[]` (idempotent) | 200, `[]` | PASS |

---

### End-to-End Checkout Flow (6/6 PASS)

Full simulation of a customer session from browsing to tracking:

| Step | Action | Expected | Actual | Result |
|------|--------|----------|--------|--------|
| 1 | Browse menu (`GET /api/menu`) | 5 items | 5 items | PASS |
| 2 | Add 3 items to cart | cart=3 items | 3 items | PASS |
| 3 | Checkout (`POST /api/orders`) | 201, order created | DK-F10DEB4F, ₹540 | PASS |
| 4 | Cart cleared after checkout | cart=0 | 0 items | PASS |
| 5 | Order visible in history | count=1 | 1 order | PASS |
| 6 | Track order (`GET /api/orders/:id`) | status=PREPARING, eta set | PREPARING, 25-30 mins | PASS |

---

## Not Tested (Out of Scope)

| Area | Reason |
|------|--------|
| Gemini AI image generation | Requires live API call + API key |
| Veo video animation | Requires live API call |
| Live voice assistant (WebSocket) | Requires browser microphone |
| Dark/light theme toggle | UI-only, covered in PR #3 |
| Mobile responsive layout | Requires browser rendering |
| Concurrent session stress test | Out of scope for smoke regression |

---

## Recommendations

| Priority | Issue | Action |
|----------|-------|--------|
| Medium | BUG-01: 500 on missing Content-Type | Add `req.body` null guard or middleware check in cart/orders routes |
| Low | WARNING-01: IPv6 rate limiter warning | Replace `req.ip` with `ipKeyGenerator(req)` in `server/routes/ai.ts` |
| Low | BUG-02: Additive cart POST | Document behavior or add a `mode` param (`add` vs `set`) |
