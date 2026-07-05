# Changelog

All notable changes to Vitalis are documented here. Versions follow
[Semantic Versioning](https://semver.org): MAJOR.MINOR.PATCH.

## [Unreleased]
- Crash & error monitoring (Sentry) with privacy-respecting event breadcrumbs.
- In-app Help & FAQ + "Report a bug" / "Contact support".
- Logging/analytics layer (`src/log.ts`).
- Architecture, changelog, and roadmap documentation.
- Tests for data export and the logging layer.

## [1.0.0] — 2026-07-02
First complete release candidate.

### Added
- Habit tracking: create/edit/archive/search, daily/weekly/monthly frequencies.
- Streaks, badges, GitHub-style check-in heatmap, per-habit detail screen.
- Home dashboard with wellness score ring and daily tip.
- Health Hub with 7-day Wellness Score and AI wellness coach (Claude, server-side).
- AI insight history + optional cheaper "fast" model; per-user daily quota.
- Onboarding with goal selection that seeds starter habits.
- Auth: email/password (sign-up, sign-in, forgot/reset, change email/password),
  Google OAuth, and a local demo mode.
- Cloud sync of habits and settings via Supabase with Row-Level Security.
- Local daily reminders (expo-notifications).
- Dark mode, haptics, pull-to-refresh, accessibility labels.
- Data export (JSON) and in-app data deletion.
- Shipping foundation: app icon/splash, EAS config, privacy policy & terms,
  hosted legal pages, store-listing copy, CI (lint + typecheck + tests).

[Unreleased]: https://github.com/Alshifa-siddiqui/vitalis-app/commits/main
[1.0.0]: https://github.com/Alshifa-siddiqui/vitalis-app/releases/tag/v1.0.0
