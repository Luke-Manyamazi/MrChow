# Mr Chow API

Express and Prisma backend for Mr Chow's Masvingo food and grocery delivery service.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` plus the WhatsApp credentials.
2. Install dependencies with `npm install`.
3. Generate the Prisma client with `npm run prisma:generate`.
4. Apply the schema to a development database with `npx prisma migrate dev --name init`.
5. Start the API with `npm run dev`.

The health check is available at `GET /health`.

## API

- `GET /api/v1/merchants`
- `GET /api/v1/merchants/:id/products`
- `POST /api/v1/orders`
- `GET /api/v1/whatsapp/webhook`
- `POST /api/v1/whatsapp/webhook`

Order creation expects `user_id`, `merchant_id`, `items` with `product_id` and `quantity`, and an optional `location` with `latitude` and `longitude`. Prices are read from the database and totals are calculated on the server.
