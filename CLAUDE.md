# Slev (financial_tracker) — Claude instructions

Slev is a calm, local-first, permission-light manual finance app (Expo 54, RN 0.81, React 19, TS).
`docs/project-specification.md` is authoritative for product scope, data model, copy tone, and
privacy — read the relevant section before implementing anything.

A fuller workspace manual lives one level up at `../CLAUDE.md` (multi-project folder on this
machine). If it is not present (fresh clone), the rules below stand alone.

## Definition of done

```bash
npm run check   # typecheck + eslint + test:finance — must pass, show the output
```

## Hard rules

1. **i18n, both locales.** Every user-visible string: key in `src/i18n/types.ts`, copy in BOTH
   `en.ts` and `id.ts`. No hardcoded literals. Typecheck failing on a key = you skipped a locale.
2. **Calm, observational copy** (spec §7). Good: "This would dip into the bills reserve." /
   "Coffee is more visible this week." Forbidden: "Budget exceeded", "You overspent", any shame,
   scoring, streaks, or commands.
3. **Balances are always derived** from opening balance + ledger. Never persist a computed number.
   New persisted data needs all four: key in `src/services/storageKeys.ts`, handling in
   `storageSchema.ts`, an include/exclude decision for `EXPORTABLE_STORAGE_KEYS` (backup), and a
   migration for existing users.
4. **Tests are plain Node `assert`** in `tests/`, compiled via `tsconfig.test.json`. No jest/vitest.
   A NEW test file must also be appended to the `test:finance` chain in `package.json`, or it
   never runs.
5. **Colors from theme tokens only** (`src/theme/palettes.ts`, via ThemeProvider). A new token goes
   into BOTH `lightColors` and `darkColors` plus `types.ts`. Never inline hex in components.
6. **Logic lives in `src/lib` / `src/services`** as pure functions; components render, they don't
   compute.
7. **No network, cloud sync, analytics, notification access, or new device permissions.** Ever,
   without asking first — this is the product's identity (spec §8).

## Git

Commit only when asked. Conventional style with scope, matching `git log`:
`feat(capture): …`, `fix(analysis): …`, `polish(money-overview): …`, `refactor(…): …`,
`chore(deps): …`. Stage files by name — the tree often carries unrelated WIP. Never push
without an explicit request. `.claude/`, `terminals/`, `.tmp-tests/` are never committed.

## Stop and ask when

- The feature is not requested verbatim and not in spec §10.
- Anything touches storage schema/keys without a migration, or could lose a user's ledger.
- A new dependency seems needed.
- A requirement conflicts with the calm/local-first/permission-light principles.
