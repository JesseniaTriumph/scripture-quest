# Scripture Quest - 7-Phase Implementation Roadmap

**A Duolingo-inspired, character-guided mobile platform for joyful, gamified Bible verse mastery.**

**Target Timeline:** 14 weeks (3.5 months)  
**Current Status:** Phase 0 - Foundation Fixes (Week 1) - Partial Complete

---

## 📊 PROJECT STATUS OVERVIEW

### ✅ What's Actually Implemented

**Design System & Foundation**
- [x] Color palette with semantic tokens (HSL-based)
- [x] Tailwind configuration with design system
- [x] Gradient utilities and animation keyframes
- [x] Typography system
- [x] Responsive mobile-first layouts

**Backend & Database**
- [x] Lovable Cloud (Supabase) integration
- [x] Authentication (email/password)
- [x] Database tables: `profiles`, `collections`, `verses`, `verse_progress`, `daily_quests`, `path_nodes`, `game_sessions`
- [x] Row Level Security (RLS) policies
- [x] Oil lamp system (5 lamps, 15-minute regeneration)
- [x] XP, coins, streak tracking
- [x] Daily quests system
- [x] Grace Pass system (weekly refill, premium users get 3)
- [x] Spaced repetition database schema (Phase 4.1 - `strength_score`, `next_review_date`, `stage`, `games_completed`, `ease_factor`)
- [x] Game sessions tracking table

**Audio & Sound System** 🆕
- [x] Sound effects hook (`src/hooks/useSounds.tsx`)
- [x] Chime sound (word found, magical effect)
- [x] Victory sound (game completion, celebration)
- [x] Refill sound (oil lamp restored, positive pitch-shifted chime)
- [x] Burn sound (oil lamp lost, negative pitch-shifted chime)
- [x] Sound files: `/public/sounds/chime.mp3`, `/public/sounds/victory.mp3`
- [x] Integrated into Word Search, oil lamp system, and extensible to all games

**UI Components Built**
- [x] Hero section with character (Hope)
- [x] Daily Verse component
- [x] Features section
- [x] Games hub display
- [x] Profile dashboard mockup
- [x] Call-to-action sections
- [x] Path-based navigation (Duolingo-style vertical scroll)
- [x] User stats display
- [x] Oil lamp display with regeneration timer
- [x] Grace Pass modal and indicator
- [x] Progress bars and animations

**8 Mini-Games Created**
- [x] Preview Mode (LEARN stage)
- [x] Copy Mode (LEARN stage)
- [x] Fill-in-the-Blank (PRACTICE stage)
- [x] Word Scramble (PRACTICE stage) - with preview flow
- [x] Verse Builder (PRACTICE stage)
- [x] Memory Match (MASTER stage) - with animations and sequential design requirement
- [x] Recall Mode (MASTER stage)
- [x] Quick Tap (MASTER stage)

**Game Polish & Animations** 🆕
- [x] Memory Match card flip animations
- [x] Staggered card entrance animations
- [x] Shake animation on incorrect matches
- [x] Glow-pulse animation for current segment cards
- [x] Particle effects (confetti) on game completion
- [x] Sound effects integration (chime, victory, refill, burn)
- [x] Oil lamp loss/restoration audio feedback

**Word Search Enhancements** 🆕
- [x] Full verse context display above grid
- [x] Difficulty progression (Easy/Medium/Hard modes)
- [x] Progressive reshuffling mechanics by difficulty
- [x] Visual highlighting of found words in scripture text
- [x] Hint system with difficulty-scaled timers (45s/60s/90s)
- [x] 3 free hints per session
- [x] Preview flow with "I'm Ready - Start Game" button
- [x] Audio feedback (chime on word found, victory on complete)

**Word Scramble Enhancements** 🆕
- [x] Two-phase preview flow (scripture display → ready button → game)
- [x] Full verse context before scramble challenge

**Character System**
- [x] 8 character PNGs (Hope, Marcus, Selah, Phoebe, Kai, Zola, Rhys, Juno) - LEGACY SYSTEM
- [x] Character types and context-based selection system
- [x] Character guide component
- [ ] 10-character system (Hope, Ember, Grace, Theo, Victory, Sophie, Evan, Mia, Hezekiah, Joy) - PLANNED

### ⚠️ What Needs Testing/Fixing

**Critical Issues**
- [x] Auth navigation bug (FIXED - Phase 0.1)
- [x] Route mismatch `/game-selection` → `/game-select` (FIXED - Phase 0.1)
- [x] Hearts → Oil lamps terminology consistency (FIXED - Phase 0.2)
- [ ] Games don't load real verse data (need KJV integration)
- [ ] Games use database text queries (should use static files)
- [ ] Offline mode doesn't work yet

**Missing Core Features**
- [ ] KJV static file integration (66 JSON files)
- [ ] 10-character system implementation (need to replace legacy 8-character system)
- [ ] Companion selection during onboarding
- [ ] Visual flame streak meter
- [ ] Grace Gifts system
- [ ] Context overlay (± 2 verses)
- [ ] Adaptive learning algorithm (SRS scheduling logic)
- [ ] Daily Review section on home dashboard
- [ ] Memory Match sequential card progression (designed but not implemented)
- [ ] Hint Pack monetization system
- [ ] Social features (groups, leaderboards)
- [ ] Lottie animations (using static PNGs)

---

## 🚀 PHASE 0: CRITICAL FOUNDATION FIXES ⚠️ (Week 1 - BLOCKING)

**Status:** Partially Complete  
**Goal:** Fix blocking bugs and establish KJV architecture  
**Must complete before any new features**

### 0.1 Fix Auth Navigation Bug ✅ COMPLETE
**Problem:** `navigate("/")` called during render phase, blocking all button clicks app-wide  
**Solution:** Moved navigation into `useEffect` hook with proper dependencies `[user, navigate]`  
**File:** `src/pages/Auth.tsx`  
**Status:** FIXED

### 0.1.5 Fix Game Route Mismatch ✅ COMPLETE
**Problem:** Multiple game pages navigating to `/game-selection` but App.tsx defines route as `/game-select`  
**Solution:** Updated WordSearch, ScriptureReveal, ScriptureSpinOff to use `/game-select`  
**Status:** FIXED

