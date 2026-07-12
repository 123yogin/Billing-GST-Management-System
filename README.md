# Billing & GST Management System — Frontend

React frontend for a GST billing system aimed at dealer/farmer trading
businesses: manage dealers, deals, and items, then generate and print
GST-compliant bills with reporting. Pairs with
[Billing-GST-Management-System-backend](https://github.com/123yogin/Billing-GST-Management-System-backend).

## Features

- **Dashboard** with key figures
- **Dealer management** — add, edit, and list dealers
- **Deals** — create deals, list them, and view deal details
- **Items** catalogue
- **Billing** — create dealer bills and farmer bills, with printable invoice views
- **Reports**
- Reusable UI: searchable dropdowns, modals, skeleton loaders

## Tech stack

- React 18 + Vite
- React Router DOM 6
- Axios

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173 (point it at the backend API)
npm run build
```

## Project structure

```
src/
├─ pages/       Dashboard, Dealers/AddDealer/EditDealer, CreateDeal/DealsList/DealDetails,
│               Items, CreateDealerBill/CreateFarmerBill/BillsList, Print*Bill, Reports
├─ components/  Layout, Modal, SearchableDropdown, BillItemRow, Skeleton
└─ services/    api.js (Axios client)
```
