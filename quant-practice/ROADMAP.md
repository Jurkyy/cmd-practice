# Product Roadmap — Quant Practice Pro

## Goal
Transform from a side project (71 questions, no monetization) into a competitive, shippable product that can sell on the App Store and Google Play against QuantGuide, Quantable, and QuantQuestions.

## Current State (Updated)
- 200+ questions across 6 categories with company tags
- 24 guide sections, 3 learning paths
- Spaced repetition (SM-2), streaks, 10 achievements
- Mental math drill mode (timed, configurable)
- Subscription paywall (7-day trial, $9.99/mo, $49.99/yr)
- 4-step onboarding flow
- Push notification infrastructure (stubbed for expo-notifications)
- Settings screen with notification toggles
- Feature gating: free tier limits questions, paths, drill sessions
- App Store/Play Store listing copy and EAS Build config

## Competitor Benchmarks
| Feature | Quantable | QuantGuide | QuantQuestions | Us (Current) |
|---------|-----------|------------|----------------|--------------|
| Questions | 1,500+ | Hundreds | 1,200+ | 71 |
| Company tags | Yes | Yes | Yes | No |
| Mental math game | No | "Quantify" | No | No |
| Mobile app | No (web) | No (web) | No (web) | Yes (iOS+Android) |
| Spaced repetition | No | No | No | Yes |
| Learning paths | Playlists | No | No | Yes (3) |
| Analytics | Basic | Basic | Basic | Tag + difficulty |
| Push notifications | No | No | No | No |
| Pricing | ~$15-30/mo | ~$15-30/mo | ~$15-30/mo | Free |

## Our Unique Edge
1. **Only native mobile app** with full question bank (not just mental math)
2. **Spaced repetition** — nobody else does this
3. **Offline access** — web platforms can't offer this
4. **Push notifications** — streak reminders, review queue alerts
5. **Lower price point** — $9.99/mo undercuts web platforms

---

## Phase 1: Content Scale (Must-Have for Launch)
Expand from 71 to 200+ questions. No one takes a quiz app seriously with only 71 questions.

- [x] **1.1** Add 40+ probability & statistics questions (target: 30 prob, 20 stat)
- [x] **1.2** Add 30+ stochastic calculus & options questions (target: 20 stoch, 20 opt)
- [x] **1.3** Add 25+ brain teasers & linear algebra questions (target: 15 brain, 10 la)
- [x] **1.4** Add company tags to all questions (`askedAt?: string[]`)
  - Tags: jane-street, citadel, two-sigma, de-shaw, jump-trading, hrt, optiver, imc, sig, etc.
- [x] **1.5** Add difficulty distribution: mix of easy/medium/hard

**Status: COMPLETE** — 200+ questions with company tags across all 6 categories

---

## Phase 2: Mental Math Drill Mode
Every competitor has this. Zetamac is the benchmark (50+ correct in 120s = good).

- [x] **2.1** Build MentalMathDrill screen — timed arithmetic with configurable operations (+, -, ×, ÷)
- [x] **2.2** Add difficulty levels (easy: small numbers, medium: 2-digit, hard: 3-digit)
- [x] **2.3** Add scoring: questions/minute, accuracy, personal best tracking
- [x] **2.4** Add speed leaderboard (local) with history of last 20 sessions
- [x] **2.5** Add mental math entry point on home screen
- [x] **2.6** Track mental math stats in progress (separate from quiz stats)

**Status: COMPLETE**

---

## Phase 3: Monetization — RevenueCat + Paywall
The revenue engine. 7-day free trial → $9.99/mo or $49.99/year.

- [x] **3.1** Subscription hook with RevenueCat-ready architecture (stubbed for development)
- [x] **3.2** Create `useSubscription` hook — check entitlement, manage trial state
- [x] **3.3** Create paywall screen — feature comparison (free vs pro), pricing, CTA
- [x] **3.4** Gate premium features behind subscription check:
  - Free: 3 questions per category, 1 learning path, 3 drill sessions, no SR
  - Pro: Full question bank, SR + review queue, all paths, unlimited drills, analytics
- [x] **3.5** Add restore purchases button in settings
- [x] **3.6** Handle trial expiry and subscription status changes

**Status: COMPLETE** — Feature gating wired into quiz, drill, and learn screens

---

## Phase 4: Onboarding & Conversion Optimization
First 30 seconds determine if someone keeps the app. Make it personal.

- [x] **4.1** Build onboarding flow (4 screens):
  - Screen 1: "What are you preparing for?" (Quant Trading / Research / Risk / General)
  - Screen 2: "Target firms?" (Jane Street, Citadel, Two Sigma, D.E. Shaw, etc.)
  - Screen 3: "How much time do you have?" (< 1 week / 1 month / 3+ months)
  - Screen 4: "You're all set!" personalized summary
- [x] **4.2** Store onboarding answers in AsyncStorage for profile
- [x] **4.3** Skip option with "Skip for now" button
- [x] **4.4** Auto-redirect to onboarding for first-time users (wired in root layout)

**Status: COMPLETE**

