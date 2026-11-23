# ShopHub Shopkeeper Desktop (Electron)

Desktop app for shopkeepers — same access as the web shop panel (POS, products, inventory, orders, expenses, employees, reports, rent).

It loads your running Next.js web app inside an Electron window and keeps login saved between restarts.

## Prerequisites

1. Backend API running (`http://localhost:5000`)
2. Web app running (`http://localhost:3000`)

## Setup

```bash
cd desktop
npm install
```

From repo root (after `install:all` once):

```bash
npm run install:desktop
```

## Run

Terminal 1 — API:

```bash
npm run dev:api
```

Terminal 2 — Web:

```bash
npm run dev:web
```

Terminal 3 — Desktop:

```bash
npm run desktop
```

Or from `desktop/`:

```bash
npm start
```

## Config

Edit `desktop/config.js` or set env:

```bash
set SHOPHUB_APP_URL=http://localhost:3000
npm start
```

## Build Windows installer

```bash
cd desktop
npm run dist
```

Output: `desktop/dist/`

## Login

Use any shopkeeper account, e.g. catalog seed:

- Email: `shop01@shophub.com` … `shop50@shophub.com`
- Password: `password123`

Menu bar shortcuts: Dashboard, POS, Products, Orders, Reports, Rent.
