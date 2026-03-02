# One Stop Logistics Solutions – Admin Dashboard

Frontend-only admin dashboard for **One Stop Logistics Solutions** (delivery/booking). Brand colors: blue and red. No login or auth; all data is mock/static.

## Tech stack

- **Angular** 16 with Router and lazy-loaded feature modules
- **Angular Material** (mat-table, mat-form-field, mat-datepicker, mat-drawer, mat-tab-group, mat-chip, mat-icon, mat-button, mat-progress-spinner, etc.)
- **SCSS** per-component styling with shared design tokens

## Run locally

```bash
cd admin-dashboard
npm install
npm start
```

Open http://localhost:4200

## Build

```bash
npm run build
```

## Sections

| Route         | Description |
|---------------|-------------|
| `/dashboard`  | Overview: summary cards, bookings chart, provider metrics, status overview, bookings table with tabs |
| `/bookings`   | Create booking (pickup/dropoffs form) and list/search with filters and Export CSV |
| `/clients`    | User list with search; row click opens detail drawer |
| `/providers`  | Tricycle and Rider tabs with tables and actions |
| `/accreditation` | Placeholder / coming soon |
| `/history`    | Records list with filters; row click opens drawer with Details / Messages / Track tabs |
| `/settings`   | Placeholder General and Notifications sections |

## Design tokens (SCSS)

- Background: `#f5f7fa`
- Card: white, subtle shadow, rounded
- Title: `#1f2937`, subtitle: `#6b7280`
- Primary/accent: `#9c1f22`
- Borders: `#d1d5db`
- Status colors: Pending `#fbbf24`, Active `#10b981`, Completed `#059669`, Cancelled `#ef4444`, Returned `#dc2626`
