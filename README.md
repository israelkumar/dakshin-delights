<div align="center">
<img width="1200" height="475" alt="Dakshin Delights Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Dakshin Delights

**Authentic South Indian Cloud Kitchen — Web App**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white)

</div>

---

## Overview

Dakshin Delights is a full-featured cloud kitchen web app built with **React 19**, **TypeScript**, and **Vite**. It integrates **Google Gemini APIs** for AI-powered image generation, video animation, and a real-time voice assistant chef.

## Features

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, promotions banner, signature specialties, chef bio, testimonials |
| Menu | `/menu` | Full menu with category, dietary, and spice-level filters |
| Checkout | `/checkout` | Multi-step cart checkout with contact, address, and payment forms |
| Orders | `/orders` | Active order tracking + order history |
| Tracking | `/tracking/:id` | Real-time order tracking with delivery timeline |
| AI Studio | `/studio` | AI dish image generation (Gemini) and video animation (Veo) |

**Live Assistant** — Floating voice chat widget powered by Gemini Live API. Talk to "Chef Amara" for recipe recommendations and South Indian food trivia.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6
- **Styling**: TailwindCSS 4 (PostCSS), dark mode via `class` strategy
- **Routing**: React Router v7 (HashRouter), code-split with `React.lazy`
- **AI**: Google Gemini 2.5 Flash (voice), Gemini 3 Pro (image), Veo 3.1 (video)
- **Backend proxy**: Express server (`server/`) — proxies Gemini API calls so the key is never in the client bundle
- **State**: `useState` in `App.tsx`, no global state library
- **Icons**: Material Icons + Material Symbols Outlined
- **Font**: Work Sans

## Project Structure

```
dakshin-delights/
├── pages/              # Route-level page components
│   ├── Home.tsx
│   ├── Menu.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── Tracking.tsx
│   └── Studio.tsx
├── components/
│   ├── LiveAssistant.tsx   # Gemini Live voice widget
│   ├── MenuCard.tsx        # Shared card (Home + Menu)
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   └── Toast.tsx           # Toast notification context
├── hooks/
│   └── useCheckoutForm.ts  # Multi-step checkout form logic
├── server/
│   └── routes/ai.ts        # API proxy for Gemini calls
├── App.tsx                 # Root: router, cart state, Navbar, Footer
├── constants.ts            # Static menu items and past orders
├── types.ts                # Core TypeScript interfaces
├── geminiService.ts        # Gemini API wrapper
├── index.css               # TailwindCSS v4 theme + animations
└── tailwind.config.js      # Tailwind config (dark mode, custom colors)
```

## Theme Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#ec5b13` | Buttons, accents, active states |
| `background-light` | `#f8f6f6` | Light mode page background |
| `background-dark` | `#0d0905` | Dark mode page background (near-black) |
| `accent-gold` | `#FFB800` | Highlights, promo banners |
| `deep-orange` | `#D34700` | Gradient start on promo sections |
| `cream` | `#FFF9E6` | Subtle warm surfaces |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your key: GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
# → http://localhost:3000
```

### Available Scripts

```bash
npm run dev       # Dev server (Vite + Express proxy)
npm run build     # Production build
npm run preview   # Preview production build
```

## Dark Mode

Dark mode is toggled via the sun/moon button in the navbar. The strategy uses Tailwind's `class` mode — a `dark` class on `<html>` switches the entire palette to deep near-black surfaces (`stone-950`, `slate-950`) on a `#0d0905` background.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |

Set in `.env.local` — never committed to version control.
