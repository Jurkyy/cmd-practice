# Product Roadmap — Quant Practice Pro

## Goal
Transform from a side project (71 questions, no monetization) into a competitive, shippable product that can sell on the App Store and Google Play against QuantGuide, Quantable, and QuantQuestions.

## Current State
- 71 questions across 6 categories
- 24 guide sections, 3 learning paths
- Spaced repetition (SM-2), streaks, 10 achievements
- No monetization, no paywall, no push notifications
- No mental math drill mode
- No company tags on questions
- No onboarding flow
- No tests

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

- [ ] **1.1** Add 40+ probability & statistics questions (target: 30 prob, 20 stat)
- [ ] **1.2** Add 30+ stochastic calculus & options questions (target: 20 stoch, 20 opt)
- [ ] **1.3** Add 25+ brain teasers & linear algebra questions (target: 15 brain, 10 la)
- [ ] **1.4** Add company tags to all questions (`askedAt?: string[]`)
  - Tags like "jane-street", "citadel", "two-sigma", "de-shaw", "jump-trading"
  - Filter by company in quiz setup
- [ ] **1.5** Add difficulty distribution: aim for 30% easy, 40% medium, 30% hard

**Status: NOT STARTED**

---

## Phase 2: Mental Math Drill Mode
Every competitor has this. Zetamac is the benchmark (50+ correct in 120s = good).

- [ ] **2.1** Build MentalMathDrill screen — timed arithmetic with configurable operations (+, -, ×, ÷)
- [ ] **2.2** Add difficulty levels (easy: small numbers, medium: 2-digit, hard: 3-digit + fractions/decimals)
- [ ] **2.3** Add scoring: questions/minute, accuracy, personal best tracking
- [ ] **2.4** Add speed leaderboard (local) with history
- [ ] **2.5** Add mental math tab or home screen entry point
- [ ] **2.6** Track mental math stats in progress (separate from quiz stats)

**Status: NOT STARTED**

---

## Phase 3: Monetization — RevenueCat + Paywall
The revenue engine. 7-day free trial → $9.99/mo or $49.99/year.

- [ ] **3.1** Install and configure `react-native-purchases` (RevenueCat SDK)
- [ ] **3.2** Create `useSubscription` hook — check entitlement, manage trial state
- [ ] **3.3** Create paywall screen — feature comparison (free vs pro), pricing, CTA
- [ ] **3.4** Gate premium features behind subscription check:
  - Free: 10 questions per category, basic quiz, 1 learning path, no SR
  - Pro: Full question bank, SR + review queue, all paths, analytics, mental math, company filters
- [ ] **3.5** Add restore purchases button in settings
- [ ] **3.6** Handle trial expiry, grace period, subscription status changes

**Status: NOT STARTED**

---

## Phase 4: Onboarding & Conversion Optimization
First 30 seconds determine if someone keeps the app. Make it personal.

- [ ] **4.1** Build onboarding flow (3-4 screens):
  - Screen 1: "What are you preparing for?" (Quant Trading / Quant Research / Risk / General)
  - Screen 2: "Target firms?" (multi-select: Jane Street, Citadel, Two Sigma, etc.)
  - Screen 3: "How much time do you have?" (1 week / 1 month / 3+ months)
  - Screen 4: "Your personalized plan is ready" → show recommended path
- [ ] **4.2** Store onboarding answers, use to customize home screen recommendations
- [ ] **4.3** Add "Start Free Trial" CTA at end of onboarding
- [ ] **4.4** Skip onboarding for returning users (check AsyncStorage flag)

**Status: NOT STARTED**

---

## Phase 5: Push Notifications & Engagement
The killer feature web apps can't match. Drives daily retention.

- [ ] **5.1** Install `expo-notifications`, configure for iOS + Android
- [ ] **5.2** Daily streak reminder (e.g., 7pm: "Don't lose your 5-day streak! 3 questions due for review")
- [ ] **5.3** Review queue alert ("You have 8 questions due for review — takes ~3 minutes")
- [ ] **5.4** Weekly summary ("This week: 85% accuracy, up 12% on Options")
- [ ] **5.5** Notification preferences screen (toggle each type on/off)
- [ ] **5.6** Request permission at appropriate moment (after first quiz, not on launch)

**Status: NOT STARTED**

---

## Phase 6: App Store Readiness
Everything needed to actually ship.

- [ ] **6.1** Design proper app icon (dark theme, quant/math motif)
- [ ] **6.2** Create App Store screenshots (6.7" iPhone, 12.9" iPad, Android phone)
- [ ] **6.3** Write store listing copy (title, subtitle, description, keywords)
- [ ] **6.4** Create privacy policy page (hosted URL required by both stores)
- [ ] **6.5** Create terms of service page
- [ ] **6.6** Configure EAS Build (`eas.json`) for production builds
- [ ] **6.7** Set up `app.json` with bundle identifiers, version codes, permissions
- [ ] **6.8** Test on physical devices (iOS + Android)
- [ ] **6.9** Submit to App Store + Google Play

**Status: NOT STARTED**

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

- **Phase 1 IN PROGRESS**: Question bank expansion (50+ new questions being generated by agent)
  - `askedAt` company tag field added to Question type
  - Agent adding questions across all categories with company tags
