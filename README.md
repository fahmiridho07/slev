# Slev

**A calm, manual finance companion — local-first, permission-light.**

Log expenses, income, and transfers in seconds. See what’s safe to spend today, review your activity, and keep everything on your device. No bank sync, no notification scraping, no spreadsheet pressure.

<p align="center">
  <img src="assets/brand/slev-mark-transparent.png" alt="Slev" width="72" />
</p>

---

## What Slev is

| | |
|---|---|
| **For** | Quick money memory — capture now, understand later |
| **Storage** | Everything stays on your phone (AsyncStorage) |
| **Style** | Calm copy, low density, no scores or guilt |

## What Slev is not

Not an accounting app, bank connector, or auto-import tool. You type what matters; Slev helps you notice patterns without asking for sensitive permissions.

---

## Screens at a glance

### Home — capture & safe to spend

- **Safe to spend today** — set your balance once; Slev subtracts logged activity and recurring bills, then spreads what’s left across the rest of the month.
- **Quick capture** — expense, income, or transfer; amount is the only required field.
- Shortcuts, repeat chips, and undo for the last save.

### Money — activity & trends

- Timeline grouped by *Today*, *Yesterday*, *This week*, *Earlier* — search, edit, swipe to delete.
- Monthly **cashflow**, **spending by category**, and **income by source**.
- Optional spending trends when enough history exists.

### Settings

| Tab | Purpose |
|-----|---------|
| **Accounts** | Banks, wallets, cash — income hub & pocket labels |
| **Categories** | Expense categories for capture |
| **Bills** | Recurring monthly bills (feeds safe-to-spend reserve) |
| **Appearance** | Theme, language (EN / ID), reduced motion |
| **Data** | Export / import JSON backup, health checks, clear memory |

---

## Tech stack

- **Expo 54** + **React Native** + **TypeScript**
- Local persistence via `@react-native-async-storage/async-storage`
- English & Bahasa Indonesia UI

---

## Get started

**Requirements:** Node.js 18+, npm, and [Expo tooling](https://docs.expo.dev/get-started/installation/) for device builds.

```bash
git clone https://github.com/fahmiridho07/slev.git
cd slev
npm install
npm run start
```

| Command | What it does |
|---------|----------------|
| `npm run start` | Expo dev server |
| `npm run start:clear` | Expo dev server with cache cleared |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run on web |
| `npm run typecheck` | TypeScript typecheck |
| `npm run lint` | ESLint |
| `npm run test:finance` | Finance engine unit tests |
| `npm run check` | Typecheck + lint + finance tests |

---

## Privacy

- No cloud account required for core use.
- No bank credentials or notification listener.
- Backup is a JSON file you export and keep yourself.

---

## Product principles

Slev should stay **calm**, **local-first**, **permission-light**, and **useful without perfect tracking**. Before adding passive capture or sync, it should pass:

> Does this reduce cognitive load without turning Slev into a finance system to maintain?

---

## Documentation

Deeper product and storage notes: [`docs/project-specification.md`](docs/project-specification.md)

---

## License

Private project — see repository owner for usage terms.