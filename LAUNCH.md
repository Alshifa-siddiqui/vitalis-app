# Vitalis — Launch Checklist

Everything in the app is built. These are the steps only you can do (they need
your accounts, credentials, or a physical device). Do them roughly in order.
Run all commands from the project root: `C:\Users\Admin\Desktop\shifa\Projects\vitalis-app`.

---

## 1. Run the database SQL in Supabase

Two tables still need to exist in your Supabase project (`yljlaacacaexsqjfxsyt`):
`profiles` (settings cloud sync) and `ai_usage` (AI daily quota).

1. Supabase dashboard → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql`, copy the **whole file**, paste, and **Run**.
   - It's safe to run the whole file again — every statement uses
     `create table if not exists` / `drop policy if exists`, so re-running won't
     break the existing `habits` table or its data.
3. Verify under **Table Editor** that `habits`, `profiles`, and `ai_usage` all
   exist and show "RLS enabled".

✅ Done when: all three tables are present with RLS enabled.

---

## 2. Deploy the updated AI function + set the secret

The `ai-insight` function was updated (daily quota + fast model), so redeploy it.

```bash
# One-time: log in and link the project (skip if already linked)
npx supabase login
npx supabase link --project-ref yljlaacacaexsqjfxsyt

# Set your Anthropic key as a server secret (never goes in the app)
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...your-key...

# Deploy
npx supabase functions deploy ai-insight
```

Get an Anthropic API key at https://console.anthropic.com → API Keys.

✅ Done when: tapping **Get AI Insight** in the app returns real coaching text.
Quick server check:
```bash
npx supabase functions list   # ai-insight should show as deployed
```

---

## 3. Re-enable email confirmation

It was turned OFF for testing. Turn it back on before real users sign up.

- Supabase dashboard → **Authentication → Providers → Email** →
  enable **Confirm email** → Save.

✅ Done when: a new sign-up receives a confirmation email before it can log in.

---

## 4. Create the developer accounts

Both stores require paid developer accounts before you can submit.

- **Apple Developer Program** — https://developer.apple.com/programs/ — **$99/year**.
- **Google Play Console** — https://play.google.com/console/signup — **$25 one-time**.

Also add these before submitting (both stores require them):
- **Privacy Policy URL** — host `PRIVACY.md` somewhere public (GitHub Pages works).
- **Support URL or email** — see `STORE_LISTING.md`.

✅ Done when: both accounts are approved (Apple can take 24–48h).

---

## 5. Build and submit with EAS

```bash
# One-time
npm install -g eas-cli
eas login
eas build:configure          # if eas.json isn't already set up

# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to the stores (after builds finish)
eas submit --platform ios --latest
eas submit --platform android --latest
```

Notes:
- Bundle id / package: `com.shifa.vitalis` (already set in `app.json`).
- Native **Google sign-in** needs a real build (it does NOT work in Expo Go).
- Fill in the store listings from `STORE_LISTING.md` and upload screenshots
  (capture them on-device — see the screenshot plan in that file).

✅ Done when: both builds pass review and are live / in TestFlight + internal testing.

---

## 6. Final pre-launch cleanup

- **Delete the test account** `demo.tester@vitalis-test.com` — Supabase dashboard
  → Authentication → Users → delete.
- **On-device smoke test** (these only work on a physical phone, not web/simulator):
  - Habit reminders actually fire at the set time (expo-notifications).
  - Haptics buzz on check-in.
  - "Export my data" opens the share sheet with valid JSON.
  - Google sign-in works in the production build.
  - Dark mode + VoiceOver/TalkBack navigation.

✅ Done when: every item above is verified on a real device.

---

### Quick status reference

| Area | State |
|------|-------|
| App code (all 7 batches) | ✅ Done, pushed to GitHub |
| Supabase `habits` table + auth | ✅ Live |
| Supabase `profiles` + `ai_usage` tables | ⏳ Step 1 |
| AI function deployed w/ key | ⏳ Step 2 |
| Email confirmation | ⏳ Step 3 |
| Apple / Google accounts | ⏳ Step 4 |
| Store builds submitted | ⏳ Step 5 |
| Test account deleted + device QA | ⏳ Step 6 |
