# Vitalis — Architecture & Operations

How Vitalis is built, how it scales, how it's operated, and — just as important —
what was **deliberately not built** and why. Written so a reviewer can see the
engineering reasoning, not just the features.

---

## System overview

```
 React Native app (Expo, TypeScript)
        │
        │  HTTPS / JWT
        ▼
 Supabase
   ├── Auth (email + Google OAuth, JWT sessions)
   ├── Postgres (habits, profiles, ai_usage) + Row-Level Security
   └── Edge Function: ai-insight (Deno)
                          │
                          ▼
                 Anthropic Claude API  (key stays server-side)

 Client state:  Zustand + AsyncStorage (offline-first cache)
 Monitoring:    Sentry (crashes, errors, event breadcrumbs)
 CI/CD:         GitHub Actions (lint + typecheck + tests) → EAS Build/Submit
```

**Design principles:** thin client, secure-by-default (RLS everywhere), secrets
never on-device, offline-first, and lean — no infrastructure we don't yet need.

---

## Data model

| Table | Purpose | Protection |
|-------|---------|-----------|
| `auth.users` | Accounts (managed by Supabase) | Supabase Auth |
| `habits` | Habits + check-in history (`jsonb`) | RLS: `auth.uid() = user_id`, indexed on `user_id` |
| `profiles` | Name, health profile, goals, preferences | RLS: `auth.uid() = id` |
| `ai_usage` | Per-user/day AI request counter | RLS enabled, no client policies — service-role only |

Streaks and counts are **derived** from `history` on the client (`src/streaks.ts`),
never stored — so there's no denormalized state to corrupt or migrate.

---

## Scalability

The app is deliberately built on **managed, horizontally-scalable infrastructure**
so a solo developer doesn't operate servers:

- **Stateless Edge Functions** — the AI function holds no state; Supabase scales
  instances automatically.
- **Postgres with indexes** — every per-user query hits `habits_user_idx`; the
  data volume per user is tiny (habits + date strings).
- **Client-side derivation** — streaks/scores are computed on-device, keeping
  server load near-zero regardless of user count.
- **Payload bounds** — the AI function caps habits/goals per request so prompt
  size (and cost) can't blow up.

This comfortably covers a portfolio app's realistic range (1 → tens of thousands
of users). **Not built (intentionally):** load balancers, CDNs for API, queues,
microservices — Supabase already provides equivalent managed scaling, so adding
them now would be cost and complexity with no benefit.

## Rate limiting & cost control

- **AI daily quota** — `ai_usage` caps insights per user per day (fails open if the
  table is unreachable, so a DB hiccup never fully breaks the feature).
- **Model tiering** — a "fast" flag routes to a cheaper model (Haiku) vs the
  default (Opus), letting users trade quality for cost.
- The only variable cost is the Anthropic API; the quota + tiering bound it.

## Monitoring, logging & analytics

- **Sentry** captures crashes and handled errors (`src/log.ts`, `ErrorBoundary`).
- **Event breadcrumbs** (`log.event`) record product events (sign-in, check-in,
  AI request, export) — this doubles as **privacy-respecting analytics** without
  adding a third-party ad/tracking SDK, consistent with the privacy policy.
- Enabled via `EXPO_PUBLIC_SENTRY_DSN`; silent in local dev.

## Disaster recovery

- **Database** — Supabase takes automated daily backups (and Point-in-Time
  Recovery on paid tiers). Restore = Supabase dashboard → Database → Backups.
- **Schema** — fully reproducible from `supabase/schema.sql` (idempotent:
  `create ... if not exists`, `drop policy if exists`).
- **Code** — every change is in git; roll back with `git revert` / redeploy a
  previous EAS build.
- **User data** — users can self-export a full JSON snapshot in-app at any time.

## Admin

The **Supabase dashboard is the admin surface** — user management, table editor,
SQL, logs, and auth settings are all there. Building a custom admin dashboard for
a single-maintainer app would duplicate that for no gain, so it's intentionally
not built.

## Payments (Vitalis Plus)

Premium is **scaffolded and gated**, with billing intentionally deferred:

- A single entitlement flag `plus` (in the store) drives all gating via
  `src/premium.ts` (`canAddHabit`, `aiInsightsLeft`). Free tier = 5 habits + 3 AI
  insights/month; Plus = unlimited.
- The paywall (`src/screens/Paywall.tsx`) is a store-triggered modal reachable
  from anywhere via `openPaywall()`.
- **Billing is simulated today** (the upgrade button flips `plus`). To go live,
  drop in **RevenueCat** (`react-native-purchases`): configure products in Play
  Console, then set `plus` from the RevenueCat entitlement on launch/purchase.
  Nothing else in the app changes — gating already reads a single flag.

This keeps the app fully premium-ready without shipping billing before the store
account and pricing are finalized.

## Versioning

- App version in `app.json` (`expo.version`) + `src/version.ts`, surfaced in the
  Help screen and bug reports. Android `versionCode` auto-increments on EAS build.
- Database changes are additive and idempotent in `supabase/schema.sql`.
- Notable changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## Testing strategy

- **Unit tests** (Jest) for the logic that matters most: streak/badge computation,
  the store's mutations, data export, and the logging layer.
- **Typecheck + lint** gate every change in CI.
- Pure logic is deliberately separated from UI (`streaks.ts`, `store.ts`,
  `export.ts`, `log.ts`) so it's testable without rendering. End-to-end (Detox)
  is a post-launch addition, not a v1 requirement.
