# Implementation Roadmap - Code Review Findings

**Generated:** 2026-02-15
**Total Items:** 19 prioritized fixes
**Estimated Effort:** 6-9 days

---

## Week 1 - Deployment Blockers (Day 1-3)

### 🔴 Issue #1: IDOR Vulnerability on Order Tracking [CRITICAL]
**Priority:** P0
**Effort:** Trivial (1 line)
**Reviewers:** Security + Quality

**Problem:** `GET /api/orders/:id` returns any order without checking session ownership. Order IDs are predictable (DK-XXXXX format). Users can enumerate and access other users' PII (name, phone, address).

**Fix:**
- File: `server/routes/orders.ts:65-80`
- Add session check: `WHERE id = ? AND session_id = ?`
- Pass both parameters to the query

**Testing:** Try accessing another user's order ID, should return 404 or 403.

---

### 🔴 Issue #2: API Key Leaked to Client [CRITICAL]
**Priority:** P0
**Effort:** Medium (WebSocket proxy)
**Reviewers:** Security + Quality

**Problem:** `/api/ai/live-token` endpoint returns full Gemini API key to client. Key is visible in DevTools and can be extracted by XSS or browser extensions, enabling unlimited API cost abuse.

**Fix Options:**
1. **Recommended:** Server-side WebSocket proxy that forwards messages without exposing key
2. **Alternative:** Use Gemini short-lived session tokens (if available)

**Files:**
- `server/routes/ai.ts:93-102` (remove /live-token endpoint)
- `server/index.ts` (add WebSocket server)
- `components/LiveAssistant.tsx:94-102` (connect to local WS instead of Gemini directly)

**Testing:** Confirm API key never appears in Network tab or client bundle.

---

### 🔴 Issue #3: LiveAssistant Resource Leak [CRITICAL]
**Priority:** P1
**Effort:** Low (~15 lines)
**Reviewers:** All 3 (Security + Performance + Quality)

**Problem:** `window.location.reload()` used as cleanup. WebSocket, AudioContexts, and microphone stream never properly closed. Mic stays captured, memory leaks 5-15MB per session. Privacy violation (GDPR concern).

**Fix:**
- File: `components/LiveAssistant.tsx:90-186`
- Store `stream` in a ref
- Add `useEffect` cleanup: close session, stop tracks, close AudioContexts
- Replace `window.location.reload()` with proper cleanup

**Testing:** Open/close assistant multiple times, verify mic indicator turns off and memory doesn't accumulate.

---

### 🟠 Issue #4: Rate Limiting on AI Endpoints [HIGH]
**Priority:** P1
**Effort:** Low
**Reviewers:** Security + Performance

**Problem:** No rate limiting on `/api/ai/*` endpoints. AI calls incur Gemini API costs. Attackers can script unlimited requests to exhaust quota or run up charges.

**Fix:**
- Install `express-rate-limit`
- Add tiered rate limits:
  - AI image generation: 10 req/min per session
  - AI video animation: 3 req/min per session
  - Live token: 2 req/min per session
  - Cart/Orders: 30 req/min per session
  - Menu: 120 req/min per session

**Files:**
- `server/package.json` (add dependency)
- `server/routes/ai.ts` (apply middleware)
- `server/routes/cart.ts`, `server/routes/orders.ts` (apply middleware)

**Testing:** Rapid-fire requests, confirm 429 responses after limit.

---

### 🟠 Issue #5: Order ID Collision Risk [HIGH]
**Priority:** P1
**Effort:** Trivial (1 line)
**Reviewers:** Security + Quality

**Problem:** `Math.random()` generates 5-digit order IDs (90,000 possible values). Birthday problem gives ~40% collision probability at 300 orders. Not cryptographically secure.

**Fix:**
- File: `server/routes/orders.ts:6-9`
- Replace `Math.floor(10000 + Math.random() * 90000)` with `crypto.randomUUID().substring(0, 8).toUpperCase()`
- Update format from `DK-12345` to `DK-XXXXXXXX`

**Testing:** Create multiple orders, verify unique IDs.

---

## Week 1 - Infrastructure (Day 3-5)

### 🔵 Issue #6: Server-Side TypeScript Row Types [MEDIUM]
**Priority:** P1
**Effort:** Medium
**Reviewers:** Quality

**Problem:** Nearly all database queries typed as `any[]`. No compile-time safety for DB-to-API boundary. Schema changes cause silent runtime errors.

**Fix:**
- File: Create `server/types.ts`
- Define interfaces: `MenuItemRow`, `CartItemRow`, `OrderRow`, `OrderItemRow`
- Update all `db.prepare().get<T>()` and `.all<T>()` calls
- Ensure `session_id` field visible in types (prevents future IDOR bugs)

