# Scripture Quest - Complete Implementation Roadmap

## Project Overview
Building a Duolingo-style gamified scripture memorization app with world-class UX, habit formation mechanics, and social features.

**Target Launch:** January 2025 (New Year Bible reading season)

---

## ✅ COMPLETED (Current Status)

### Design System & Visual Foundation
- [x] Color palette (indigo/purple wisdom + gold accents)
- [x] Design tokens in index.css
- [x] Tailwind configuration
- [x] Gradient utilities
- [x] Animation keyframes (float, pulse-soft)
- [x] Typography system

### Marketing/Landing Page Components
- [x] Hero section with mascot
- [x] Daily Verse showcase
- [x] Features section (3 key benefits)
- [x] Games hub (8 game cards displayed)
- [x] Profile dashboard mockup
- [x] Call-to-action section
- [x] SEO meta tags

### Generated Assets
- [x] Hero mascot image (wise owl)
- [x] Icon: Learning
- [x] Icon: Community
- [x] Icon: Achievement

---

## 📋 PHASE 1: MVP FOUNDATION (Weeks 1-4)

**Goal:** Core game loop + XP/streak mechanics + KJV verses working
**Motto:** Make it playable, addictive, and rewarding

### 1.1 Backend & Authentication Setup
**Priority:** CRITICAL - Required for all user progress
- [ ] Enable Lovable Cloud
- [ ] Set up authentication
  - [ ] Email/password auth
  - [ ] Sign up flow
  - [ ] Login flow
  - [ ] Session persistence
- [ ] Create database schema
  - [ ] users table with profile data
  - [ ] user_progress table (XP, level, streak, coins, hearts)
  - [ ] user_verses table (mastery status per verse)
  - [ ] user_badges table
  - [ ] user_activities table (session history)
- [ ] Set up Row Level Security (RLS) policies

### 1.2 Bible Verses API Integration
**Priority:** CRITICAL - Core content source
- [ ] Research free Bible APIs (Bible.api, ESV API, API.Bible)
- [ ] Select primary API (recommend API.Bible for KJV free tier)
- [ ] Set up API key in Lovable Cloud secrets
- [ ] Create edge function: `get-verse`
  - [ ] Fetch by reference (e.g., "John 3:16")
  - [ ] Cache responses to reduce API calls
  - [ ] Error handling
- [ ] Create edge function: `get-verses-by-collection`
  - [ ] Fetch curated verse lists (Foundations, Comfort, etc.)
- [ ] Build local verse collections JSON
  - [ ] Foundations: 10 core verses
  - [ ] Comfort in Anxiety: 8 verses
  - [ ] Identity in Christ: 10 verses
  - [ ] Prayer Promises: 8 verses
- [ ] Test API integration thoroughly

### 1.3 Core Data Models & Types
**Priority:** HIGH - Foundation for all features
- [ ] Create TypeScript interfaces
  - [ ] User
  - [ ] UserProgress
  - [ ] Verse
  - [ ] VerseCollection
  - [ ] GameSession
  - [ ] Badge
  - [ ] Achievement
- [ ] Create constants
  - [ ] XP values per action
  - [ ] Level thresholds
  - [ ] Heart regeneration rates
  - [ ] Coin rewards

### 1.4 Game Engine Foundation
**Priority:** HIGH - Core game mechanics
- [ ] Build GameSession context provider
  - [ ] Track current verse
  - [ ] Track hearts remaining
  - [ ] Track current XP
  - [ ] Handle game completion
- [ ] Create verse processing utilities
  - [ ] Parse verse into words
  - [ ] Generate blanks (fill-in-the-blank)
  - [ ] Shuffle words (word scramble)
  - [ ] Extract keywords
- [ ] Build reward system
  - [ ] XP calculation
  - [ ] Coin rewards
  - [ ] Heart cost on wrong answers
  - [ ] Confetti/celebration animations
  - [ ] Level-up detection

### 1.5 Gamification Core Systems
**Priority:** HIGH - What makes it Duolingo-like

#### XP & Leveling System
- [ ] XP calculation logic
  - [ ] +50 XP: Complete fill-in-the-blank
  - [ ] +40 XP: Complete word search
  - [ ] +75 XP: Complete memory match
  - [ ] +100 XP: Perfect game run
  - [ ] +10 XP: Daily login
  - [ ] Streak bonus multiplier
