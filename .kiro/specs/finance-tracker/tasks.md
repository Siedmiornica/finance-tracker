# Implementation Plan: Finance Tracker

## Overview

Implementacja frontendowej aplikacji Finance Tracker jako SPA (React 18 + Vite + TypeScript + Tailwind CSS). Aplikacja przechowuje dane w localStorage, obsługuje jednego administratora i widok publiczny. Implementacja przebiega od warstwy danych, przez logikę biznesową (hooki), po strony i komponenty UI.

## Tasks

- [x] 1. Set up project structure and core configuration
  - [x] 1.1 Initialize Vite project with React + TypeScript and install dependencies
    - Initialize project with `npm create vite@latest` using React + TypeScript template
    - Install dependencies: `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`
    - Configure Tailwind CSS (tailwind.config.js, postcss.config.js, import in main CSS)
    - Set up directory structure: `src/components/`, `src/hooks/`, `src/pages/`, `src/lib/`
    - _Requirements: 7.1, 7.7_

  - [x] 1.2 Create type definitions and storage helper
    - Create `src/lib/types.ts` with all interfaces: `Transaction`, `AboutData`, `AppState`, `DashboardStats`, `HeatmapMonth`, `TransactionInput`, `ValidationResult`
    - Create `src/lib/storage.ts` with prefixed localStorage helper (`ft_` prefix) implementing `get<T>`, `set`, `remove` methods with JSON parse/stringify and error handling for corrupted data
    - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.7_

  - [x] 1.3 Create calculation functions
    - Create `src/lib/calculations.ts` with:
      - `calcProfit(purchase, sale)` → returns `{ percent, amount }` rounded to 2 decimal places
      - `calcDaysHeld(purchaseDate, saleDate)` → returns calendar day difference
      - `calcStats(transactions)` → returns dashboard statistics (total count, avg profit %, avg days, best/worst transaction, total profit amount, total profit %)
      - `calcHeatmapData(transactions)` → returns monthly grouped profit data
    - _Requirements: 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 9.1_

- [x] 2. Checkpoint - Ensure data layer compiles correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement authentication hook and login page
  - [x] 3.1 Implement useAuth hook
    - Create `src/hooks/useAuth.ts` with:
      - `isAdmin` state derived from session flag in localStorage
      - `login(user, pass)` — hash credentials with Web Crypto API (SHA-256), compare with stored hashes, set session flag
      - `logout()` — remove session flag, reset state
      - On mount: check session flag and restore auth state
    - Store credentials as `ft_credentials` (hashed), session as `ft_session`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 3.2 Implement LoginPage and AuthGuard
    - Create `src/pages/LoginPage.tsx` with login form (username + password fields), generic error message on failure
    - Create `src/components/AuthGuard.tsx` that redirects unauthenticated users to login page
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Implement transactions hook with CRUD, wallet, and categories
  - [x] 4.1 Implement useTransactions hook - core CRUD
    - Create `src/hooks/useTransactions.ts` with:
      - Load transactions from `ft_transactions` on mount
      - `add(input)` — validate fields, generate unique ID and auto-increment number, save to localStorage
      - `update(id, input)` — validate, update record, recalculate profit/days
      - `remove(id)` — show confirmation, delete from localStorage
    - Validation: title (max 100), category (max 50), purchasePrice (0.01–999999999.99), required fields check
    - When status = "Sprzedano": require salePrice and saleDate (not before purchaseDate)
    - Auto-calculate profitPercent, profitAmount, daysHeld on save
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

  - [x] 4.2 Implement wallet balance logic in useTransactions
    - Track `walletBalance` in state, persisted as `ft_wallet`
    - On add/update with status "Sprzedano": add profit amount to wallet
    - On remove of "Sprzedano" transaction: subtract profit from wallet
    - On edit of "Sprzedano" transaction: recalculate (subtract old profit, add new profit)
    - Display with 2 decimal places, visual indicator for negative balance
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Implement categories autocomplete logic in useTransactions
    - Track `categories` list in state, persisted as `ft_categories`
    - On save with new category: add to list (case-insensitive uniqueness, max 100 entries)
    - Provide filter function: return max 5 suggestions matching input (case-insensitive contains)
    - Allow empty category (optional field)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 4.4 Write unit tests for calculation functions
    - Test `calcProfit` with various purchase/sale prices including edge cases
    - Test `calcDaysHeld` with same-day, multi-day, cross-month scenarios
    - Test `calcStats` with empty array, single transaction, multiple transactions
    - Test `calcHeatmapData` grouping logic
    - _Requirements: 2.5, 2.6, 2.7, 4.2, 4.3, 4.6, 4.7_

