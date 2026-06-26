# QuickBite — Mobile App (Customer + Rider)

A single Expo (React Native) app with two experiences selected at login:

- **Customer:** set location → discover restaurants → browse menu & customise → cart →
  checkout (UPI / card / COD + coupons) → **live order tracking** → rate & reorder.
- **Rider:** go online → receive/claim assignments → navigate → picked-up → out-for-delivery
  → delivered → earnings.

Built with Expo Router (file-based routing), Zustand, and Socket.IO for real-time order
status. Talks to the QuickBite backend.

## Setup

```bash
cd frontend
cp .env.example .env        # set EXPO_PUBLIC_API_URL (see note below)
npm install
npx expo start              # press a (Android), i (iOS), or scan the QR with Expo Go
```

### ⚠️ Set the API URL correctly

A phone/emulator cannot reach `localhost` on your computer:

| Running on | `EXPO_PUBLIC_API_URL` |
|------------|------------------------|
| Android emulator | `http://10.0.2.2:4000` |
| iOS simulator | `http://localhost:4000` |
| Physical device (Expo Go) | `http://<your-LAN-IP>:4000` e.g. `http://192.168.1.5:4000` |

Find your LAN IP with `ipconfig` (Windows) / `ifconfig` (mac/linux). The backend already
allows all origins in dev.

## Demo logins

- **Customer:** phone `9000000001` (or any 10-digit number to create a new account).
  In dev the OTP is auto-filled (also printed in the backend console).
- **Rider:** phone `9000000003`.

## Structure (Expo Router)

```
app/
  _layout.tsx          root stack + auth bootstrap + role-based redirect
  login.tsx            phone OTP, choose Customer / Rider
  (customer)/          tabs: home (discovery), orders, profile
  restaurant/[id].tsx  menu + customisation + add to cart
  cart.tsx             cart with quantity steppers (single-restaurant rule)
  checkout.tsx         address, coupon, payment method, live bill, place order
  order/[id].tsx       LIVE tracking (Socket.IO), cancel, rate
  (rider)/             tabs: deliveries (online toggle, claim, status), earnings, profile
src/
  api.ts  socket.ts  theme.ts  types.ts  format.ts
  store/auth.ts  store/cart.ts
  components/ui.tsx
```

## End-to-end demo

1. Start backend (`npm run seed` then `npm run dev`) and the restaurant web portal.
2. Log in here as customer `9000000001`, place an order at **Gourmet Kitchen**.
3. Watch it pop up instantly on the restaurant PC (web portal → Dashboard/Incoming).
4. Accept → Start Prep → Mark Ready on the web. When "Ready", it auto-assigns the online
   rider (Deepak).
5. Log in on another device/emulator as rider `9000000003`, mark picked-up → on the way →
   delivered. The customer's tracking screen updates live at every step.