---

## Phase 5: Push Notifications & Engagement
The killer feature web apps can't match. Drives daily retention.

- [x] **5.1** Notification hook with expo-notifications-ready architecture (stubbed)
- [x] **5.2** Daily streak reminder infrastructure
- [x] **5.3** Review queue alert infrastructure
- [x] **5.4** Weekly summary infrastructure
- [x] **5.5** Notification preferences in settings (toggle streak, review, weekly)
- [ ] **5.6** Install `expo-notifications` native module and uncomment code

**Status: COMPLETE** (infrastructure) — Activate by running `npx expo install expo-notifications`

---

## Phase 6: App Store Readiness
Everything needed to actually ship.

- [ ] **6.1** Design proper app icon (dark theme, quant/math motif)
- [ ] **6.2** Create App Store screenshots (6.7" iPhone, 12.9" iPad, Android phone)
- [x] **6.3** Write store listing copy (STORE_LISTING.md — title, subtitle, description, keywords)
- [ ] **6.4** Create privacy policy page (hosted URL required by both stores)
- [ ] **6.5** Create terms of service page
- [x] **6.6** Configure EAS Build (`eas.json`) for production builds
- [x] **6.7** Set up `app.json` with bundle identifiers, version codes, permissions
- [ ] **6.8** Test on physical devices (iOS + Android)
- [ ] **6.9** Submit to App Store + Google Play

**Status: PARTIAL** — Build config and listing copy done. Need icon, screenshots, legal pages, device testing, submission.

---

## Phase 7: Post-Launch Growth
After initial launch, iterate based on user feedback.

- [ ] **7.1** Analytics integration (Mixpanel or Amplitude) — track funnel, feature usage
- [ ] **7.2** Company-specific question packs ("Jane Street Pack", "Citadel Pack")
- [ ] **7.3** Community features — discussion threads on hard questions
- [ ] **7.4** Mock interview mode — timed, multi-category, scored like a real interview
- [ ] **7.5** Expand to 500+ questions
- [ ] **7.6** A/B test paywall designs for conversion optimization

**Status: FUTURE**

---

## Priority Order
1. Phase 2 (Mental Math) — quick win, high perceived value
2. Phase 1 (Content Scale) — needed for credibility
3. Phase 3 (Monetization) — revenue engine
4. Phase 4 (Onboarding) — conversion optimization
5. Phase 5 (Push Notifications) — retention driver
6. Phase 6 (App Store) — ship it
7. Phase 7 (Post-Launch) — iterate

---

## Implementation Log

### Build 2 — Product Features
- **Phase 2 COMPLETE**: Mental math drill mode
  - Full screen at `/drill` with setup → playing → results flow
  - Configurable operations (+, -, ×, ÷), difficulty (easy/medium/hard), duration (60/120/180s)
  - Per-difficulty personal best tracking, accuracy, questions/minute
  - Entry point added to home screen
  - `useMentalMath` hook for persistent stats

- **Phase 3 COMPLETE**: Subscription & paywall infrastructure
  - `useSubscription` hook with free/pro tiers, 7-day trial logic
  - Paywall screen at `/paywall` with feature comparison table, annual/monthly pricing
  - `FREE_LIMITS` config for feature gating
  - Ready to plug in RevenueCat when App Store accounts are configured

- **Phase 4 COMPLETE**: Onboarding flow
  - 4-step onboarding at `/onboarding`: role → target firms → timeline → personalized summary
  - Stores profile preferences in AsyncStorage
  - Skip option available, first-launch check via `hasCompletedOnboarding()`

- **Phase 5 COMPLETE**: Push notification infrastructure
  - `useNotifications` hook with settings management
  - Settings screen at `/settings` with notification toggles (streak, review, weekly summary)
  - Subscription status card in settings
  - Stubbed for `expo-notifications` — uncomment imports when native module installed
  - Privacy Policy + Terms of Service placeholders in settings

- **Phase 1 COMPLETE**: Question bank expanded to 200+ questions
  - `askedAt` company tag field added to Question type
  - Questions across all 6 categories with company tags (jane-street, citadel, two-sigma, etc.)
  - Mix of easy/medium/hard difficulties with hints and detailed explanations

### Build 3 — Feature Gating & Integration
- **Feature gating wired** into quiz, drill, and learn screens
  - Quiz: Free users limited to first 3 questions per category
  - Drill: Free users limited to 3 sessions, then shown upgrade prompt
  - Learn: Non-first learning paths show lock icon, redirect to paywall
- **Onboarding auto-redirect**: Root layout checks `hasCompletedOnboarding()` and redirects first-time users
- **Settings access**: Settings gear icon and Pro upgrade badge added to home screen hero
- **Subscription awareness**: Home screen shows PRO badge for free users linking to paywall

### What's Left to Ship
1. Design app icon and screenshots
2. Host privacy policy and terms of service pages
3. Run `npx expo install expo-notifications` and uncomment notification code
4. Set up RevenueCat account and replace subscription stubs
5. Test on physical iOS and Android devices
6. Submit to App Store and Google Play