### 0.2 Oil Lamp Consistency ✅ COMPLETE
**Problem:** Mixed terminology between "hearts" and "oil lamps" across codebase  
**Solution:** 
- Renamed `useHearts` hook → `useOilLamp`
- Renamed functions: `loseHeart` → `burnOil`, `addHearts` → `refillOil`, `timeUntilNextHeart` → `timeUntilRefill`
- Renamed `HeartsDisplay` component → `OilLampDisplay`
- Replaced Heart icons with Flame icons across all 8 game pages
- Updated toast messages to use 🪔 emoji
- Database columns (`hearts`, `hearts_updated_at`) remain unchanged for backward compatibility

**Files Updated:**
- `src/hooks/useOilLamp.tsx`
- `src/components/OilLampDisplay.tsx`
- All 8 game pages (FillInTheBlank, VerseBuilder, QuickTap, MemoryMatch, RecallMode, WordScramble, WordSearch, PreviewMode)
- `src/components/GracePassModal.tsx`
- `src/components/GracePassIndicator.tsx`
- `src/pages/Index.tsx`

**Status:** COMPLETE

### 0.3 Sound Effects System ✅ COMPLETE
**Created:** `src/hooks/useSounds.tsx`

**Features:**
- `playChime()` - Magical chime when word found (0.5 volume)
- `playVictory()` - Celebration trumpet on game complete (0.6 volume)
- `playRefill()` - Positive sound when oil lamp restored (chime pitched up 1.2x, 0.4 volume)
- `playBurn()` - Negative sound when oil lamp lost (chime pitched down 0.7x, 0.3 volume)

**Sound Files Added:**
- `/public/sounds/chime.mp3`
- `/public/sounds/victory.mp3`

**Integration:**
- Word Search game (chime on word found, victory on complete)
- Oil lamp system (refill/burn sounds on oil changes)
- Memory Match game (victory on complete)
- Extensible to all other games

**Status:** COMPLETE

### 0.4 Game Animation & Polish ✅ COMPLETE
**Memory Match Enhancements:**
- Card flip animations with 3D perspective
- Staggered entrance animations (0.08s delay per card)
- Shake animation on incorrect matches
- Glow-pulse animation for current segment indicator cards
- Particle effects on game completion
- No oil lamp loss on wrong matches (learning-friendly)

**Word Search Enhancements:**
- Full verse text and reference display above grid
- Visual highlighting of found words in scripture text (green/gold)
- Difficulty progression mechanics:
  - Easy: No reshuffling, hints at 45s
  - Medium: Reshuffles on page leave/return, hints at 60s
  - Hard: Reshuffles after each word found, hints at 90s
- Hint system (3 free per session, purchasable packs planned)
- Preview flow with "I'm Ready" button

**Word Scramble Enhancements:**
- Two-phase flow: scripture preview → ready button → scramble game
- Full verse context before challenge begins

**Status:** COMPLETE

### 0.5 KJV Static File Integration 🔄 WAITING ON USER
**Status:** Blocked - waiting for generated KJV files

**User Must Provide:**
- 66 JSON files (Genesis.json through Revelation.json)
- `kjv.sqlite` database file

**Once Files Received:**

1. **File Placement**
   - Extract 66 JSON files → `/public/kjv_books/`
   - Place `kjv.sqlite` → `/public/data/kjv.sqlite`

2. **Create TypeScript KJV Loader** (`src/lib/loadKjvFromBook.ts`)
   - `loadBook(bookName)` - Fetch entire book JSON
   - `getChapter(book, chapter)` - Extract specific chapter
   - `getVerse(book, chapter, verse)` - Extract specific verse
   - In-memory caching for performance

3. **Service Worker Setup** (`public/sw.js`)
   - Cache-first strategy for book files
   - Enable 100% offline reading
   - Register in `src/main.tsx`

4. **Database Schema Updates**
   ```sql
   -- Make verses.text nullable (KJV uses static files)
   ALTER TABLE verses ALTER COLUMN text DROP NOT NULL;
   
   -- Create collections_verses join table (if not exists)
   CREATE TABLE IF NOT EXISTS collections_verses (
     collection_id UUID REFERENCES collections(id),
     verse_id UUID REFERENCES verses(id),
     position INT DEFAULT 1,
     PRIMARY KEY (collection_id, verse_id)
   );
   
   -- Create esv_whitelist table (500 verse copyright limit)
   CREATE TABLE IF NOT EXISTS esv_whitelist (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     reference TEXT UNIQUE NOT NULL,
     book TEXT NOT NULL,
     chapter INT NOT NULL,
     verse INT NOT NULL,
     text TEXT NOT NULL DEFAULT '',
     order_index INT NOT NULL
   );
   ```

5. **Update All 8 Game Components**
   - Replace `verses.text` queries with `getVerse()` helper
   - Strip `story_titles` from game modes (keep in Preview)
   - Maintain ESV fallback (whitelist → KJV)

**Deliverable:** All 8 games load real KJV text, work offline, no remote API calls

**Estimated Time:** 3-4 hours (once files provided)

---

## 📋 PHASE 1: CHARACTER SYSTEM OVERHAUL (Weeks 2-3)

**Goal:** Implement 10-character companion system  
**Priority:** HIGH - Foundation for emotional connection  
**Status:** Blocked - need character definitions

### Current State: 8-Character Legacy System

**Existing in Codebase:**
- `src/types/characters.ts` defines 8 characters: Hope, Marcus, Selah, Phoebe, Kai, Zola, Rhys, Juno
- `CHARACTER_SYSTEM.md` documents 8-character system (3 symbolic, 5 human)
- Character PNGs exist in `/src/assets/` for all 8 legacy characters
- Context-based character selection system implemented

**Target: 10-Character System**

### 1.1 Define New Character Roster (1 day)

**Status:** Blocked - need character definitions

**Finalized Characters for 10-Character System:**
1. ✅ **Hope** 🕊️ - Guiding Light (existing, keep from legacy)
2. 🆕 **Ember** 🔥 - Flame/Streak Guardian (new, replace Marcus)
3. 🆕 **Grace** 🌸 - Compassion & Forgiveness (new, replace Selah)
4. 🆕 **Theo** 📖 - Need role/personality definition (new)
5. 🆕 **Victory** 👑 - Achievement Celebration (new, inspired by legacy themes)
6. 🆕 **Sophie** 🌟 - Need role/personality definition (new)
7. 🆕 **Evan** 💪 - Need role/personality definition (new)
8. 🆕 **Mia** 🎨 - Need role/personality definition (new)
9. 🆕 **Hezekiah** 🦁 - Need role/personality definition (new)
10. 🆕 **Joy** 😊 - Pure Happiness (new)

