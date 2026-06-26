# QuickBite — Restaurant & Ops Web Portal

The web app restaurants use **on the counter PC** to receive and fulfil orders, manage
their menu, and track earnings — plus an **admin/ops console** for marketplace operations.
Built with Vite + React + TypeScript, talking to the QuickBite backend over REST + Socket.IO.

## Setup

```bash
cd restaurant-web
cp .env.example .env      # point VITE_API_URL at the backend (default http://localhost:4000)
npm install
npm run dev               # http://localhost:5173
```

> Start the backend first (`cd ../backend && npm run dev`) and run `npm run seed` once.

## Log in (demo)

- **Restaurant:** `owner@quickbite.test` / `owner123` (Gourmet Kitchen)
- **Admin / Ops:** `admin@quickbite.test` / `admin123`

You can also register a new restaurant from the login screen (it lands in "pending approval"
until an admin approves it from the Ops Console).

## What's inside

| Page | PRD coverage |
|------|--------------|
| **Dashboard** | Today's orders / revenue / prep-time KPIs, live order table, an "Incoming" panel that lights up the moment a customer places an order (Socket.IO `order:created`), accept/reject, advance status. |
| **Orders** | Full order workspace: list + detail with customer info, itemised summary, status timeline, payment & earnings breakdown, and the accept → prepare → ready actions (FR-RST-02/03/07). |
| **Menu** | Add/edit/delete items, sold-out toggle (FR-MENU-03 / FR-RST-04), category grouping, availability stats. |
| **Earnings** | Pending/last payout, 7-day revenue chart, daily earnings history with payout status (FR-RST-06). |
| **Ops Console** (admin) | Marketplace KPIs, live order monitoring, approve/suspend restaurants, issue refunds (FR-ADM-01/02/03). |

## Realtime

On login the app opens a Socket.IO connection (token in the handshake) and auto-joins the
`restaurant:<id>` room. New orders and status changes update the UI live — no refresh, no
polling. See `src/hooks/useLiveOrders.ts`.