- [ ] Level thresholds (1-50)
- [ ] Level-up modal with celebration
- [ ] Progress bar animations
- [ ] XP persistence to database

#### Streak System
- [ ] Daily streak counter
- [ ] Streak calculation (consecutive days)
- [ ] Streak display badge
- [ ] Streak broken notification
- [ ] "Streak at Risk" reminder (if missed)
- [ ] Update streak daily at midnight

#### Hearts System (Lives)
- [ ] Hearts state management (start with 5)
- [ ] Heart cost on wrong answer (-1 heart)
- [ ] Hearts display UI
- [ ] Heart regeneration
  - [ ] 1 heart every 30 minutes
  - [ ] Max 5 hearts
  - [ ] Timer display
- [ ] "Out of hearts" modal
  - [ ] Wait timer
  - [ ] Upsell to Premium (unlimited hearts)
- [ ] Persist hearts to database

#### Coins (Gems) System
- [ ] Coin balance management
- [ ] Coin rewards per action
  - [ ] +5 coins per game completion
  - [ ] +10 coins per perfect run
  - [ ] +20 coins per daily quest completion
- [ ] Coin display UI
- [ ] Persist coins to database
- [ ] (Phase 2: In-app store for coins)

### 1.6 Build First 2 Playable Games
**Priority:** HIGH - Prove the core loop works

#### Game 1: Verse Fill-in-the-Blank
- [ ] Create VerseCompletionGame component
- [ ] Game flow
  - [ ] Show full verse (3 seconds preview)
  - [ ] Hide 1-3 key words
  - [ ] Show 4 multiple choice options
  - [ ] Check answer on selection
  - [ ] Show feedback (green ✓ or red ✗)
  - [ ] Display full verse again
- [ ] Scoring logic
  - [ ] Base XP
  - [ ] Deduct heart on wrong answer
  - [ ] Track accuracy
- [ ] UI polish
  - [ ] Smooth transitions
  - [ ] Color flashes
  - [ ] Sound effects (optional)
- [ ] Progress to next verse
- [ ] Complete game summary screen

#### Game 2: Word Scramble
- [ ] Create WordScrambleGame component
- [ ] Game flow
  - [ ] Show full verse preview
  - [ ] Display shuffled words
  - [ ] User taps words in order
  - [ ] Show correct/incorrect feedback per word
  - [ ] Allow reset/undo
  - [ ] Complete when all words placed correctly
- [ ] Timer (optional pressure mechanic)
- [ ] Time bonus for speed
- [ ] UI polish
  - [ ] Drag-and-drop or tap selection
  - [ ] Visual feedback on correct placement
  - [ ] Confetti on completion
- [ ] Summary screen

### 1.7 Basic UI Components & Screens
**Priority:** HIGH - User-facing structure

#### Onboarding Flow
- [ ] Welcome screen
  - [ ] App value proposition
  - [ ] Mascot introduction
  - [ ] "Start Your Journey" CTA
- [ ] Goal selection
  - [ ] 1 verse/day
  - [ ] 3 verses/day
  - [ ] 5 verses/day
- [ ] Avatar customization (simple version)
  - [ ] Select from 6 preset avatars
  - [ ] Name input
- [ ] First verse tutorial
  - [ ] Guided fill-in-the-blank
  - [ ] Celebration on completion
  - [ ] First XP earned!
- [ ] Enable notifications prompt

#### Home Screen / Dashboard
- [ ] Daily verse card
- [ ] Streak counter (prominent)
- [ ] XP bar with level
- [ ] Hearts display
- [ ] Coins display
- [ ] "Start Learning" CTA
- [ ] Quick access to verse collections
- [ ] Daily quest card (Phase 2)

#### Verse Collections Screen
- [ ] List of collections
  - [ ] Foundations (10 verses)
  - [ ] Comfort (8 verses)
  - [ ] Identity (10 verses)
  - [ ] Prayer (8 verses)
- [ ] Collection cards
  - [ ] Title
  - [ ] Progress bar (X/Y completed)
  - [ ] XP reward preview
  - [ ] Lock icon for future collections
- [ ] Tap to start collection

#### Game Selection Screen
- [ ] Choose game mode for current verse
  - [ ] Verse Completion
  - [ ] Word Scramble
  - [ ] (Others locked with "Coming Soon")
