# Slev

Slev is a calm spending memory.

It is not an accounting app, budgeting dashboard, finance optimizer, or notification-parsing pipeline. The current pivot focuses on a lighter loop: save a spending moment in seconds, then let Slev surface what has been repeating, standing out, or quietly adding up.

## Current Build Includes

- Expo + React Native + TypeScript app.
- Local-only spending moments stored with AsyncStorage.
- One-time migration from confirmed legacy transactions into spending memory.
- Capture-first Home screen with amount-only required input.
- Repeat chips for common spends and a last-saved undo/edit flow.
- Practical context tags: Meal, Coffee, Transport, Groceries, Bills, Treat, Home, Other.
- Memory timeline with recall grouping, search, compact edit, and delete actions.
- Low-density Patterns screen with rule-based change and repeat awareness.
- Optional weekly recap responses: Keep, Less often, Not sure.
- Privacy-first Settings with no notification access or sync required in the MVP.

## Product Direction

The sticky behavior is:

> I can quickly remember where my money has been going without maintaining a finance system.

Slev should stay:

- Calm.
- Local-first.
- Permission-light.
- Low-friction.
- Useful without complete tracking.
- Free of shame, guilt, streaks, or productivity pressure.

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
npm run parser:smoke
```

If `npm` is not available in the shell but dependencies are installed, the same checks can be run with:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
node scripts\parser-smoke-test.mjs
```

## Legacy Systems

The repository still contains the old notification listener, parser, and Google Sheets sync code so the project remains buildable while the pivot is evaluated. These systems are no longer part of the visible MVP experience.

Before reintroducing any passive capture or sync feature, it should pass this product test:

> Does this reduce cognitive load without making Slev feel like a finance system to maintain?

## Documentation

Start here:

```txt
docs/project-specification.md
```
