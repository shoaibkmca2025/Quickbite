# 🍴 QuickBite — Full-Stack Food Delivery Platform

A web-first, three-sided food delivery marketplace built to the
[QuickBite PRD](./QuickBite_Food_Delivery_PRD.pdf). Customers and riders use a
**mobile app** (React Native / Expo); restaurants and operations use a **web portal**
(React); everything is powered by a **Node/Express + MongoDB + Socket.IO** backend.

> The order a customer places on their phone appears **live on the restaurant's PC** —
> no refresh — and the customer + rider then see each status change in real time.

```
quickbite/
├── backend/         Node + Express + TypeScript + MongoDB + Socket.IO  (the API)
├── frontend/        Expo (React Native) mobile app — Customer + Rider
├── restaurant-web/  Vite + React web portal — Restaurant + Admin/Ops
└── QuickBite_Food_Delivery_PRD.pdf
```

(The loose files in the repo root — `src/`, `vite.config.ts`, `firebase-*` — are the original
Google AI Studio prototype the design was taken from. The three folders above are the real,
production-shaped application and are self-contained.)

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Backend | Node, Express, TypeScript, Mongoose (MongoDB), Socket.IO, JWT, Zod |
| Mobile  | Expo, React Native, Expo Router, Zustand, Socket.IO client |
| Web     | Vite, React, TypeScript, React Router, Zustand, Socket.IO client |
| Auth    | OTP (phone) for customers/riders · email+password for restaurant/admin · JWT access+refresh · role-based access control |
| Realtime| Socket.IO rooms per user / restaurant / rider / order |

---

## Quick start (3 terminals)

Prerequisites: **Node 18+** and **MongoDB** (local on `27017`, or a free Atlas URI).

### 1 · Backend
```bash
cd backend
cp .env.example .env        # set MONGODB_URI if not using local default
npm install
npm run seed                # demo restaurants, menu, users, coupon
npm run dev                 # http://localhost:4000
```

### 2 · Restaurant / Ops web portal
```bash
cd restaurant-web
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

### 3 · Mobile app (customer + rider)
```bash
cd frontend
cp .env.example .env        # ⚠️ set EXPO_PUBLIC_API_URL — see frontend/README.md
npm install
npx expo start              # open in Expo Go / emulator
```

> **Mobile networking gotcha:** a phone/emulator can't reach `localhost`. Use
> `http://10.0.2.2:4000` (Android emulator) or your computer's LAN IP for a real phone.
> Details in [`frontend/README.md`](./frontend/README.md).

---

## Demo accounts (created by `npm run seed`)

| Role | Where | Credentials |
|------|-------|-------------|
| Customer | Mobile | phone `9000000001` (OTP shown in app + backend logs) |
| Rider | Mobile | phone `9000000003` |
| Restaurant | Web | `owner@quickbite.test` / `owner123` (Gourmet Kitchen) |
| Admin / Ops | Web | `admin@quickbite.test` / `admin123` |

---

## See it work end-to-end (the demo script)

1. **Customer (mobile)** — log in as `9000000001`, open **Gourmet Kitchen**, add items,
   apply coupon `WELCOME50`, choose UPI/COD, **place order**, land on live tracking.
2. **Restaurant (web)** — the order **pops up instantly** under *Incoming* / *Live Orders*.
   Accept → Start Prep → **Mark Ready**.
3. On "Ready" the backend **auto-assigns the online rider** (Deepak).
4. **Rider (mobile)** — log in as `9000000003`, see the assignment, tap
   *Picked Up → On the way → Delivered*.
5. The **customer's tracking screen updates live** at every step; after delivery they can
   **rate** the order. The **Ops Console** reflects GMV, live orders, and lets you refund.

This exact flow is covered by an automated smoke test (21 assertions) plus a Socket.IO
realtime test — both pass against the running API.

---

## What's implemented (mapped to the PRD)

**Customer (§8.1):** OTP + guest browsing · location/geo discovery · search & filters ·
restaurant + menu with customisation & sold-out · single-restaurant cart · transparent bill ·
coupons · UPI/card/COD payments with retry + idempotency · order confirmation, **live status
tracking**, cancellation · history · ratings & reviews · saved addresses & profile.

**Restaurant (§8.2):** onboarding (pending approval) · **instant new-order alerts** ·
accept/reject + prep time · status advance · menu management & availability · dashboard KPIs ·
earnings & payouts.

**Admin/Ops (§8.3):** marketplace overview · live order monitoring · approve/suspend
restaurants & riders · manual rider assignment · disputes/refunds · coupon management · RBAC.

**Rider (§8.4):** go online/offline · assignments + claim available · navigate (maps deep-link) ·
status updates propagated in real time · earnings & trip history.

**Non-functional (§10):** JWT auth + RBAC, rate limiting, Helmet, input validation (Zod),
idempotent payments, centralised error handling, transparent itemised pricing, geospatial
indexing.

---

## Architecture notes

- **Order state machine** (`backend/src/modules/order/order.state.ts`) guards every transition
  and records a full `statusHistory`; each change is broadcast over Socket.IO.
- **Provider abstraction:** payments and OTP/SMS run in mock "dev mode" out of the box
  (no external accounts needed) and are isolated behind small modules ready to swap for
  Razorpay/Stripe and Twilio/MSG91.
- **Feature-sliced backend:** every module is `routes + controller + service + validation`.
- Each app has its own README with deeper details.

## Production checklist (next steps)

- Wire real SMS (OTP) and a real payment gateway; set `OTP_DEV_MODE=false`, `PAYMENT_DEV_MODE=false`.
- Move JWT secrets to a secret manager; add refresh-token rotation/revocation.
- Add automated tests (Jest/Supertest) and CI; containerise with Docker.
- Add image uploads (S3/Cloudinary) instead of image URLs.
- Build the Expo app with EAS for store/PWA distribution.