- [ ] Show XP reward per game
- [ ] Show difficulty level

#### Profile Screen
- [ ] User avatar & name
- [ ] Current level & XP
- [ ] Total verses memorized
- [ ] Current streak
- [ ] Badges earned (grid display)
- [ ] Settings
  - [ ] Notification preferences
  - [ ] Bible translation (KJV only for now)
  - [ ] Account settings
  - [ ] Logout

#### Post-Game Summary Screen
- [ ] Celebration animation
- [ ] XP earned display
- [ ] Coins earned
- [ ] Accuracy stats
- [ ] "Continue" to next verse
- [ ] "Review" to replay
- [ ] Progress saved indicator

### 1.8 Badge System (Basic)
**Priority:** MEDIUM - Adds accomplishment feel
- [ ] Badge data model
- [ ] Badge unlock logic
- [ ] Basic badges to implement:
  - [ ] "First Steps" - Complete first verse
  - [ ] "3-Day Streak" - 3 days in a row
  - [ ] "Week Warrior" - 7 days in a row
  - [ ] "Foundations Complete" - Finish Foundations collection
  - [ ] "XP Hunter" - Earn 500 XP
- [ ] Badge unlock modal/toast
- [ ] Badge display in profile
- [ ] Badge persistence to database

### 1.9 Daily Reminder Notifications
**Priority:** MEDIUM - Critical for retention
- [ ] Request notification permissions
- [ ] Schedule daily notification
  - [ ] Default: 9:00 AM
  - [ ] User customizable time
- [ ] Notification content
  - [ ] Verse snippet
  - [ ] Streak count
  - [ ] Encouraging message
- [ ] Deep link to app on tap

### 1.10 Testing & Polish
**Priority:** HIGH - Ensure quality before Phase 2
- [ ] Test all game flows end-to-end
- [ ] Test XP calculations
- [ ] Test streak logic
- [ ] Test hearts regeneration
- [ ] Fix any animation glitches
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Test on iOS and Android
- [ ] User testing with 5-10 people

---

## 📋 PHASE 2: SOCIAL & MONETIZATION (Weeks 5-8)

**Goal:** Add friends, groups, premium tier, and 3 more games
**Motto:** Make it social and sustainable

### 2.1 Freemium & Ads
**Priority:** HIGH - Revenue foundation
- [ ] Integrate ad network (AdMob or Meta Audience Network)
- [ ] Banner ads on home screen (free tier)
- [ ] Interstitial ad after 3-5 game sessions
- [ ] Ad-free experience for premium users
- [ ] Respect user experience (no pop-ups mid-game)

### 2.2 Premium Tier (Plus)
**Priority:** HIGH - Monetization
- [ ] Create pricing model
  - [ ] $4.99/month Plus tier
- [ ] Stripe integration (Lovable has custom tools)
- [ ] Subscription management
  - [ ] Subscribe flow
  - [ ] Cancel flow
  - [ ] Restore purchases
- [ ] Premium features
  - [ ] Remove all ads
  - [ ] Unlimited hearts
  - [ ] Streak freeze (1 free per month)
  - [ ] Early access to new features
- [ ] Premium badge/indicator in profile
- [ ] Upsell modals (contextual)
  - [ ] After running out of hearts
  - [ ] After 2-3 ad impressions
  - [ ] After completing 10 verses

### 2.3 Social Features - Friends
**Priority:** HIGH - Retention driver
- [ ] Friend system
  - [ ] Add friend by username/code
  - [ ] Friend requests
  - [ ] Accept/decline
  - [ ] Friend list
- [ ] Friends leaderboard
  - [ ] XP this week
  - [ ] Current streaks
  - [ ] Total verses
- [ ] See friend activity
  - [ ] Recent badges earned
  - [ ] Verses completed
- [ ] Shareable profile/streak cards
  - [ ] Generate image with stats
  - [ ] Share to social media

### 2.4 Social Features - Groups
**Priority:** HIGH - Church adoption driver
- [ ] Group/church codes
- [ ] Create group
  - [ ] Group name
  - [ ] Invite code
  - [ ] Optional: group admin
- [ ] Join group
- [ ] Group leaderboard
  - [ ] XP this week
  - [ ] Total verses memorized
  - [ ] Active members
