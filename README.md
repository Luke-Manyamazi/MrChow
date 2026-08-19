# Mr Chow

Mr Chow is a food and grocery delivery platform for Masvingo, Zimbabwe. This repository contains the shared backend API that connects customers using the web app, mobile app, or WhatsApp with restaurants and merchants, delivery drivers, administrators, and online payment providers.

> **Status: In progress**

The API foundation is available now. Production authentication, client applications, database deployment, merchant onboarding, driver operations, and live payment credentials are still being completed.

## Platform scope

- **Customer web and mobile apps:** browse merchants, view products, place orders, track delivery, and pay online.
- **WhatsApp ordering:** receive text, interactive replies, and location messages through the Meta Cloud API.
- **Admin app:** view operational metrics and orders, update order status, and assign deliveries.
- **Merchant operations:** manage active merchants and their menus through the shared database and API foundation.
- **Delivery operations:** assign drivers and update assigned, picked-up, and delivered states.
- **Payments:** Paynow integration for Visa, Mastercard, EcoCash, and OneMoney flows where enabled by the merchant account.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` plus the WhatsApp credentials.
2. Install dependencies with `npm install`.
3. Generate the Prisma client with `npm run prisma:generate`.
4. Apply the schema to a development database with `npx prisma migrate dev --name init`.
5. Start the API with `npm run dev`.

The polished React web client lives in `web/`. Run it separately during development with `cd web && npm install && npm run dev`; it opens at `http://localhost:5173` and proxies API calls to the backend on port `3012`. Build it for deployment with `npm run build` from the `web/` directory.

The health check is available at `GET /health`.

## API

- `GET /api/v1/merchants`
- `GET /api/v1/merchants/:id/products`
- `POST /api/v1/orders`
- `POST /api/v1/payments/orders/:orderId`
- `POST /api/v1/payments/paynow/result`
- `GET /api/v1/admin/dashboard` (admin role)
- `GET /api/v1/admin/orders` (admin role)
- `PATCH /api/v1/admin/orders/:id/status` (admin role)
- `POST /api/v1/delivery/orders/:orderId/assign` (admin role)
- `PATCH /api/v1/delivery/orders/:orderId/status` (driver or admin role)
- `GET /api/v1/whatsapp/webhook`
- `POST /api/v1/whatsapp/webhook`

## Client apps

The `web/` client is the first shared UI surface for customer ordering, admin operations, and WhatsApp integration visibility. It uses React, Tailwind CSS, Framer Motion, and Lucide icons. The same REST API is ready to be consumed by an Expo/React Native mobile app, which should share the customer ordering and delivery contracts rather than duplicate business logic.

Order creation expects `user_id`, `merchant_id`, `items` with `product_id` and `quantity`, and an optional `location` with `latitude` and `longitude`. Prices are read from the database and totals are calculated on the server.

Admin and driver route placeholders currently use the `x-user-role` header. Replace this with proper authentication and authorization before exposing those routes publicly.

## Project structure

```text
prisma/                 PostgreSQL schema and migrations
src/config/             Environment and Prisma client setup
src/controllers/        HTTP request handlers
src/middleware/         Error handling and role checks
src/routes/              REST route definitions
src/services/           Order, payment, and WhatsApp business logic
```

## Payments

Set the Paynow integration credentials in `.env`. Web checkout is used for card payments, while mobile checkout supports EcoCash and OneMoney. Paynow credentials and a verified result URL are required for live transactions; no card details are stored by Mr Chow.