**Legacy Characters Being Replaced:**
- Marcus (Scribe of Wisdom) → replaced by Theo
- Selah (Rest & Reflection) → replaced by Grace
- Phoebe (Motivator) → merged into Victory
- Kai (Disciplinarian) → merged into Evan
- Zola (Encourager) → merged into Grace
- Rhys (Challenger) → merged into Victory
- Juno (Guide) → merged into Theo

**User Must Provide:** Full personality profiles for Theo, Sophie, Evan, Mia, Hezekiah:
- Role description (celebration, difficulty, encouragement, etc.)
- Primary color theme (HSL values)
- Personality traits (2-3 key traits)
- "Appears when" contexts (when does this character show up?)
- Sample quotes (3-5 quotes)
- Animation states needed (8 per character: idle, celebrate, comfort, wave, thinking, cry, determined, teaching)

### 1.2 Update Character Type System (2 hours)

**Update:** `src/types/characters.ts`
- Expand `CharacterType` union type from 8 to 10 characters
- Add new roles: `flame_guardian`, `grace`, `wisdom`, `achievement`, etc.
- Define all 8 animation states per character (80 total states)
- Update `CHARACTERS` object with all 10 profiles
- Update `getCharacterForContext()` helper to use new roster
- Maintain backward compatibility during transition

**Update:** `CHARACTER_SYSTEM.md`
- Complete rewrite for 10-character system
- Document migration from 8-character legacy system
- Full profiles for all 10 characters
- Animation requirements (8 states × 10 = 80 files)
- "When Characters Appear" section
- Companion selection guidelines

### 1.3 Generate Static PNG Placeholders (2-3 hours)

**Generate 10 new character images using AI image generation:**
- Hope 🕊️ - Keep existing or regenerate for consistency
- Ember 🔥 - Flame character, orange/red colors, guardian theme
- Grace 🌸 - Gentle, pink/white/soft colors, compassionate expression
- Theo 📖 - (pending personality details from user)
- Victory 👑 - Triumphant, gold/purple, crown or laurel wreath
- Sophie 🌟 - (pending details)
- Evan 💪 - (pending details)
- Mia 🎨 - (pending details)
- Hezekiah 🦁 - (pending details)
- Joy 😊 - Joyful, bright colors, big smile, celebratory

**Dimensions:** 512x512px, transparent background  
**Save to:** `/src/assets/character-{name}.png`  
**Replace existing 8 legacy character PNGs**

### 1.4 Companion Selection System (1 day)

**Create:**
- `src/components/CompanionSelector.tsx` - Grid of 10 characters with descriptions
- Update `src/pages/Auth.tsx` - Add companion selection step to onboarding flow
- `src/components/CompanionDisplay.tsx` - Render chosen companion throughout app

**Database:**
```sql
-- Already exists but verify:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_companion TEXT DEFAULT 'hope';
```

**Onboarding Flow:**
1. Welcome screen (Hope introduction)
2. **Companion selection** ← NEW (choose 1 of 10)
3. Daily goal setting (1/3/5 verses per day)
4. First verse tutorial (John 3:16 guided walkthrough)
5. Celebration (first XP earned, companion celebrates)

### 1.5 Update All Character References (2 hours)

**Update all files that reference characters:**
- Game pages that show character encouragement
- `src/components/CharacterGuide.tsx`
- Context-based character appearance logic
- Character quote system

**Deliverable:** 10-character system operational, companion selection in onboarding, character system fully documented

**Estimated Time:** 2-3 weeks (blocked on user providing 5 character definitions)

---

## 📋 PHASE 2: FLAME STREAK & GRACE SYSTEM (Week 4)

**Goal:** Replace numeric streak with visual flame health system  
**Priority:** HIGH - Core engagement mechanic  
**Status:** Not Started

### 2.1 Visual Flame Streak Component (1 day)

**Create:** `src/components/FlameStreak.tsx`

**Features:**
- Animated flame with health states:
  - 🔥 Strong (green/gold glow, full flame)
  - 🔥 At Risk (yellow glow, dimming flame)
  - 💨 Critical (red glow, fading flame, almost out)
- Shows Ember mascot protecting the flame
- Color transitions based on streak health (CSS animations)
- Tooltip with actual streak count number
- Pulse animation when at risk

**Replace:** Simple numeric streak counter in `src/components/UserStats.tsx`

**Integration:** Tie flame health to streak count and last_active_date

### 2.2 Streak Revival with XP (2 hours)

**Create:** `src/components/StreakRevivalModal.tsx`

**Options when streak would break:**
1. **Use Grace Pass** (already implemented in Phase 0) - Free, limited per week
2. **Revive with XP** (NEW) - Costs 50-100 XP based on streak length
3. **Start Fresh with Grace** - Accept break, Ember comforts user

**Features:**
- Shows Ember + Grace together for revival celebration
- XP cost scales with streak length (longer streak = more expensive)
- **Never use paid currency** - XP only (grace-based monetization)
- Modal appears when user would lose streak

**Database:** Uses existing `profiles.xp`, `profiles.streak_count`, Grace Pass system

### 2.3 Weekend Amulet (Future Phase - Placeholder)

**Placeholder for future monetization:**
```sql
-- Will be needed later:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekend_amulet_active BOOLEAN DEFAULT false;
```

**Concept:** Premium item that protects streak on weekends automatically

**Deliverable:** Visual flame streak replaces numeric counter, Grace Pass + XP revival options, Ember as flame guardian

**Estimated Time:** 1 week

---

## 📋 PHASE 3: MINI-GAMES VERIFICATION & STANDARDIZATION (Weeks 5-6)

**Goal:** Ensure all 8 games work perfectly with real data  
**Priority:** CRITICAL - Core product functionality  
**Status:** Partial progress (animations and polish done, KJV integration pending)

### 3.1 Comprehensive Game Testing (1 week)

**Test Each Game End-to-End:**