- [ ] Group challenges (simple version)
  - [ ] "Memorize 100 verses this month"
  - [ ] Progress bar
  - [ ] Completion celebration

### 2.5 Daily Quests
**Priority:** MEDIUM - Increases engagement
- [ ] Quest system
  - [ ] 3 daily quests assigned
  - [ ] Examples:
    - [ ] "Earn 100 XP today"
    - [ ] "Complete 3 verses"
    - [ ] "Maintain your streak"
    - [ ] "Practice an old verse"
- [ ] Quest rewards
  - [ ] XP bonus
  - [ ] Coins
  - [ ] Badge for completing all 3
- [ ] Quest UI on home screen
- [ ] Quest completion tracking

### 2.6 Build 3 More Games
**Priority:** MEDIUM - Content variety

#### Game 3: Quick Tap (Multiple Choice Quiz)
- [ ] Create QuickTapGame component
- [ ] Question types
  - [ ] Match verse to reference
  - [ ] Match reference to verse
  - [ ] Complete the verse
- [ ] Fast-paced (10 questions)
- [ ] 15 seconds per question
- [ ] Scoring
  - [ ] XP per correct
  - [ ] Combo streak bonus
  - [ ] Perfect run badge (10/10)
- [ ] Leaderboard integration (fastest perfect run)

#### Game 4: Word Search
- [ ] Create WordSearchGame component
- [ ] Generate grid from verse words
- [ ] Drag to select words
- [ ] Highlight found words
- [ ] Timer (optional)
- [ ] Hints (show word list)
- [ ] Bonus: hidden Easter egg words (+extra coins)

#### Game 5: Hangman (Single Keyword)
- [ ] Create HangmanGame component
- [ ] Show verse with one word missing
- [ ] Letter selection or multiple choice
- [ ] Visual hangman progress (or hearts-based)
- [ ] Keyword mastery tracker
- [ ] Encourage memory of anchor words

### 2.7 Enhanced Profile & Stats
**Priority:** MEDIUM
- [ ] Extended profile
  - [ ] Total time spent
  - [ ] Accuracy rate
  - [ ] Favorite game mode
  - [ ] Most memorized book
- [ ] Stats dashboard
  - [ ] XP over time graph
  - [ ] Verses per week chart
  - [ ] Streak calendar view
- [ ] Achievement showcase
  - [ ] Featured badges
  - [ ] Rarity indicators

### 2.8 Push Notification Enhancements
**Priority:** MEDIUM
- [ ] Streak at risk notification (evening if not played)
- [ ] Friend activity notifications
  - [ ] Friend beat your score
  - [ ] Friend earned badge
- [ ] Daily quest reminders

### 2.9 Translation Preview (Limited)
**Priority:** LOW (requires licensing research)
- [ ] Research fair use limits for ESV/NASB/CSB
- [ ] Add limited verse sets (~500 verses ESV)
- [ ] Translation selector in settings
- [ ] Show "Preview" badge on limited translations
- [ ] Upsell for full translation access (Phase 3)

---

## 📋 PHASE 3: LEAGUES & ADVANCED FEATURES (Weeks 9-12)

**Goal:** Duolingo-style leagues + remaining games + Pro tier
**Motto:** Make it competitive and feature-complete

### 3.1 Weekly Leagues
**Priority:** HIGH - Massive retention driver
- [ ] League system (Bronze → Silver → Gold → Platinum → Diamond)
- [ ] League assignment (random ~30 users per league)
- [ ] Weekly competition
  - [ ] XP earned this week
  - [ ] Real-time leaderboard updates
- [ ] Promotion/demotion
  - [ ] Top 10: promote
  - [ ] Bottom 5: demote
- [ ] League rewards
  - [ ] Badge per league tier
  - [ ] Coin rewards
  - [ ] Exclusive avatar items (Pro tier)
- [ ] Opt-in only (respects privacy)

### 3.2 Pro Tier ($9.99/month)
**Priority:** HIGH - Premium monetization
- [ ] All Plus features
- [ ] Full Bible translations (once licensed)
  - [ ] ESV
  - [ ] NASB
  - [ ] CSB
  - [ ] NKJV
- [ ] Offline mode (download verses)
- [ ] Advanced stats & insights
  - [ ] Verse heatmap (weak words)
  - [ ] Spaced repetition predictions
  - [ ] Memory retention graphs