**Files:**
- `server/routes/menu.ts:25-61`
- `server/routes/cart.ts:12-92`
- `server/routes/orders.ts:11-135`

**Testing:** Compile-time verification. Try accessing wrong field name, should error.

---

### 🔵 Issue #7: Extract Shared DB Mapper (toMenuItemDTO) [MEDIUM]
**Priority:** P1
**Effort:** Medium
**Reviewers:** Quality + Performance

**Problem:** Menu item field mapping (`row.spice_level` → `spiceLevel`, etc.) duplicated in 5 locations. If a field is added, must update 5 files. Error-prone.

**Fix:**
- File: Create `server/utils/mappers.ts`
- Extract `toMenuItemDTO(row: MenuItemRow): MenuItem`
- Must use explicit field picking (allowlist pattern for security)
- Declare return type so TypeScript flags sensitive fields
- Replace 5 duplicated mappings

**Files to update:**
- `server/routes/menu.ts:27-38, 50-61`
- `server/routes/cart.ts:14-28`
- `server/routes/orders.ts:52-58` (2 locations)

**Testing:** Fetch menu, cart, orders - all should work identically.

---

### 🔵 Issue #8: useCallback for Cart Handlers [LOW]
**Priority:** P1
**Effort:** Trivial (3 lines)
**Reviewers:** Performance + Quality

**Problem:** `addToCart`, `removeFromCart`, `updateQuantity` not wrapped in `useCallback`. New reference on every render defeats `React.memo` on all `MenuCard` components. All 20 menu cards re-render on every cart change.

**Fix:**
- File: `App.tsx:200-227`
- Wrap 3 functions in `useCallback` with `[setCart]` dependency

**Testing:** Use React DevTools Profiler, verify MenuCard doesn't re-render when cart updates.

---

### 🟢 Issue #9: Remove Material Symbols Outlined Font [LOW]
**Priority:** P1
**Effort:** Trivial (2 minutes)
**Reviewers:** Performance + Quality

**Problem:** Loading entire Material Symbols Outlined variable font (~200KB) for a single icon (`delivery_dining`). Adds 300-600ms to initial page load (render-blocking).

**Fix:**
- File: `index.html:10` (remove font link)
- File: `pages/Tracking.tsx:117` (replace `material-symbols-outlined` class with `material-icons` equivalent or inline SVG)

**Testing:** Verify Tracking page icon still displays correctly. Check Network tab - font should no longer load.

---

## Week 2 - High Impact (Day 6-8)

### 🟠 Issue #10: N+1 Query on Orders API [HIGH]
**Priority:** P2
**Effort:** Medium
**Reviewers:** Performance + Quality

**Problem:** GET `/api/orders` fetches all orders, then loops and runs a separate JOIN query for each order's items. 50 orders = 51 queries. Degrades linearly.

**Fix:**
- File: `server/routes/orders.ts:48-59`
- Single query with JOIN and GROUP BY
- Group results in JavaScript using extracted `toMenuItemDTO` mapper
- Return same data structure

**Testing:** Fetch orders endpoint, verify same response with single query. Check logs.

---

### 🟠 Issue #11: Menu Filter Race Condition + Debouncing [MEDIUM]
**Priority:** P2
**Effort:** Medium
**Reviewers:** Performance + Security

**Problem:** Every filter change immediately triggers API call. Rapid clicks fire concurrent requests that can arrive out of order (stale data). No debouncing.

**Fix:**
- File: `pages/Menu.tsx:38-54`
- Add 150-200ms debounce on filter changes
- Use `AbortController` to cancel in-flight requests when filters change
- Store controller ref, abort previous request before new one

**Testing:** Rapidly toggle filters, verify only final state request completes.

---

### 🟠 Issue #12: Server-Side Input Validation [MEDIUM]
**Priority:** P2
**Effort:** Medium
**Reviewers:** Security + Quality

**Problem:** POST `/api/orders` accepts `customerName`, `phone`, `address`, `paymentMethod` without server-side validation. Client validation easily bypassed with direct API calls.

**Fix:**
- File: Create `server/utils/validation.ts`
- Shared validators: `validateName()`, `validatePhone()`, `validateAddress()`, `validatePaymentMethod()`
- Apply to `server/routes/orders.ts:83-135`
- Return 400 with specific error message on validation failure

**Testing:** Send invalid data via curl/Postman, verify 400 response.

---

### 🔵 Issue #13: Checkout Form Redesign [MEDIUM-HIGH]
**Priority:** P3
**Effort:** Medium-High
**Reviewers:** Quality + Performance

