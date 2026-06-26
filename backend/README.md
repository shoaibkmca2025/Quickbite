# QuickBite — Backend API

Node + Express + TypeScript + MongoDB (Mongoose) + Socket.IO.

Single API that serves all three clients: the **customer** mobile app, the **rider**
mobile app, and the **restaurant** + **admin/ops** web portals. Real-time updates
(new orders on the restaurant PC, live order status, rider location) are pushed over
Socket.IO.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas cluster.

## Setup

```bash
cd backend
cp .env.example .env        # edit MONGODB_URI + secrets if needed
npm install
npm run seed                # creates demo restaurants, menu, users, coupon
npm run dev                 # http://localhost:4000  (API under /api)
```

`npm run dev` uses `tsx watch` for hot reload. `npm run build && npm start` runs the
compiled JS in `dist/`.

### Demo credentials (created by `npm run seed`)

| Who | How to log in |
|-----|----------------|
| Admin / Ops (web) | `admin@quickbite.test` / `admin123` |
| Restaurant (web)  | `owner@quickbite.test` / `owner123` (Gourmet Kitchen) |
| Restaurant 2      | `owner2@quickbite.test` / `owner123` (Spice Route) |
| Customer (mobile) | phone `9000000001` — OTP is printed in the API console (dev mode) |
| Rider (mobile)    | phone `9000000003` — already online |

> In dev (`OTP_DEV_MODE=true`) the OTP is **returned in the API response** and logged,
> so no SMS provider is needed. Switch it off and wire Twilio/MSG91 in `src/utils/otp.ts`
> for production.

## Architecture

```
src/
  config/        env, db connection, logger
  middleware/    auth (JWT + RBAC), zod validation, error handler
  models/        Mongoose schemas (User, Restaurant, MenuItem, Order, Payment, Review, Coupon, Otp)
  modules/       feature-sliced: each has routes + controller + service + validation
    auth/        OTP login (mobile) + password login (web portals) + refresh
    restaurant/  discovery (customer) + management/dashboard/earnings (merchant)
    menu/        menu CRUD + sold-out toggle (merchant)
    order/       quote, create, pay, track, accept/reject/status, review  ← order state machine
    rider/       go online, assignments, claim, picked-up/out-for-delivery/delivered, earnings
    user/        profile + saved addresses + notification prefs
    coupon/      public offers + admin CRUD + validation engine
    admin/       ops overview, live orders, approve/suspend, manual assign, refunds
  socket/        Socket.IO setup + typed emitters (rooms per user/restaurant/rider/order)
  utils/         ApiError, asyncHandler, jwt, pricing (bill engine), ids, constants
  seed/          demo data
```

### Order lifecycle (state machine — `modules/order/order.state.ts`)

```
pending_payment → placed → accepted → preparing → ready → assigned
                                                        → picked_up → out_for_delivery → delivered
(any active)    → cancelled / rejected
```

Every transition is guarded, appended to `statusHistory`, and broadcast over Socket.IO.

## Realtime (Socket.IO)

Connect with `{ auth: { token } }`. Clients are auto-joined to rooms based on their role:
`user:<id>`, `restaurant:<id>`, `rider:<id>`, `admin`. Customers tracking a specific order
emit `join` with `{ orderId }` to receive `order:status` and `rider:location`.

Events: `order:created`, `order:updated`, `order:status`, `rider:assigned`,
`rider:location`, `notification`. See `src/utils/constants.ts` → `SOCKET_EVENTS`.

## Key API routes

```
POST   /api/auth/otp/request           { phone }                  → sends OTP (returns devCode in dev)
POST   /api/auth/otp/verify            { phone, code, name?, role? }
POST   /api/auth/login                 { email, password }        (restaurant/admin)
POST   /api/auth/refresh               { refreshToken }
GET    /api/auth/me

GET    /api/restaurants                ?lat&lng&q&cuisine&sort     (discovery)
GET    /api/restaurants/:id            (detail + grouped menu)
POST   /api/restaurants/register       (merchant onboarding)
GET    /api/restaurants/me             /me/dashboard  /me/earnings (merchant)
PATCH  /api/restaurants/me             (toggle open, hours, ...)

GET    /api/menu/mine                  POST /api/menu  PATCH /api/menu/:id
PATCH  /api/menu/:id/availability      DELETE /api/menu/:id

POST   /api/orders/quote               (bill preview + coupon check)
POST   /api/orders                     (create) → POST /api/orders/:id/pay
GET    /api/orders/mine                GET /api/orders/:id
POST   /api/orders/:id/cancel          POST /api/orders/:id/review
GET    /api/orders/restaurant          ?group=active|completed
POST   /api/orders/:id/accept|reject|status   (merchant)

POST   /api/rider/status               GET /api/rider/assignments  GET /api/rider/earnings
POST   /api/rider/orders/:id/claim|picked-up|out-for-delivery|delivered

GET    /api/coupons                    (offers)  + admin CRUD
GET    /api/admin/overview|orders/live|restaurants|riders
PATCH  /api/admin/restaurants/:id      POST /api/admin/orders/:id/refund|assign-rider
```

All responses are `{ success, message, data, meta? }`. Errors are `{ success:false, message, details? }`.