- [ ] Priority support
- [ ] Early access to seasonal events

### 3.3 Spaced Repetition Review
**Priority:** HIGH - Learning effectiveness
- [ ] Review algorithm (Anki-style SM-2)
- [ ] Track verse mastery level (1-5)
- [ ] "Due for review" tab on home
- [ ] Review queue
- [ ] Auto-resurface weak verses
- [ ] Review mode (quick quiz on old verses)

### 3.4 Build Remaining 3 Games

#### Game 6: Typing Drill
- [ ] Create TypingDrillGame component
- [ ] Progressive difficulty
  - [ ] Stage 1: Copy full verse
  - [ ] Stage 2: Type with some words faded
  - [ ] Stage 3: Type from memory (fully hidden)
- [ ] Real-time correctness checking
- [ ] Highlight incorrect words
- [ ] Mastery crown on completion
- [ ] Required for "Mastered" status

#### Game 7: Memory Match
- [ ] Create MemoryMatchGame component
- [ ] Card flip mechanics
- [ ] Match types
  - [ ] Verse start ↔ verse end
  - [ ] Verse ↔ reference
  - [ ] Keyword ↔ definition
- [ ] Move counter
- [ ] Time bonus
- [ ] Low-move badges

#### Game 8: Daily "Lordle"
- [ ] Create daily puzzle game
- [ ] Everyone gets same puzzle globally
- [ ] Wordle-style result grid
- [ ] Shareable result ("Scripture Quest 4/6 🟩⬜🟩🟩⬜🟩")
- [ ] Daily badge for completion
- [ ] Major virality feature

### 3.5 Achievements & Badge Expansion
**Priority:** MEDIUM
- [ ] Expand badge library to 30+ badges
- [ ] Tiered badges (Bronze/Silver/Gold)
- [ ] Hidden badges (discover by playing)
- [ ] Seasonal badges
- [ ] Badge rarity system
- [ ] Badge showcase on profile

### 3.6 Church/Group Admin Dashboard
**Priority:** MEDIUM - B2B potential
- [ ] Web dashboard for group leaders
- [ ] View group stats
  - [ ] Active members
  - [ ] Total verses memorized
  - [ ] Weekly engagement
- [ ] Create group challenges
- [ ] Send group announcements
- [ ] Export reports (CSV)

### 3.7 Seasonal Events & Challenges
**Priority:** MEDIUM - Engagement spikes
- [ ] Event system infrastructure
- [ ] New Year Challenge (Jan)
  - [ ] Special badge
  - [ ] 21-day challenge
  - [ ] Bonus XP
- [ ] Easter Challenge (March/April)
  - [ ] Resurrection verses
  - [ ] Limited-time badge
- [ ] Advent Challenge (Dec)
  - [ ] 25 days of Christmas verses

### 3.8 Mascot Interactions
**Priority:** LOW - Delight factor
- [ ] Mascot dialogue system
- [ ] Context-aware messages
  - [ ] Encouragement after losses
  - [ ] Celebration after wins
  - [ ] Streak reminders
  - [ ] Level-up congratulations
- [ ] Mascot animations
  - [ ] Idle
  - [ ] Clap
  - [ ] Concern
  - [ ] Excitement
- [ ] Multiple mascot characters (unlock via levels)

---

## 📋 PHASE 4: SCALE & EXPANSION (Months 4-6)

**Goal:** International expansion, UGC, live features
**Motto:** Make it a platform, not just an app

### 4.1 Multi-Language Support
**Priority:** HIGH - Global reach
- [ ] Spanish translation (UI + verses)
- [ ] French translation
- [ ] Portuguese translation
- [ ] Chinese translation
- [ ] Localization system
- [ ] RTL language support (Arabic)

### 4.2 User-Generated Content
**Priority:** MEDIUM
- [ ] Users can create custom verse collections
- [ ] Share collections with friends/groups
- [ ] Verse collection marketplace
- [ ] Rating system for collections

### 4.3 Live Multiplayer Features
**Priority:** MEDIUM - Engagement spikes
- [ ] Live quiz mode (Kahoot-style)
- [ ] Host can start live session
- [ ] Players join with code
- [ ] Real-time scoring
- [ ] Podium display
- [ ] Great for youth groups

