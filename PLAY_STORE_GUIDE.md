# Vitalis — Play Store Go-Live Guide (detailed)

Step-by-step for the remaining launch tasks. Do them roughly in this order.
Your privacy policy URL (needed several times):
`https://alshifa-siddiqui.github.io/vitalis-app/privacy.html`

---

## B8 — Re-enable email confirmation (5 min, do first)

1. Supabase dashboard → your project (`yljlaacacaexsqjfxsyt`).
2. **Authentication → Providers → Email**.
3. Turn **Confirm email** back ON → **Save**.
4. **Make a clean test account for Google's reviewer** (needed in B7 "App access"):
   - Either sign up in the app with an email you control and confirm it, OR
   - Authentication → **Users → Add user**, set an email + password, and mark it
     confirmed. Write these credentials down — you'll give them to Google.

Why: shipping with confirmation off invites spam signups. The reviewer needs a
pre-confirmed login because the app gates features behind sign-in.

---

## B6 — Capture phone screenshots (20 min; can use your DEV build now)

Play requires **2–8 phone screenshots**. They do NOT have to come from the
production build — your existing dev build is fine for screenshots.

**How to capture (Android):** open the app on your phone, go to a screen, press
**Power + Volume-Down** together. Screenshots save to your gallery.

**Capture these 5** (populate data first — Profile → Privacy & data → "Load
sample habits" so screens look alive):
1. **Home** — score ring + today's habits
2. **Habit detail** — the heatmap + streak stats
3. **Health Hub** — Wellness score + an AI insight
4. **Habits list** — categories + a few habits
5. **Dark mode** — toggle it in Profile, re-shoot Home

**Specs Play enforces:** PNG or JPG, 9:16 or 16:9, each side 320–3840 px. Modern
phone screenshots pass automatically. Upload them later in the store listing.

Also ready (already generated in `assets/`):
- App icon: `play-icon-512.png` (512×512)
- Feature graphic: `feature-graphic.png` (1024×500)

---

## B7 — Play Console forms (Data Safety + Content Rating)

### Create the app first
Play Console → **Create app** → name `Vitalis`, **App**, **Free**, accept
declarations. Then work the **Dashboard → "Set up your app"** checklist.

### Data Safety (must match the privacy policy exactly)
**Data collection and security:**
- Does your app collect or share user data? → **Yes**
- Is all user data encrypted in transit? → **Yes** (Supabase is HTTPS/TLS)
- Do you provide a way to request data deletion? → **Yes** (in-app: Profile →
  Privacy & data; plus email `siddiqui21shifa@gmail.com`)

**Data types — declare exactly these three:**
| Data type | Collected | Shared | Optional? | Purpose |
|-----------|-----------|--------|-----------|---------|
| **Email address** (Personal info) | Yes | No | Required | Account management, App functionality |
| **Health info** (Health & fitness — age/weight/height/goals/notes) | Yes | No | Optional | App functionality |
| **Other user-generated content** (habits, check-ins) | Yes | No | Required | App functionality |

**Do NOT declare:** location, contacts, photos, financial info, ads/marketing.

**About the AI feature:** sending a habit summary to Anthropic is **processing by
a service provider on your behalf**, which Google does **not** count as "sharing."
So keep "Shared = No." (Your privacy policy already says this.)

**About crash logs:** you have Sentry wired but **no DSN set**, so the app
currently collects **no** crash/analytics data → don't declare it. If you later
set `EXPO_PUBLIC_SENTRY_DSN`, come back and add "Crash logs / Diagnostics
(shared with a service provider, for app functionality)."

### Content Rating (IARC questionnaire)
- Category: **Utility / Productivity / Health**
- Violence, sexual content, profanity, controlled substances, gambling → **No**
  to all
- User-generated content shared with others / social features → **No** (habits
  are private to each user)
- Result: **Everyone / PEGI 3** — a clean rating.

### App access
Because sign-in is required, add **login credentials for Google's reviewer**:
- Provide the pre-confirmed test account email + password from B8.
- Note: "All features are available after signing in with the provided account."

### Ads
- Does your app contain ads? → **No**

### Target audience
- Target age: **13+** (matches your policy; avoids child-privacy obligations).

---

## Upload the AAB + V1/V3 smoke test (via Internal testing)

You can't sideload an `.aab`. Use **Internal testing** (available immediately,
no review) to install the real production build on your phone.

1. Play Console → **Testing → Internal testing → Create new release**.
2. **Upload your `.aab`** (download it from the EAS build page, or use
   `eas submit -p android`).
3. Add release notes → **Save → Review → Start rollout to Internal testing**.
4. **Testers tab →** create an email list with your own Gmail → save.
5. Copy the **opt-in URL**, open it on your phone, "Become a tester," install
   **Vitalis** from Play.

**Smoke test (V1/V3) — verify on that install:**
- [ ] App opens to the sign-in screen (not "demo mode") → confirms env vars baked in
- [ ] Sign in with your confirmed account → habits load
- [ ] **Google sign-in** completes (release build uses the `vitalis://` redirect)
- [ ] Set a habit reminder ~2 min out → notification **actually fires** (this
      verifies the B1 channel fix)
- [ ] **Get AI Insight** returns real text
- [ ] Paywall opens when you exceed 5 habits / 3 insights
- [ ] Dark mode toggles

If anything fails here, fix it before going wider.

---

## B2 — 12-tester / 14-day Closed test (the long pole)

Required for new personal Play accounts before production access. Start it the
moment your account is verified.

1. Play Console → **Testing → Closed testing → Create track** (or use the
   default "Alpha").
2. **Testers → Create email list →** add **12–15 Google-account emails** →
   attach the list to the track.
3. **Create release →** upload the same `.aab` (or promote it from Internal
   testing) → **Start rollout to Closed testing**.
4. Copy the **opt-in URL** → send it to your testers with the recruiting note.
5. Each tester must **click the link, tap "Become a tester," and install** the
   app. Just listing their email is NOT enough — they must opt in.
6. Keep **≥12 opted-in testers for 14 continuous days**. Recruit 14–15 so a
   couple of drop-offs don't reset the window.
7. After 14 days → Play Console shows **"Apply for production access."** Submit
   it → once granted, promote the release to **Production**.

**Recruiting message:**
> Hey! I built an Android habit app, **Vitalis**, and need testers to launch it
> on the Play Store. 2 minutes: reply with the Gmail on your phone, I'll send a
> link — tap it, tap "Become a tester," install Vitalis from Google Play, and
> just keep it installed ~2 weeks. Huge help! 🙏

---

## Final order of operations
1. B8 (email confirmation + test account) — now
2. B6 (screenshots) — now, from dev build
3. Create app + B7 forms (Data Safety, Content Rating, App access) — when account exists
4. Upload AAB → Internal testing → V1/V3 smoke test on your phone
5. B2 closed test → recruit 12–15 → publish when verified → wait 14 days
6. Apply for production → promote to Production → live 🎉