**For ALL 8 games, verify:**
- ✅ Loads verse from `getVerse()` helper (not database) - BLOCKED on KJV files
- ✅ Strips `story_titles` in game modes - BLOCKED on KJV files
- ✅ Handles offline state gracefully - BLOCKED on service worker
- ✅ ESV fallback works (whitelist check → KJV) - BLOCKED on KJV files
- ✅ Deducts 1 oil lamp on wrong answer (except Memory Match)
- ✅ Awards XP on completion (10-100 range)
- ✅ Awards coins (5-20 range)
- ✅ Saves progress to `verse_progress`
- ✅ Saves game session to `game_sessions` table (Phase 4.1 schema complete)
- ✅ Updates `mastery_level` correctly
- ✅ Confetti animation on completion
- ✅ Character encouragement appears
- ✅ Progress bar/visual feedback
- ✅ Smooth transitions
- ✅ Sound effects (chime, victory, refill, burn)

**Games to Test:**
1. Preview Mode
2. Copy Mode
3. Fill-in-the-Blank
4. Word Scramble ✅ (preview flow added)
5. Verse Builder
6. Memory Match ✅ (animations complete, sequential design requirement documented but not implemented)
7. Recall Mode
8. Quick Tap

**Word Search Status:** ✅ Complete (full verse context, difficulty progression, hints, visual highlighting, audio feedback)

### 3.2 Game Features Standardization (3 days)

**Create:** `src/lib/gameEngine.ts`

**Centralized utilities:**
- `calculateGameReward()` - XP/coin calculation with accuracy multiplier
- `handleGameCompletion()` - Update progress, award XP/coins, check level-up, log to `game_sessions`
- `burnOilLamp()` - Update oil lamps, show "Out of Oil" modal, play burn sound
- `playGameSounds()` - Integrate sound effects system

**Update all 8 game pages** to use these utilities (DRY principle)

### 3.3 Memory Match Sequential Design Implementation (2 days) 🆕

**Requirement:** Cards must progress sequentially through verse in narrative order (not random matching)

**Design Spec:**
- First card pair: "for god so loved the world" text + "John 3:16" reference
- Second card pair: "he gave his only begotten son" text + continuation marker
- Third card pair: "whosoever believeth in him" text + continuation
- Continue through full verse structure in order

**Implementation:**
- Rewrite card generation logic to create sequential segments
- Label cards with clear instructions about sequential matching
- Users must match pairs in verse order (not random)
- This pedagogical design helps users internalize verse flow and story arc

**Status:** Designed but not implemented (current implementation uses random matching)

### 3.4 Game Selection Flow Polish (1 day)

**Update:** `src/components/GameSelectionScreen.tsx`

**Show 4-stage progression clearly:**
- 🟢 **LEARN** (Mastery 0): Preview, Copy
- 🟡 **PRACTICE** (Mastery 1): Fill-in-Blank, Scramble, Builder
- 🔴 **MASTER** (Mastery 2+): Memory, Recall, Quick Tap
- ⭐ **REVIEW**: Spaced repetition (mixed verses)

**Features:**
- Lock games until previous stage completed
- Show XP preview for each game
- Character appears with stage-appropriate tip
- Display oil lamp cost (deducted on wrong answers)
- Show hint availability for applicable games

**Deliverable:** All 8 games work perfectly with KJV, standardized reward system, polished UX, sequential Memory Match

**Estimated Time:** 2 weeks (blocked on Phase 0.5 KJV integration)

---

## 📋 PHASE 4: ADAPTIVE LEARNING ENGINE (Weeks 7-8)

**Goal:** Implement spaced repetition system  
**Priority:** HIGH - Retention core mechanic  
**Status:** Phase 4.1 Database Schema COMPLETE, Algorithm & UI Pending

### 4.1 Spaced Repetition Database Schema ✅ COMPLETE

**Status:** COMPLETE - Migration executed successfully

**Added to `verse_progress` table:**
- `strength_score` (DECIMAL 3,2) - SRS metric 0.00-5.00 scale
- `next_review_date` (TIMESTAMPTZ) - When verse should be reviewed next
- `avg_completion_time` (INTEGER) - Average time in seconds for completion
- `stage` (TEXT) - Current mastery stage: Learning/Practice/Master/Review
- `games_completed` (TEXT[]) - Array tracking which game types user has completed for this verse
- `last_review_interval` (INTEGER) - Days since last review (for SM-2 algorithm)
- `ease_factor` (DECIMAL 3,2) - SM-2 ease factor (default 2.5)

**Created `game_sessions` table:**
- Logs every individual game attempt for adaptive learning
- Columns: `user_id`, `verse_id`, `game_type`, `completed_at`, `completion_time` (seconds), `accuracy` (0-100), `attempts` (count), `xp_earned`, `coins_earned`
- RLS policies for user access control
- Indexes for efficient querying

**Enables:**
- Personalized difficulty adaptation
- Weak verse identification via accuracy patterns
- Game type preference analysis
- Comprehensive mastery verification (all 8 games, 5+ days, consistent accuracy)

### 4.2 Spaced Repetition Algorithm (1 week)

**Create:** `src/lib/spacedRepetition.ts`

**Simplified SM-2 Algorithm:**
- `calculateNextReviewDate(strength, ease_factor, last_interval)` - Intervals: 1d → 3d → 1w → 2w → 1m
- `calculateVerseStrength(accuracy, time, attempts)` - Score 0-5 based on performance metrics
- `updateStrengthScore(verseId, gameResult)` - Updates after each game session
- Decrease interval if wrong/low accuracy
- Increase interval if correct/high accuracy
- Use `ease_factor` to adjust difficulty curve per verse

**Mastery Requirements (Duolingo Model):**
Verses only reach "Mastered" status after:
1. Passing hard mode for the specific scripture
2. Practicing across ALL 8 mini-games (not just one game)
3. Practicing across minimum 5 separate days with minimum 3-day gaps between stage advancement
4. Demonstrated ability to recite scripture from memory without hints (Recall Mode 100% accuracy)

**Verse Mixing Strategy (Future Design):**
- Initial Learning/Practice: Intensive focus on one verse (all 8 games)
- Master/Review: Mixed-verse review mode (rotate between multiple scriptures)
- Prevents boredom, builds broader retention
- Exact transition point and mixing ratio TBD