### 4.4 AI-Powered Features
**Priority:** LOW - Innovation differentiator
- [ ] AI devotional generation (via Lovable AI)
  - [ ] Daily devotional based on verse
  - [ ] Context & application
- [ ] AI quiz generation
  - [ ] Generate Bible Jeopardy questions
  - [ ] Contextual comprehension questions
- [ ] AI study buddy
  - [ ] Answer questions about verses
  - [ ] Explain difficult passages

### 4.5 Reading Plans Integration
**Priority:** MEDIUM
- [ ] Pre-built reading plans
  - [ ] Bible in a year
  - [ ] New Testament in 90 days
  - [ ] Psalms & Proverbs
- [ ] Combine reading + memorization
- [ ] Track reading progress
- [ ] Sync with YouVersion (partnership?)

### 4.6 Advanced Analytics (Pro)
**Priority:** LOW
- [ ] Memory retention curves
- [ ] Optimal review timing predictions
- [ ] Weak word identification
- [ ] Learning pace recommendations
- [ ] Compare to community averages

---

## 🎯 SUCCESS METRICS (Track Throughout)

### Engagement Metrics
- [ ] D1 retention (% who return day 2)
- [ ] D7 retention
- [ ] D30 retention
- [ ] Average daily sessions per user
- [ ] Average session duration
- [ ] Verses completed per user
- [ ] Games played per session

### Monetization Metrics
- [ ] Free to Plus conversion rate
- [ ] Plus to Pro conversion rate
- [ ] Average revenue per user (ARPU)
- [ ] Lifetime value (LTV)
- [ ] Churn rate
- [ ] First purchase time (days from signup)

### Social Metrics
- [ ] Friend invite rate
- [ ] Group creation rate
- [ ] Share rate (streak cards, badges)
- [ ] Viral coefficient

### Learning Metrics
- [ ] Verses mastered per user
- [ ] Average mastery time per verse
- [ ] Review completion rate
- [ ] Quiz accuracy over time

---

## 🚀 IMMEDIATE NEXT STEPS (Week 1, Day 1)

### Priority Order
1. **Enable Lovable Cloud** (backend foundation)
2. **Set up Bible API integration** (content source)
3. **Build authentication flow** (user accounts)
4. **Create database schema** (data persistence)
5. **Implement XP/Hearts/Streak tracking** (core gamification)
6. **Build Verse Completion game** (first playable game)
7. **Create onboarding flow** (first-time experience)
8. **Test end-to-end** (quality assurance)

---

## 📝 NOTES & ASSUMPTIONS

### API Selection Recommendation
- **API.Bible** - Free KJV, good documentation, generous rate limits
- **Fallback:** Bible.api or ESV API

### Design Philosophy
- Mobile-first (90% of use will be mobile)
- Fast (every screen loads < 500ms)
- Encouraging (never shame, always uplift)
- Beautiful (Duolingo-level polish)
- Accessible (WCAG AA compliance)

### Technical Stack
- React + TypeScript
- Tailwind CSS
- Lovable Cloud (Supabase backend)
- Stripe payments
- AdMob or Meta Audience Network
- Push notifications (Firebase Cloud Messaging)

### Risk Mitigation
- **Bible licensing:** Start KJV-only; negotiate licenses in parallel
- **API rate limits:** Cache aggressively; consider self-hosted DB later
- **Monetization:** Test multiple ad networks; optimize for user experience
- **Retention:** Obsess over onboarding; A/B test notification copy

---

## 🎉 DEFINITION OF DONE (MVP Launch Checklist)

- [ ] User can sign up and complete onboarding
- [ ] User can play 2 games and earn XP
- [ ] Streak counter works correctly
- [ ] Hearts regenerate properly
- [ ] Badge system awards badges
- [ ] Profile displays all stats accurately
- [ ] Notifications work on iOS and Android
- [ ] Ads display (for free users)
- [ ] Premium subscription flow works
- [ ] App submitted to App Store and Play Store
- [ ] Landing page is live
- [ ] Church partner kit is ready
- [ ] Social share cards work
- [ ] 10 user testers have completed 7-day streaks

**Estimated Timeline:** 12 weeks to full MVP launch
**Target Launch Date:** January 5, 2025

---

**This roadmap is a living document. Update as we progress and learn from users.**