- [x] 5. Checkpoint - Ensure hooks and logic compile correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement useAbout hook
  - [x] 6.1 Implement useAbout hook
    - Create `src/hooks/useAbout.ts` with:
      - Load about data from `ft_about` on mount
      - `save(data)` — validate description (max 2000 chars), validate social links (max 10, valid URL format), save to localStorage
      - Return validation errors for invalid URLs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Implement UI components
  - [x] 7.1 Implement TransactionForm component
    - Create `src/components/TransactionForm.tsx` with:
      - Fields: title, description (optional), category (with autocomplete dropdown), status select, purchasePrice, purchaseDate
      - Conditional fields when status = "Sprzedano": salePrice, saleDate
      - Inline validation messages per field
      - Category autocomplete: show max 5 suggestions on input >= 1 char
      - Support both create and edit modes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.10, 2.11, 8.1, 8.3_

  - [x] 7.2 Implement TransactionList component
    - Create `src/components/TransactionList.tsx` with:
      - Display transactions in a table/list format
      - Admin mode: show edit/delete buttons, all transactions
      - Public mode: show only completed transactions with title, category, profitPercent, profitAmount, daysHeld
      - Delete confirmation dialog
    - _Requirements: 2.9, 5.3, 5.6_

  - [x] 7.3 Implement Dashboard component
    - Create `src/components/Dashboard.tsx` with:
      - Display stats: total transactions, avg profit %, avg days, best/worst transaction, total profit amount, total profit %
      - Show wallet balance with visual indicator for negative values
      - Empty state message when no completed transactions
      - For tied best/worst: show transaction with most recent sale date
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9, 4.10, 3.4, 3.5_

  - [x] 7.4 Implement Heatmap component
    - Create `src/components/Heatmap.tsx` with:
      - Monthly grid from first to last completed transaction month
      - Color scale: green (profit > 0), red (loss < 0), neutral (zero)
      - Intensity proportional to absolute value relative to max absolute value
      - Tooltip on hover: exact profit amount (currency format) + transaction count
      - Empty state message when no data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 7.5 Implement AboutSection component
    - Create `src/components/AboutSection.tsx` with:
      - Display mode: show description text + clickable social links (open in new tab)
      - Edit mode (admin only): textarea for description, dynamic list of social link inputs
      - Save button with success confirmation
      - Empty state with edit prompt for admin
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Checkpoint - Ensure all components compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement pages and routing
  - [x] 9.1 Implement PublicPage
    - Create `src/pages/PublicPage.tsx` with:
      - Dashboard stats (public subset: total transactions, avg profit %, avg days, total profit amount)
      - TransactionList in public mode (completed only)
      - Heatmap component
      - AboutSection in display mode
      - Empty state handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 9.2 Implement AdminPage
    - Create `src/pages/AdminPage.tsx` with:
      - Full Dashboard with all stats
      - Wallet balance display
      - TransactionForm for add/edit
      - TransactionList in admin mode
      - Heatmap component
      - AboutSection in edit mode
      - Logout button
    - _Requirements: 1.3, 3.4, 4.1–4.10, 6.3_

  - [x] 9.3 Set up App routing and context providers
    - Create `src/App.tsx` with React Router v6:
      - `/` → PublicPage (default)
      - `/login` → LoginPage
      - `/admin` → AuthGuard wrapping AdminPage
    - Wrap app with necessary context providers
    - _Requirements: 1.5, 5.1_

  - [x] 9.4 Configure main entry point and initial admin credentials
    - Update `src/main.tsx` to render App
    - On first load: if no credentials exist, initialize default admin credentials (hashed) in localStorage
    - Handle corrupted localStorage: reset to default state with alert
    - _Requirements: 1.4, 7.4, 7.5, 7.6_

- [x] 10. Final checkpoint - Ensure application builds and runs
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No property-based tests — design explicitly states manual testing is sufficient for initial version
- Unit tests for calculation functions are optional but recommended for correctness
- The storage helper abstracts localStorage access to facilitate future backend migration
- All monetary values use 2 decimal places; percentages rounded to 2 decimal places

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1", "6.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "7.1", "7.5"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["9.1", "9.2"] },
    { "id": 8, "tasks": ["9.3", "9.4"] }
  ]
}
```
