# 🏨 Le Six Hotel System

A production-ready SaaS Hotel Management System built with **Next.js 14 + React + Prisma + SQLite**.

**Powered by Kamel Nassif (Solunera)**

---

## ✨ Features

- ✅ Splash screen with animated logo
- ✅ Dashboard with live stats
- ✅ Guest check-in with room conflict validation
- ✅ Guest check-out with auto record cleanup
- ✅ Payment recording with full history
- ✅ WhatsApp owner notifications (Twilio)
- ✅ Search & filter on all tables
- ✅ Clean dark hotel UI
- ✅ Full REST API (Next.js App Router)
- ✅ SQLite via Prisma ORM — zero server setup

---

## 📁 Project Structure

```
lesix-hotel/
├── prisma/
│   ├── schema.prisma        ← Database schema (SQLite)
│   └── seed.js              ← Sample data seeder
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Splash screen
│   │   ├── layout.tsx                ← Root layout + fonts
│   │   ├── globals.css               ← Design system CSS
│   │   ├── dashboard/page.tsx        ← Dashboard page
│   │   ├── guests/page.tsx           ← Guests management page
│   │   ├── payments/page.tsx         ← Payments page
│   │   └── api/
│   │       ├── guests/route.ts           ← GET all / POST check-in
│   │       ├── guests/[id]/route.ts      ← GET detail / DELETE check-out
│   │       ├── guests/stats/route.ts     ← Dashboard stats
│   │       └── payments/route.ts         ← GET all / POST payment
│   ├── components/
│   │   ├── layout/AppShell.tsx       ← Sidebar + header shell
│   │   ├── ui/index.tsx              ← Modal, Btn, Field, StatCard…
│   │   └── modals/
│   │       ├── CheckInModal.tsx
│   │       ├── PaymentModal.tsx
│   │       ├── GuestDetailModal.tsx
│   │       └── ConfirmModal.tsx
│   ├── hooks/useGuests.ts            ← Data fetching hooks
│   ├── lib/
│   │   ├── prisma.ts                 ← Prisma singleton
│   │   └── whatsapp.ts              ← Twilio WhatsApp service
│   └── types/index.ts               ← Shared TypeScript types
├── .env                             ← Environment variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Setup & Run

### Prerequisites
- **Node.js 18+** — https://nodejs.org
- **npm** (comes with Node)

### Step 1 — Install dependencies
```bash
cd lesix-hotel
npm install
```

### Step 2 — Set up the database
```bash
npx prisma db push
```

### Step 3 — (Optional) Seed with sample data
```bash
npm run db:seed
```

### Step 4 — Start development server
```bash
npm run dev
```

Open **http://localhost:3000**

---

## 🏗️ Production Build

```bash
npm run build
npm start
```

---

## 📲 WhatsApp Setup (Twilio)

1. Sign up at https://www.twilio.com
2. Get your **Account SID** and **Auth Token**
3. Enable the WhatsApp Sandbox in Twilio Console
4. Update `.env`:

```env
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=whatsapp:+14155238886
OWNER_WHATSAPP_NUMBER=whatsapp:+9611234567
```

Leave `WHATSAPP_ENABLED=false` during development — messages log to console instead.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guests` | All guests with payment totals |
| POST | `/api/guests` | Check-in a new guest |
| GET | `/api/guests/stats` | Dashboard statistics |
| GET | `/api/guests/[id]` | Guest details + payments |
| DELETE | `/api/guests/[id]` | Check-out + delete guest |
| GET | `/api/payments` | All payments with guest info |
| POST | `/api/payments` | Record a new payment |

---

## 🔧 Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Sync Prisma schema to DB
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Load sample data
```

---

## 🔐 Security Notes

- Never commit `.env` with real credentials to Git
- Add `.env` to `.gitignore`
- For production: use environment variables on your hosting platform (Vercel, Railway, etc.)

---

*Powered by Kamel Nassif (Solunera)*
