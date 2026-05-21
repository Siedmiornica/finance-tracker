# Finance Tracker

Aplikacja do śledzenia transakcji kupna/sprzedaży z dashboardem statystyk i heatmapą miesięcznych zysków.

## Funkcje

- 📊 Dashboard ze statystykami (średni zysk %, najlepsza/najgorsza transakcja, łączny zysk)
- 🗓️ Heatmapa miesięcznych wyników
- 💰 Saldo portfela
- 🔐 Panel admina z autoryzacją
- 📱 Responsywny interfejs (Tailwind CSS)
- 💾 Lokalne przechowywanie danych (localStorage)

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router 6
- Tailwind CSS

## Uruchomienie

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Struktura

```
src/
├── components/   # Komponenty UI (Dashboard, Heatmap, TransactionForm/List)
├── hooks/        # Custom hooks (useAuth, useTransactions, useAbout)
├── lib/          # Typy, obliczenia, storage
└── pages/        # Strony (Public, Login, Admin)
```

## Licencja

MIT
