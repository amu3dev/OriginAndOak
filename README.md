# ☕ Origin & Oak — Specialty Coffee Roasters | أوريجن آند أوك

> A modern, boutique specialty coffee roastery web application built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, and **Framer Motion**. Featuring bilingual Arabic/English support, high-contrast editorial aesthetics, warm amber accents, and an interactive customer ordering journey.
>
> **[Live demo](https://originandoak.amu3dev.workers.dev/)** · [Source](https://github.com/amu3dev/OriginAndOak)

---

## ✨ Features & Highlights

- **Interactive Barista Lab (Custom Drink Builder)**:
  - Select coffee foundations (*Latte, Cappuccino, Americano, Cold Brew*).
  - Customize cup volume (*8oz, 12oz, 16oz*), dairy & plant milks (*Oat, Almond, Soy, Coconut*), and artisanal syrups.
  - **Live Sensory Profile Visualizer**: Dynamic gauges estimating *Espresso Intensity*, *Sweetness Level*, and *Microfoam Creaminess* in real time.
- **Artisan Menu**:
  - Categorized catalog for *Espresso & Milk*, *Cold Brew & Nitro*, *Signature Crafts*, and *Artisan Bakery*.
  - Micro-animations with instant `"Added ✓"` tactile feedback.
- **Cart & Slide-Over Checkout**:
  - Persistent cart state across page reloads via `localStorage`.
  - **1-Click Bakery Pairings**: In-cart cross-sell suggestions (Croissants, Cinnamon Rolls, Biscotti).
  - **In-Cart Loyalty Milestone Tracker**: Dynamic progress indicator towards the next free reward.
  - Multi-step checkout modal: customer details, pickup roastery location, estimated prep time (8–12 min), and generated order confirmation.
- **Brew Club Loyalty Rewards**:
  - Dynamic member tier progression (*Bean, Brew, Barista, Legend*).
  - 1-click reward redemption that automatically applies discount line items to the cart.
- **Neighborhood Roastery Locator**:
  - Stylized interactive vector map with clickable location pins and direct Google Maps route links.
- **Boutique Editorial Aesthetic**:
  - High-contrast slate & obsidian neutrals, warm linen background `#f7f7f5`, and golden warm amber spot accents.
  - Native Light / Dark mode toggle powered by `useSyncExternalStore` with zero hydration mismatch.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.3.2](https://nextjs.org/) (App Router, Turbopack) |
| **Library** | [React 19.2.8](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@theme inline` design tokens |
| **Animations** | [Framer Motion 13](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Type Safety** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Linting** | [ESLint 9](https://eslint.org/) (React 19 Rules Compliant) |

---

## 📁 Project Structure

```
OriginAndOak/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Geist font, ThemeProvider, CartProvider, Navbar, Drawer & Footer
│   │   ├── page.tsx           # Aggregated landing page
│   │   └── globals.css        # Tailwind v4 theme palette, tactile linen tones & custom scrollbars
│   ├── components/
│   │   ├── Navbar.tsx         # Fixed glassmorphism navbar with theme switcher and cart badge
│   │   ├── Hero.tsx           # Hero showcase with Morning Ritual breakfast pairing bundle
│   │   ├── Menu.tsx           # Categorized artisan menu with tactile add micro-animations
│   │   ├── CustomDrinkBuilder.tsx # Custom drink creator with live sensory profile metrics
│   │   ├── LoyaltyRewards.tsx # Member tier progress card and redeemable perks
│   │   ├── StoreLocator.tsx   # Interactive map visual with roastery locations
│   │   ├── Cart.tsx           # Slide-over cart drawer with in-cart pairings and checkout flow
│   │   ├── ProductDetailModal.tsx # High-res product lightbox with tasting notes & quantity selector
│   │   └── Footer.tsx         # Brand footer with navigation and roastery details
│   └── lib/
│       ├── cart-context.tsx   # React Context & Hook (useCart) with localStorage persistence & rewards
│       ├── i18n.tsx           # Bilingual Arabic/English translation system with useI18n hook
│       └── theme-context.tsx  # Hydration-safe dark/light mode store using useSyncExternalStore
├── public/
│   └── images/               # High-resolution artisan product photography
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9+
- npm, yarn, pnpm, or bun

### 1. Installation

```bash
git clone https://github.com/amu3dev/OriginAndOak.git
cd OriginAndOak
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the app.

### 3. Build for Production

```bash
npm run build
npm run start
```

For the deployed Cloudflare static target, run:

```bash
CLOUDFLARE_BUILD=1 npm run build
```

This writes the static site to `out/` for Wrangler.

### 4. Code Quality & Type Check

```bash
npm run lint      # 0 errors, 0 warnings
npx tsc --noEmit  # Full TypeScript type check
```

---

## 📄 License

MIT © [Origin & Oak](https://github.com/amu3dev/OriginAndOak)