**Database Functions:**
```sql
-- Already created, needs testing:
CREATE OR REPLACE FUNCTION get_verses_due_for_review(p_user_id UUID, p_limit INT)
RETURNS TABLE (verse_id UUID, reference TEXT, strength_score DECIMAL, next_review_date TIMESTAMPTZ);

-- Prioritize weakest verses first (strength < 3.0)
```

### 4.3 Daily Review Section (2 days)

**Update:** `src/pages/Index.tsx`

**Add "📚 Daily Review" section below Daily Verse:**
- Shows 3-5 verses due for review today (`next_review_date <= NOW()`)
- Priority: weakest verses first (`strength_score < 3.0`)
- Each verse card shows:
  - Reference (e.g., "John 3:16")
  - Preview text (first 10 words)
  - Strength indicator (⭐⭐☆☆☆ visual stars)
  - Last practiced date
  - "Review Now" button
- Clicking opens game selection with review context

**Create:** `src/hooks/useReviewQueue.tsx`
- Fetches verses due for review
- Calculates priority order
- Real-time updates when verses completed

### 4.4 Verse Difficulty Auto-Calculation (1 day)

**Create:** `src/lib/difficultyCalculator.ts`

**Calculate difficulty (1-5 stars) based on:**
- Word count (longer = harder)
- Syllable complexity (multisyllabic words)
- Archaic language frequency ("thee", "thou", "hath", "ye")
- Proper noun density
- Store in `verses.difficulty` column

**Run migration script** to calculate difficulty for all existing verses

**Use for:**
- XP reward scaling (harder verses = more XP)
- Game mode unlocking (Master stage only for 3+ difficulty)
- User progression pacing

**Deliverable:** Smart review system adapts to user retention patterns, personalized daily review queue, mastery requires multi-day practice

**Estimated Time:** 2 weeks

---

## 📋 PHASE 5: ENGAGEMENT FEATURES (Weeks 9-10)

**Goal:** Grace Gifts + Context Overlay + Quest enhancements  
**Priority:** MEDIUM - Increases stickiness  
**Status:** Not Started

### 5.1 Grace Gifts System (1 week)

**Create:** `src/components/GraceGiftBox.tsx`

**Features:**
- Animated gift box appears randomly (15% chance after game completion)
- Tap to open, reveals one reward with celebration animation
- Reward types:
  - **Double XP Token** - Next 3 games earn 2× XP
  - **Verse Hint Pass** - Reveal 2 words in any game
  - **Swap Pass** - Skip one difficult verse without penalty
  - **+25 Coin Boost** - Instant coins
  - **+2 Oil Lamp Refill** - Restore 2 lamps immediately
- Character appears: Victory or Joy with celebration animation
- Gift box has shimmer/glow effect

**Database:**
```sql
-- Verify exists from Phase 4.1:
CREATE TABLE IF NOT EXISTS user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  item_type TEXT NOT NULL CHECK (item_type IN ('double_xp', 'hint_pass', 'swap_pass', 'coin_boost', 'oil_refill')),
  quantity INT DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Update all game pages** to:
- Check for active boosts (double XP, hint pass, swap pass)
- Apply multipliers before XP calculation
- Show active boost indicator in UI

### 5.1.5 Hint Pack Purchase System (3 days) 🆕

**Status:** PLANNED - Monetization feature for game hints

**Features:**
- In-game hint packs available for purchase with coins (not real money)
- Each game allows 3 free hints per session
- Hint availability timer based on difficulty:
  - Easy mode: 45 seconds
  - Medium mode: 60 seconds
  - Hard mode: 90 seconds
- Purchase options when hints depleted:
  - **5 Hints Pack:** 50 coins
  - **15 Hints Pack:** 120 coins (20% discount)
  - **50 Hints Pack:** 300 coins (40% discount)

**Supported Games:**
- Word Search (primary - already implemented)
- Fill-in-the-Blank (future)
- Verse Builder (future)
- Recall Mode (future)

**Database:**
```sql
-- Expand user_items for hint packs:
ALTER TABLE user_items 
ADD COLUMN IF NOT EXISTS hint_pack_size INT DEFAULT 0;

-- Track hint usage per game session:
CREATE TABLE IF NOT EXISTS hint_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  verse_id UUID REFERENCES verses(id),
  game_type TEXT NOT NULL,
  hints_used INT DEFAULT 0,
  hints_remaining INT DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Create:** `src/components/HintPackModal.tsx`
- Appears when user clicks "Buy More Hints" button
- Shows current coin balance
- Three pack options with coin costs and discounts
- Purchase confirmation
- Character encouragement (Grace or Sophie)

**UI/UX:**
- Word Search shows "Hints: X/3 used" counter
- "Use Hint" button activates after timer threshold
- "Buy More Hints" button appears when depleted
- Hints stored in `user_items` table, deducted per use

**Deliverable:** Optional monetization path for power users, grace-based (not required to play)

### 5.2 Context Overlay System (1 week)

**Create:** `src/components/ContextOverlay.tsx`

**Displays when verse reference is tapped anywhere in app:**
- Current verse (highlighted with background color)
- ± 2 surrounding verses (context before and after)
- "View Full Chapter" button → opens ChapterReaderKJV
- Audio narration button (placeholder for Voice Coach feature)
- Bookmark functionality (add verse to favorites)
- Share verse button (copy reference + text)

**Create:** `src/components/ChapterReaderKJV.tsx`
- Full chapter reading mode
- Verse numbers inline
- Highlight specific verse (scroll to position)
- Previous/Next chapter navigation
- Breadcrumb trail (Book → Chapter)
- Loads from KJV static files

**Integration Points:**
- Verse cards throughout app become tappable
- Daily Verse component
- Game completion screens
- Review queue
- Path nodes

### 5.3 Daily Quest Enhancements (2 days)

**Already implemented in Phase 0, enhance with:**
- **Grace Gift rewards** for completing all 3 quests in one day
- Character celebrations when quest completed (Hope + Victory combo)
- Quest streaks (7 consecutive days = special badge)
- Quest history view (last 7 days)

**Add:**
```sql
-- Verify exists:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quest_streak INT DEFAULT 0;
```

