# Slev

Slev is a calm manual finance companion.

It is not an accounting app, bank-sync product, or notification-parsing pipeline. The current loop is intentionally manual: save money moments quickly, plan the month lightly, and review patterns without handing the app sensitive phone permissions.

## Current Build Includes

- Expo + React Native + TypeScript app.
- Local-only finance memory stored with AsyncStorage.
- One-time migration from confirmed legacy transactions into spending memory.
- Capture-first Home screen with expense, income, and transfer entry; amount-only required input.
- Expense and income entries can be tied to a local account or wallet for pocket-level analysis.
- Brand-style account badges for common banks and wallets without bundling trademarked logo files.
- Manual shortcuts for recurring entries and a last-saved undo/edit flow.
- Practical default context tags plus custom expense categories.
- Memory timeline with recall grouping, search, compact edit, and delete actions.
- Money plan area with monthly allocation, soft limits, fixed/flexible category modes, monthly plan, savings goals, account balance snapshots, and monthly closing.
- Low-density Analysis screen with rule-based recap, breakdown, cashflow, account distribution, account reconciliation, transfer flow, burn-rate, and trend views.
- Optional weekly recap responses: Keep, Less often, Not sure.
- Privacy-first Settings with local category CRUD, no notification listener, no bank access, and no sync required.

## Product Direction

The sticky behavior is:

> I can manually understand and adjust my money without maintaining a heavy finance system.

Slev should stay:

- Calm.
- Local-first.
- Permission-light.
- Low-friction.
- Useful without complete tracking or passive capture.
- Free of shame, guilt, scoring, or productivity pressure.

## Run Locally

Install dependencies first:

```bash
npm install
```

Start the app:

```bash
npm run start
```

Run on Android:

```bash
npm run android
```

Run validation:

```bash
npm run typecheck
npm run test:finance
```

If `npm` is not available in the shell but dependencies are installed, the same checks can be run with:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\tsc.cmd -p tsconfig.test.json
node .tmp-tests\tests\financeEngine.test.js
```

## Manual-Only Direction

The native notification listener module has been removed from the build and from the repository. Slev should stay manual-first unless a future feature can prove it reduces cognitive load without asking for sensitive phone access.

Before reintroducing any passive capture or sync feature, it should pass this product test:

> Does this reduce cognitive load without making Slev feel like a finance system to maintain?

## Documentation

Start here:

```txt
docs/project-specification.md
```
