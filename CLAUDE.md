# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dakshin Delights is a South Indian cloud kitchen web app built with React 19, TypeScript, and Vite. It was generated via Google AI Studio and integrates Google Gemini APIs for AI-powered image generation, video animation, and a real-time voice assistant.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

No test framework or linter is configured.

## Environment

Set `GEMINI_API_KEY` in `.env.local`. Vite exposes it as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` via the `define` config in `vite.config.ts`.

## Architecture

**Flat structure** — no `src/` directory. All source files live at the project root alongside config files.

### Key Files

- `App.tsx` — Root component with React Router (HashRouter), cart state management, Navbar, and Footer
- `types.ts` — Core TypeScript interfaces: `MenuItem`, `CartItem`, `Order`, `Page`
- `constants.ts` — Static data: `MENU_ITEMS` array and `PAST_ORDERS` array (no backend)
- `geminiService.ts` — Gemini API wrapper with two static methods: `generateImage` (Gemini 3 Pro) and `animateImage` (Veo 3.1)
- `index.html` — Loads TailwindCSS via CDN script tag (not PostCSS), defines custom theme colors/fonts inline, and uses an importmap for ESM dependencies

### Pages (`pages/`)

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page with hero, promotions, specialties grid, chef bio, testimonials |
| Menu | `/menu` | Full menu with category/dietary/spice filters |
| Checkout | `/checkout` | Cart summary, contact/address/payment forms, order placement |
| Orders | `/orders` | Order history with active order card and past orders list |
| Tracking | `/tracking/:id` | Visual order tracking with map mockup and delivery timeline |
| Studio | `/studio` | AI image generation (Gemini) and video animation (Veo) |

### Components (`components/`)

- `LiveAssistant.tsx` — Floating voice chat widget using Gemini Live API (`gemini-2.5-flash-native-audio-preview`). Captures microphone audio as PCM, sends via WebSocket, plays back AI audio responses. The assistant persona is "Chef Amara."

### State Management

Cart state (`CartItem[]`) is managed via `useState` in `App.tsx` and passed down as props. There is no global state library or backend — all data is static/mocked in `constants.ts`.

### Styling

TailwindCSS loaded via CDN `<script>` tag in `index.html` with inline `tailwind.config`. Custom theme colors:
- `primary`: `#ec5b13` (orange)
- `background-light`: `#f8f6f6`
- `background-dark`: `#221610`
- `accent-gold`: `#FFB800`
- `deep-orange`: `#D34700`

Font: Work Sans. Icons: Material Icons + Material Symbols Outlined.

### Routing

Uses `HashRouter` from react-router-dom v7. All routes defined in `App.tsx`.