**Track:**
- Daily quest completion rate
- Quest streak length
- Favorite quest types

**Deliverable:** Grace Gifts add surprise joy, context encourages deeper scripture study, hint packs provide optional monetization

**Estimated Time:** 2 weeks

---

## 📋 PHASE 6: SOCIAL FEATURES (Weeks 11-12)

**Goal:** Groups, leaderboards, Group Blessings  
**Priority:** MEDIUM - Community building  
**Status:** Not Started

### 6.1 Group System Foundations (1 week)

**Database Schema:**
```sql
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL CHECK (LENGTH(invite_code) = 6),
  admin_id UUID REFERENCES profiles(user_id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  PRIMARY KEY (group_id, user_id)
);

-- RLS policies:
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups viewable by members" ON groups FOR SELECT USING (
  id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Group members viewable by group members" ON group_members FOR SELECT USING (
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);
```

**Create:**
- `src/pages/Groups.tsx` - Create/join groups, view joined groups
- `src/components/GroupCard.tsx` - Group display with member count
- `src/components/CreateGroupModal.tsx` - Group creation form
- `src/components/JoinGroupModal.tsx` - Join via 6-character invite code
- Generate random 6-character alphanumeric invite codes (uppercase, no ambiguous chars)

**Features:**
- Create group with name and description
- Generate unique invite code
- Join group via invite code
- Leave group
- Admin can edit group details

### 6.2 Leaderboards (3 days)

**Create:** `src/pages/GroupLeaderboard.tsx`

**Displays top 20 members by three metrics:**
1. **XP This Week** (resets every Monday)
2. **Total Verses Memorized** (lifetime)
3. **Current Streak Count** (consecutive days)

**Features:**
- Three tabs for each metric
- User's own rank highlighted
- Profile pictures (avatars)
- Display names
- Rank indicators (🥇🥈🥉 for top 3)
- Update every 5 minutes

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION get_group_leaderboard(
  p_group_id UUID, 
  p_metric TEXT, 
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  user_id UUID, 
  display_name TEXT,
  xp_this_week INT,
  total_verses INT,
  streak_count INT,
  rank INT
);
```

**Real-time Updates:**
- Use Supabase Realtime subscriptions
- Update leaderboard when any member completes verse
- Smooth animations for rank changes

### 6.3 Group Blessings Quest (2 days)

**Create:** `src/components/GroupBlessingQuest.tsx`

**Weekly Shared Goal:**
- "Complete 100 verses as a group this week"
- Progress bar shows aggregate completion (all members)
- Individual contribution shown
- If met by Sunday: **1.5× XP boost for all members next week**
- Victory + Hope celebration animation on completion
- Notification to all members when quest completed

**Features:**
- Updates in real-time as members complete verses
- Shows top contributors
- Countdown timer to Sunday midnight
- Weekly reset (Monday 00:00)

**Database:**
```sql
CREATE TABLE IF NOT EXISTS group_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  target_value INT NOT NULL DEFAULT 100,
  current_progress INT DEFAULT 0,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- RLS policies
ALTER TABLE group_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group quests viewable by group members" ON group_quests FOR SELECT USING (
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);
```

**Update Trigger:**
```sql
-- Auto-increment current_progress when member completes verse
CREATE OR REPLACE FUNCTION increment_group_quest_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE group_quests
  SET current_progress = current_progress + 1
  WHERE group_id IN (
    SELECT group_id FROM group_members WHERE user_id = NEW.user_id
  )
  AND week_start <= CURRENT_DATE
  AND week_end >= CURRENT_DATE
  AND completed = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_quest_verse_completed
AFTER INSERT ON verse_progress
FOR EACH ROW
WHEN (NEW.mastery_level > 0)
EXECUTE FUNCTION increment_group_quest_progress();
```

**Deliverable:** Groups, leaderboards, shared goals operational, spiritual accountability and social energy

**Estimated Time:** 2 weeks

---

## 📋 PHASE 7: POLISH & OPTIMIZATION (Weeks 13-14)

**Goal:** Lottie animations + performance + onboarding polish  
**Priority:** HIGH - Production readiness  
**Status:** Not Started (some game polish already complete in Phase 0/3)

### 7.1 Lottie Animation Integration (1 week)

**Once 80 animation files ready** (8 states × 10 characters):

**Create:** `src/components/LottieCharacter.tsx`
- Loads from `/public/characters/{characterId}/animations/{characterId}_{state}.json`
- Falls back to static PNG if animation missing
- Context-aware states:
  - **idle** - Default waiting state
  - **celebrate** - Victory, completion, rewards
  - **comfort** - Grace, encouragement, missed day
  - **wave** - Hello, greeting, onboarding
  - **thinking** - Difficulty, choosing, processing
  - **cry** - Sadness, empathy, lost streak
  - **determined** - Motivation, challenge, push
  - **teaching** - Instruction, guidance, tips

**File Structure:**
```
/public/characters/
  /hope/animations/hope_idle.json
  /hope/animations/hope_celebrate.json
  ...
  /ember/animations/ember_idle.json
  /ember/animations/ember_celebrate.json
  ...
