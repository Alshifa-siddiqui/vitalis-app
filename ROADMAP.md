# Vitalis — Roadmap

Where Vitalis is headed. Kept intentionally focused — shipping a solid v1 beats a
sprawling backlog.

## Now — v1.0 (launch)
- ✅ Core habit tracking, streaks, heatmap, AI coach, reminders, dark mode
- ✅ Auth + secure cloud sync (RLS), data export, accessibility
- ✅ Crash monitoring, CI, legal docs, store listing
- ⏳ Google Play submission (account + production build + review)

## Next — v1.1 (post-launch polish)
- Offline banner + network-aware sync status (queued writes when offline)
- Push notifications for streak milestones (remote, opt-in)
- Localization scaffolding (i18n) starting with English + one more language
- Widen automated tests toward key UI flows (component/E2E)

## Later — v1.2+
- Weekly/monthly progress summaries and shareable streak cards
- Apple App Store release (needs Apple Developer account)
- Optional habit categories/tags and reordering
- Insight caching to further reduce AI cost

## Considered but deliberately deferred
These are tracked so the decision is explicit, not forgotten:
- **Payments/subscriptions** — app is free; revisit only with a paid feature.
- **Custom admin dashboard** — Supabase dashboard is sufficient for one maintainer.
- **Microservices / self-managed infra** — managed Supabase + EAS covers scaling.

## Business / growth (lightweight)
- Brand + green design system: ✅ established
- Store listing + screenshots: ✅ drafted (`STORE_LISTING.md`)
- Feedback loop: in-app "Report a bug" / "Contact support" → email
- Early growth: share with peers, gather reviews, iterate on retention

## How work is tracked
Small solo project: this roadmap + `CHANGELOG.md` + git history are the source of
truth. GitHub Issues can be enabled for bugs/feature requests as usage grows.
