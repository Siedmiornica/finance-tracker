# Implementation Plan: Financial Tracker

## Overview

Implement a minimal personal finance tracker using Next.js 14 (App Router), SQLite via better-sqlite3, Tailwind CSS, and simple session cookie auth. The implementation is condensed into lean tasks: database/types → core logic → auth → API routes → UI pages.

## Tasks

- [x] 1. Project setup, database, and types
  - [x] 1.1 Initialize project with database schema, connection module, and core types
    - Create `src/lib/db.ts` with better-sqlite3 connection
    - Create migration/init script that creates `items`, `folders`, and `owner` tables per the design schema
    - Seed the owner account with a hashed password (bcrypt)
    - Create `src/lib/types.ts` with Item, ItemWithProfit, Folder, Summary, ValidationResult, CreateItemInput, SellItemInput interfaces
    - _Requirements: 7.4, 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 2. Core logic modules (profit, validation, status, summary)
  - [x] 2.1 Implement all core logic modules
    - Create `src/lib/profit.ts` with `calculateProfit(purchasePrice, salePrice)` — prices in integer cents, percentage rounded to 2 decimal places, null percentage when purchasePrice is 0
    - Create `src/lib/validation.ts` with `validateCreateItem`, `validateSellItem`, `validateFolderName` — description (1-500 chars), purchasePrice (0.01-9999999.99), purchaseDate (not future), salePrice (≥0.01), saleDate (required with salePrice); return structured `ValidationResult` with field-level errors
    - Create `src/lib/status.ts` with `deriveStatus(item)` — "sold" if both salePrice and saleDate non-null, otherwise "active"
    - Create `src/lib/summary.ts` with `calculateSummary(items)` — sum of profits for sold items, sum of purchase prices for active items
    - _Requirements: 2.3, 2.4, 2.5, 1.2, 1.3, 1.4, 2.2, 2.6, 4.1, 4.6, 8.5, 3.1, 3.2, 3.3, 5.1, 5.2, 5.4, 5.5_

- [x] 3. Authentication (auth module + middleware)
  - [x] 3.1 Implement auth module and middleware
    - Create `src/lib/auth.ts` with session cookie sign/verify functions — HTTP-only signed cookie with 30-minute expiry, `login(username, password)`, `logout()`, `getSession(cookies)` using bcrypt
    - Create `src/middleware.ts` to protect `/dashboard` routes and write API endpoints — reject unauthenticated requests with 401 "Access denied" (never reveal account existence)
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7_

- [x] 4. All API routes (auth, items, folders, summary)
  - [x] 4.1 Implement all API route handlers
    - Create `src/app/api/auth/login/route.ts` — POST, validate credentials, set session cookie
    - Create `src/app/api/auth/logout/route.ts` — POST, clear session cookie
    - Create `src/app/api/items/route.ts` — GET (public, list all items with profit), POST (auth, create item)
    - Create `src/app/api/items/[id]/route.ts` — PUT (auth, update item), DELETE (auth, delete item)
    - Create `src/app/api/folders/route.ts` — GET (public, list folders), POST (auth, create folder)
    - Create `src/app/api/folders/[id]/route.ts` — DELETE (auth, delete folder, ON DELETE SET NULL)
    - Create `src/app/api/summary/route.ts` — GET (public, return summary stats)
    - Use validation module for all inputs; return structured errors; recalculate profit on update; handle status transitions
    - _Requirements: 7.1, 7.5, 7.6, 1.1, 1.5, 2.1, 8.1, 8.2, 8.3, 8.4, 4.1, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Layout, portfolio page, and login page
  - [x] 5.1 Implement shared layout, public portfolio, and login
    - Create `src/app/layout.tsx` with Tailwind setup and basic nav
    - Create shared components: `ItemCard`, `SummaryPanel`, `FolderList`, `ValidationErrors`
    - Create `src/app/page.tsx` — server component fetching items, folders, summary; display all items with status, profit, folder grouping; hide edit/add/delete controls
    - Create `src/app/login/page.tsx` — client component with login form; display error on invalid credentials; redirect to dashboard on success
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.5_

- [x] 6. Dashboard pages with API wiring
  - [x] 6.1 Implement all dashboard pages and wire UI to API
    - Create `src/app/dashboard/page.tsx` — summary overview for owner
    - Create `src/app/dashboard/items/page.tsx` — item list with edit/delete actions
    - Create `src/app/dashboard/items/new/page.tsx` — add item form with validation errors
    - Create `src/app/dashboard/items/[id]/edit/page.tsx` — edit item form (including sell fields)
    - Create `src/app/dashboard/folders/page.tsx` — folder management (create/delete)
    - Ensure all forms submit to correct API endpoints
    - Add folder assignment dropdown to item forms
    - Verify session expiry redirects to login; verify public portfolio reflects latest data
    - Preserve form state on validation errors; show confirmation on success
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.1, 2.2, 2.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 6.4, 7.7, 8.1, 8.2, 8.5_

## Notes

- Prices are stored as integer cents to avoid floating-point issues
- All validation happens both client-side (UX) and server-side (security)
- The single owner account is seeded during database initialization
- No property-based tests or integration tests included — focus on lean implementation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["6.1"] }
  ]
}
```