```

**Update all character appearances** to use `<LottieCharacter character="hope" state="celebrate" />`

**Optimization:**
- Target file size: 15-30KB per animation
- Use Lottie Bodymovin plugin compression
- Lazy load animations (not all 80 at once)
- Preload only currently selected companion's animations

**Note:** Phase 0/3 game polish (card flips, shake, glow-pulse, particles) already uses CSS/canvas animations and does not require Lottie files.

### 7.2 Performance Optimization (3 days)

**1. Prefetch Hot Books**
- Create `src/lib/prefetchHotBooks.ts`
- Prefetch top 5 books: John, Psalms, Genesis, Matthew, Romans
- Background fetch (doesn't block UI)
- Triggered on app load after 2 seconds

**2. Asset Optimization**
- Compress all PNGs using TinyPNG (target 50-70% reduction)
- Optimize Lottie sizes (target: 15-30KB per file)
- Enable Brotli compression on hosting
- Lazy load images below the fold

**3. Database Indexing**
```sql
-- Create performance indexes:
CREATE INDEX IF NOT EXISTS verse_progress_user_mastery_idx ON verse_progress(user_id, mastery_level);
CREATE INDEX IF NOT EXISTS verse_progress_review_date_idx ON verse_progress(next_review_date);
CREATE INDEX IF NOT EXISTS verse_progress_user_verse_idx ON verse_progress(user_id, verse_id);
CREATE INDEX IF NOT EXISTS profiles_streak_idx ON profiles(streak_count DESC);
CREATE INDEX IF NOT EXISTS game_sessions_user_verse_idx ON game_sessions(user_id, verse_id);
```

**4. Query Optimization**
- Use `.select('col1, col2')` instead of `*` (reduce payload)
- Pagination for leaderboards (20 per page, load more)
- Cache user profile in React Context (avoid repeated fetches)
- Use `useMemo` for expensive calculations

**5. Service Worker Caching**
- Cache all 66 KJV book files
- Cache character PNGs/Lottie animations
- Cache static assets (CSS, JS)
- Network-first for user data, cache-first for static content

### 7.3 Onboarding Flow Refinement (2 days)

**Update:** `src/pages/Auth.tsx`

**New 6-Step Flow:**
1. **Welcome Screen** - Hope introduces Scripture Quest
2. **Companion Selection** - Choose 1 of 10 spiritual buddies
3. **Avatar Customization** (future: seed-based generation) - Placeholder for now
4. **Daily Goal Setting** - 1 verse (easy) / 3 verses (moderate) / 5 verses (intense)
5. **First Verse Tutorial** - John 3:16 guided walkthrough (Preview → Copy → Fill-in-Blank)
6. **Celebration** - First XP earned, companion celebrates with you

**Track:**
```sql
-- Verify exists:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
```

**Analytics:**
- Track drop-off at each step
- Completion rate per step
- Average time per step

**Goal:** >70% complete all 6 steps

### 7.4 Comprehensive Testing (3 days)

**Functional Testing:**
- All 8 games with various verses (short, long, difficult)
- Offline mode (airplane mode test)
- ESV whitelist fallback (online → offline transition)
- Streak edge cases (midnight, timezone changes)
- Grace Pass activation (free vs premium)
- Oil lamp regeneration timer accuracy
- Sound effects on/off toggle
- Group creation/joining flow
- Leaderboard real-time updates

**Performance Targets:**
- First book load: <200ms
- Cached book load: <50ms
- Verse lookup: <5ms
- Game load: <1 second
- Audio playback latency: <100ms
- Lighthouse score: >90 (Performance, Accessibility, Best Practices, SEO)

**Cross-Device Testing:**
- iOS Safari (iPhone 12+, iPad)
- Android Chrome (Pixel, Samsung)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet landscape/portrait orientation
- Small screens (iPhone SE) to large (iPad Pro)

**Accessibility:**
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios (WCAG AA)
- Touch target sizes (44x44px minimum)

**Deliverable:** Production-ready app, optimized, polished, <1s load time, zero critical bugs

**Estimated Time:** 2 weeks

---

## 📊 SUCCESS METRICS BY PHASE

### Phase 0 Complete When:
- ✅ Auth navigation bug fixed
- ✅ Route mismatch fixed (`/game-select`)
- ✅ Oil lamp terminology consistent across codebase
- ✅ Sound effects system implemented (chime, victory, refill, burn)
- ✅ Game animations and polish complete (Memory Match, Word Search)
- ⏳ All 8 games load real KJV text from static files
- ⏳ Offline mode functional (service worker)
- ⏳ No database text queries for KJV verses

### Phase 1 Complete When:
- ✅ 10 characters fully documented (personalities, roles, quotes, colors)
- ✅ Placeholder PNGs for all 10 characters (512x512px)
- ✅ `src/types/characters.ts` updated with 10-character system
- ✅ `CHARACTER_SYSTEM.md` rewritten for 10-character roster
- ✅ Companion selection integrated into onboarding flow
- ✅ Selected companion displays throughout app
- ✅ Legacy 8-character system fully replaced

### Phase 2 Complete When:
- ✅ Visual flame component replaces numeric streak counter
- ✅ Ember appears as flame guardian during protection
- ✅ XP-based streak revival functional (50-100 XP cost)
- ✅ Grace Pass + Flame protection integrated
- ✅ Flame health states (Strong/At Risk/Critical) implemented

### Phase 3 Complete When:
- ✅ All 8 games tested end-to-end with KJV data
- ✅ Standardized reward system (`gameEngine.ts`)
- ✅ Character encouragement appears in all games
- ✅ Memory Match sequential card progression implemented
- ✅ Sound effects in all games (chime, victory, burn, refill)
- ✅ Oil lamp deduction on wrong answers (except Memory Match)
- ✅ Confetti and celebrations on completion
- ✅ Zero critical bugs

### Phase 4 Complete When:
- ✅ Database schema complete (SRS columns, `game_sessions` table)
- ✅ SRS algorithm calculates review dates (`spacedRepetition.ts`)
- ✅ "Daily Review" section on home dashboard
- ✅ Weak verses auto-resurface (strength < 3.0 priority)
- ✅ Strength scores update after each game
- ✅ Mastery requires 8 games, 5+ days, hard mode, recitation

### Phase 5 Complete When:
- ✅ Grace Gifts appear randomly (15% rate) after game completion
- ✅ Grace Gift rewards include Double XP, Hint Pass, Swap Pass, Coins, Oil Refill
- ✅ Context overlay shows ± 2 verses on tap
- ✅ Chapter reader functional (full chapter view)
- ✅ Daily quests award Grace Gifts
- ✅ User items tracked in database
- ✅ Hint Pack purchase system implemented (coins, not money)

### Phase 6 Complete When:
- ✅ Users can create/join groups via 6-character invite codes
- ✅ Group leaderboard displays top 20 by XP/verses/streak
- ✅ Group Blessings Quest tracks weekly aggregate progress
- ✅ 1.5× XP boost awarded when group meets goal
- ✅ Invites work smoothly
- ✅ Real-time leaderboard updates

### Phase 7 Complete When:
- ✅ Lottie animations integrated for all 10 characters (80 files)
- ✅ Performance targets met (<200ms book load, <50ms cached, >90 Lighthouse)
- ✅ 100% offline capability (all KJV books cached)
- ✅ Onboarding >70% completion rate
- ✅ Zero critical bugs
- ✅ Cross-device testing complete

---

## 🚨 CRITICAL BLOCKERS

### Blocking Everything:
1. ⚠️ **MUST PROVIDE:** KJV files (66 JSONs + SQLite) - Python script outputs
2. ✅ **FIXED:** Auth navigation bug (moved to useEffect)
3. ✅ **FIXED:** Route mismatch (all games use `/game-select`)
4. ✅ **FIXED:** Oil lamp terminology consistency

### Blocking Phase 1:
5. ⚠️ **MUST DEFINE:** Full personalities for Theo, Sophie, Evan, Mia, Hezekiah (5 characters)
   - Role description, color theme, personality traits, "appears when" contexts, sample quotes
6. ⚠️ **MUST GENERATE:** Static PNGs for 10 new characters (512x512px, transparent)

### Blocking Phase 3:
7. ⚠️ **MUST IMPLEMENT:** Memory Match sequential card progression (designed but not coded)
8. ⚠️ **MUST COMPLETE:** KJV integration (Phase 0.5) before full game testing

### Blocking Phase 7:
9. ⏳ **FUTURE:** Lottie files (80 total: 8 states × 10 characters)
   - Can proceed with static placeholders until ready

---

## 📅 TIMELINE SUMMARY

| Phase | Description | Weeks | Status | Completion % |
|-------|-------------|-------|--------|-------------|
| **Phase 0** | Foundation Fixes (Auth, KJV, Oil Lamps, Sounds) | Week 1 | 🔄 75% Complete | 75% |
| **Phase 1** | Character System (10 companions) | Weeks 2-3 | ⏳ Blocked | 0% |
| **Phase 2** | Flame Streak & Grace | Week 4 | ⏳ Not Started | 0% |
| **Phase 3** | Games Verification & Standardization | Weeks 5-6 | 🔄 40% Complete | 40% |
| **Phase 4** | Adaptive Learning (SRS) | Weeks 7-8 | 🔄 30% Complete | 30% |
| **Phase 5** | Engagement Features | Weeks 9-10 | ⏳ Not Started | 0% |
| **Phase 6** | Social Features | Weeks 11-12 | ⏳ Not Started | 0% |
| **Phase 7** | Polish & Optimization | Weeks 13-14 | ⏳ Not Started | 0% |

**MVP Launch:** After Phase 6 (Week 12)  
**Full Launch:** After Phase 7 (Week 14)

---

## 🎯 PRIORITY SUMMARY

**Critical (Must Have for MVP):**
- Phase 0: Foundation fixes ✅ (75% complete)
- Phase 1: 10-character system ⏳ (blocked on definitions)
- Phase 2: Flame streak ⏳
- Phase 3: Games working perfectly 🔄 (40% complete)
- Phase 4: Adaptive learning 🔄 (30% complete)

**Important (Should Have):**
- Phase 5: Grace Gifts + Context
- Phase 6: Social features

**Polish (Nice to Have):**
- Phase 7: Lottie animations + optimization

---

## 🆕 ARCHITECTURE NOTES

### Sound System Architecture
**Hook:** `src/hooks/useSounds.tsx`

**API:**
- `playChime()` - Magical chime on word found (0.5 volume)
- `playVictory()` - Celebration on game complete (0.6 volume)
- `playRefill()` - Oil lamp restored (chime pitched up 1.2x, 0.4 volume)
- `playBurn()` - Oil lamp lost (chime pitched down 0.7x, 0.3 volume)

**Files:**
- `/public/sounds/chime.mp3`
- `/public/sounds/victory.mp3`

**Integration:** Word Search, Memory Match, oil lamp system, extensible to all games

**Future:** User preference toggle to mute/unmute sounds (localStorage)

### Mastery System (Duolingo Model)
**Progression:** Learning → Practice → Master → Review

**Requirements for "Mastered" Status:**
1. Pass hard mode for the scripture
2. Practice across ALL 8 mini-games
3. Practice across 5+ separate days (minimum 3-day gaps between stages)
4. Demonstrate recitation ability (Recall Mode 100% accuracy)

**Verse Mixing Strategy (Future):**
- Initial Learning/Practice: One verse at a time (all 8 games)
- Master/Review: Mixed-verse rotation (prevent boredom, build retention)
- Transition point and mixing ratio TBD

### ESV Whitelist Compliance
- ESV preview text limited to exactly 500 whitelisted verses
- Stored in `esv_whitelist` table
- ESV only displays when user online AND verse in whitelist
- Offline or non-whitelisted verses automatically fall back to KJV
- ESV attribution must always be displayed
- 500-verse limit prevents copyright violations

### Database Schema Notes
**Tables to be Created/Verified:**
- `collections_verses` (join table for many-to-many)
- `esv_whitelist` (500 verse copyright limit)
- `user_items` (Grace Gifts, hint packs, boosts)
- `groups`, `group_members`, `group_quests` (Phase 6 social)
- `hint_usage_log` (hint pack monetization tracking)

**Profiles Columns to be Added:**
- `selected_companion` (10-character system)
- `quest_streak` (daily quest completion tracking)
- `weekend_amulet_active` (future premium feature)
- `onboarding_completed` (track onboarding flow completion)

---

## 📝 NEXT IMMEDIATE ACTIONS

**This Week (Complete Phase 0):**
1. ✅ Fix auth navigation bug - COMPLETE
2. ✅ Fix route mismatch - COMPLETE
3. ✅ Oil lamp terminology consistency - COMPLETE
4. ✅ Sound effects system - COMPLETE
5. ✅ Game animations and polish - COMPLETE
6. ⏳ User provides KJV files (66 JSONs + SQLite) - WAITING
7. ⏳ User defines 5 remaining character personalities - WAITING

**Next Week (Phase 0 Completion + Phase 1 Start):**
8. Integrate KJV static files once received
9. Create `loadKjvFromBook.ts` loader utilities
10. Set up service worker for offline caching
11. Update all 8 games to use KJV loader
12. Test games end-to-end with real data
13. Generate 10 character PNGs once personalities defined
14. Update `src/types/characters.ts` for 10-character system
15. Rewrite `CHARACTER_SYSTEM.md`

---

**Last Updated:** Phase 0 - 75% Complete (Auth fixed, oil lamp system complete, sound effects implemented, game polish complete, awaiting KJV files + character definitions)