**Problem:** 332-line Checkout component with 8 interleaved `useState` calls. Any state change re-renders entire component. Hard to test and maintain.

**Fix:**
- File: `pages/Checkout.tsx`
- Extract `useCheckoutForm()` custom hook to manage state
- Split into sub-components: `<ContactForm>`, `<AddressSection>`, `<PaymentSection>`, `<OrderSummary>`
- Each section owns its state or receives only relevant props
- `React.memo` on sub-components

**Testing:** Functional parity. Type in one section, verify others don't re-render (DevTools Profiler).

---

## Cleanup - Anytime (Day 9)

### 🟢 Issue #14: Remove Dead Code (4 items) [LOW]
**Priority:** P4
**Effort:** Trivial
**Reviewers:** Quality + Performance

**Items to remove:**
1. `constants.ts:85-105` - `PAST_ORDERS` (never imported)
2. `types.ts:30` - `Page` type (never used)
3. `constants.ts:16` - `API_BASE_URL` (exported but never imported)
4. `api.ts:32-34` - `fetchMenuItem` (exported but never called)

**Testing:** Build succeeds, no import errors.

---

### 🟢 Issue #15: Revoke Object URLs in Studio [LOW]
**Priority:** P4
**Effort:** Trivial (1 line)
**Reviewers:** Performance

**Problem:** `URL.createObjectURL(blob)` for generated videos never revoked. 10-50MB per video accumulates in memory.

**Fix:**
- File: `pages/Studio.tsx:53`
- Store previous URL in ref
- Call `URL.revokeObjectURL(prevUrl)` before setting new URL

**Testing:** Generate multiple videos, verify memory doesn't grow unbounded (DevTools Memory profiler).

---

### 🟢 Issue #16: Hero Image fetchpriority [LOW]
**Priority:** P4
**Effort:** Trivial
**Reviewers:** Performance

**Problem:** Hero image is LCP candidate but missing `fetchpriority="high"` hint.

**Fix:**
- File: `pages/Home.tsx:43-48`
- Add `fetchpriority="high"` attribute to hero `<img>`

**Testing:** Lighthouse LCP score should improve by 100-500ms.

---

### 🟢 Issue #17: Secure Cookie Flag [LOW]
**Priority:** P4
**Effort:** Trivial (1 line)
**Reviewers:** Security

**Problem:** Session cookie missing `secure: true` flag. Could be sent over HTTP in production with HTTPS.

**Fix:**
- File: `server/index.ts:26-31`
- Add `secure: process.env.NODE_ENV === 'production'`

**Testing:** In production, verify cookie has `Secure` flag in DevTools.

---

### 🟢 Issue #18: Deduplicate API Base URL [LOW]
**Priority:** P4
**Effort:** Trivial
**Reviewers:** Quality

**Problem:** API base URL defined in 3 places. Port change requires 3 updates.

**Fix:**
- `constants.ts:16` already exports `API_BASE_URL`
- Delete local constants in `api.ts:3` and `geminiService.ts:2`
- Import from `constants.ts` instead

**Testing:** All API calls still work.

---

### 🟢 Issue #19: Refactor getTrackingSteps Logic [LOW]
**Priority:** P4
**Effort:** Low
**Reviewers:** Quality

**Problem:** `getTrackingSteps()` uses cascading mutations that contradict each other (line 34 sets `done=true`, line 49 sets `done=false`). Hard to follow.

**Fix:**
- File: `pages/Tracking.tsx:27-53`
- Use declarative status-to-steps mapping object
- Return computed steps array instead of mutations

**Testing:** All order statuses render correctly in Tracking page.

---

## Items Dropped (Unanimous - Not Implementing)

1. Cart re-fetch optimization (P5) - SQLite sub-ms, guarantees consistency
2. cartCount useMemo (P8) - Trivial computation
3. Navbar React.memo (P9) - Lightweight, P7 fixes root cause
4. animate-ping GPU (P13) - CSS compositor thread, negligible
5. GenAI singleton (P17) - Constructor stores string
6. Prepared statement extraction (P18) - better-sqlite3 caches internally
7. Skeleton component abstraction (CQ-16) - Layout-specific
8. Prompt injection filter (S-9) - Gemini has built-in filters
9. CSRF tokens (S-10) - sameSite + CORS sufficient

---

## Notes

- **Dependencies:** CQ-1 (types) and CQ-2 (mapper) should be done before P4 (N+1 query fix) for cleaner implementation
- **Testing:** Each fix should include manual testing. No automated test suite currently exists.
- **Deployment:** Items 1-5 block deployment. Items 6-9 should be completed before next release.
