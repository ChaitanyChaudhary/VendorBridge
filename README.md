# VendorBridge

VendorBridge is a Next.js procurement portal for RFQs, quotations, approvals, and purchase orders.

## What You Need First

- Install [Node.js](https://nodejs.org/) version 18 or newer.
- `npm` is included with Node.js, so no separate package manager install is required.
- A code editor such as VS Code is recommended.

## Install

After cloning the repository, install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open:

```bash
http://localhost:3000
```

## Other Commands

```bash
npm run build
npm run start
npm run lint
```

## Project Notes

- The app uses the Next.js App Router.
- UI state is managed through `context/PortalContext.tsx`.
- Currency formatting lives in `lib/currency.ts`.
