# Scripture Quest - 7-Phase Implementation Roadmap

**A Duolingo-inspired, character-guided mobile platform for joyful, gamified Bible verse mastery.**

**Target Timeline:** 14 weeks (3.5 months)  
**Current Status:** Phase 0 - Foundation Fixes (Week 1)

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
- [x] Database tables: `profiles`, `collections`, `verses`, `verse_progress`, `daily_quests`, `path_nodes`
- [x] Row Level Security (RLS) policies
- [x] Hearts system (5 hearts, regeneration)
- [x] XP, coins, streak tracking
- [x] Daily quests system (Phase 1.2)
- [x] Grace Pass system (Phase 1.2)

**UI Components Built**
- [x] Hero section with character (Hope)
- [x] Daily Verse component
- [x] Features section
- [x] Games hub display
- [x] Profile dashboard mockup
- [x] Call-to-action sections
- [x] Path-based navigation (Duolingo-style vertical scroll)
- [x] User stats display
- [x] Hearts display with regeneration
- [x] Grace Pass modal and indicator

**8 Mini-Games Created**
- [x] Preview Mode (LEARN stage)
- [x] Copy Mode (LEARN stage)
- [x] Fill-in-the-Blank (PRACTICE stage)
- [x] Word Scramble (PRACTICE stage)
- [x] Verse Builder (PRACTICE stage)
- [x] Memory Match (MASTER stage)
- [x] Recall Mode (MASTER stage)
- [x] Quick Tap (MASTER stage)

**Character System**
- [x] 8 character PNGs (Hope, Marcus, Selah, Phoebe, Kai, Zola, Rhys, Juno)
- [x] Character types and basic system
- [x] Character guide component

### ⚠️ What Needs Testing/Fixing

**Critical Issues**
- [x] Auth navigation bug (FIXED - Phase 0.1 complete)
- [ ] Games don't load real verse data (need KJV integration)
- [ ] Games use database text queries (should use static files)
- [ ] Offline mode doesn't work yet

**Missing Core Features**
- [ ] KJV static file integration
- [ ] 10-character system (need 9 new characters)
- [ ] Companion selection during onboarding
- [ ] Visual flame streak meter
- [ ] Grace Gifts system
- [ ] Context overlay (± 2 verses)
- [ ] Adaptive learning/spaced repetition
- [ ] Social features (groups, leaderboards)
- [ ] Lottie animations (using static PNGs)

---

## 🚀 PHASE 0: CRITICAL FOUNDATION FIXES ⚠️ (Week 1 - BLOCKING)

**Status:** In Progress  
**Goal:** Fix blocking bugs and establish KJV architecture  
**Must complete before any new features**

### 0.1 Fix Auth Navigation Bug ✅ COMPLETE
**Problem:** `navigate("/")` called during render phase, blocking all button clicks app-wide  
**Solution:** Moved navigation into `useEffect` hook  
**Status:** FIXED

### 0.2 KJV Static File Integration 🔄 WAITING ON USER
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
   
   -- Create collections_verses join table
   CREATE TABLE collections_verses (
     collection_id UUID REFERENCES collections(id),
     verse_id UUID REFERENCES verses(id),
     position INT DEFAULT 1,
     PRIMARY KEY (collection_id, verse_id)
   );
   
   -- Create esv_whitelist table (500 verse copyright limit)
   CREATE TABLE esv_whitelist (
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

### 1.1 Define New Character Roster (1 day)

**Status:** Blocked - need character definitions

**Finalized Characters:**
1. ✅ **Hope** 🕊️ - Guiding Light (existing)
2. ✅ **Ember** 🔥 - Flame/Streak Guardian (defined)
3. ✅ **Grace** 🌸 - Compassion & Forgiveness (defined)
4. ⚠️ **Theo** 📖 - Need role/personality definition
5. ✅ **Victory** 👑 - Achievement Celebration (defined)
6. ⚠️ **Sophie** 🌟 - Need role/personality definition
7. ⚠️ **Evan** 💪 - Need role/personality definition
8. ⚠️ **Mia** 🎨 - Need role/personality definition
9. ⚠️ **Hezekiah** 🦁 - Need role/personality definition
10. ✅ **Joy** 😊 - Pure Happiness (defined)

**User Must Provide:** Full personality profiles for Theo, Sophie, Evan, Mia, Hezekiah:
- Role description
- Primary color theme
- Personality traits
- "Appears when" contexts (when does this character show up?)
- Sample quotes (3-5)

### 1.2 Update Character Type System (2 hours)

**Update:** `src/types/characters.ts`
- Expand `CharacterType` to 10 characters
- Add new roles: `flame_guardian`, `grace`, `wisdom`, etc.
- Define animation states (8 per character)
- Update `CHARACTERS` object with all 10 profiles
- Update `getCharacterForContext()` helper

### 1.3 Generate Static PNG Placeholders (2-3 hours)

**Generate 9 new character images using AI:**
- Ember 🔥 - Flame character, orange/red colors
- Grace 🌸 - Gentle, pink/white colors, compassionate
- Theo 📖 - (pending personality details)
- Victory 👑 - Triumphant, gold/purple, crown
- Sophie 🌟 - (pending details)
- Evan 💪 - (pending details)
- Mia 🎨 - (pending details)
- Hezekiah 🦁 - (pending details)
- Joy 😊 - Joyful, bright colors, big smile

**Dimensions:** 512x512px, transparent background  
**Save to:** `/src/assets/character-{name}.png`

### 1.4 Companion Selection System (1 day)

**Create:**
- `src/components/CompanionSelector.tsx` - Grid of 10 characters
- Update `src/pages/Auth.tsx` - Add companion selection step to onboarding
- `src/components/CompanionDisplay.tsx` - Render chosen companion

**Database:**
```sql
ALTER TABLE profiles ADD COLUMN selected_companion TEXT DEFAULT 'hope';
```

**Onboarding Flow:**
1. Welcome screen (Hope introduction)
2. **Companion selection** ← NEW
3. Daily goal setting (1/3/5 verses)
4. First verse tutorial (John 3:16)
5. Celebration

### 1.5 Update Documentation (3 hours)

**Update:** `CHARACTER_SYSTEM.md`
- Complete rewrite for 10-character system
- Full profiles for all 10 characters
- Animation requirements (8 states × 10 = 80 files)
- "When Characters Appear" section
- Companion selection guidelines

**Deliverable:** 10-character system operational, companion selection in onboarding

**Estimated Time:** 2-3 weeks

---

## 📋 PHASE 2: FLAME STREAK & GRACE SYSTEM (Week 4)

**Goal:** Replace numeric streak with visual flame health system  
**Priority:** HIGH - Core engagement mechanic

### 2.1 Visual Flame Streak Component (1 day)

**Create:** `src/components/FlameStreak.tsx`

**Features:**
- Animated flame with health states:
  - 🔥 Strong (green/gold glow)
  - 🔥 At Risk (yellow glow, dimming)
  - 💨 Critical (red glow, fading)
- Shows Ember mascot protecting flame
- Color transitions based on streak health
- Tooltip with streak count

**Replace:** Simple streak counter in `src/components/UserStats.tsx`

### 2.2 Streak Revival with XP (2 hours)

**Create:** `src/components/StreakRevivalModal.tsx`

**Options when streak would break:**
1. Use Grace Pass (already implemented)
2. Revive with XP (NEW - costs 50-100 XP)
3. Start Fresh with Grace (accept break)

**Never use paid currency** - XP only  
**Shows:** Ember + Grace together for revival celebration

### 2.3 Weekend Amulet (Future Phase)

**Placeholder for future:**
```sql
ALTER TABLE profiles ADD COLUMN weekend_amulet_active BOOLEAN DEFAULT false;
```

**Deliverable:** Visual flame streak replaces counter, Grace Pass + XP revival options

**Estimated Time:** 1 week

---

## 📋 PHASE 3: MINI-GAMES VERIFICATION & STANDARDIZATION (Weeks 5-6)

**Goal:** Ensure all 8 games work perfectly with real data  
**Priority:** CRITICAL - Core product functionality

### 3.1 Comprehensive Game Testing (1 week)

**Test Each Game End-to-End:**

**For ALL 8 games, verify:**
- ✅ Loads verse from `getVerse()` helper (not database)
- ✅ Strips `story_titles` in game modes
- ✅ Handles offline state gracefully
- ✅ ESV fallback works (whitelist check → KJV)
- ✅ Deducts 1 heart on wrong answer
- ✅ Awards XP on completion (10-100 range)
- ✅ Awards coins (5-20 range)
- ✅ Saves progress to `verse_progress`
- ✅ Updates `mastery_level` correctly
- ✅ Confetti animation on completion
- ✅ Character encouragement appears
- ✅ Progress bar/visual feedback
- ✅ Smooth transitions

**Games to Test:**
1. Preview Mode
2. Copy Mode
3. Fill-in-the-Blank
4. Word Scramble
5. Verse Builder
6. Memory Match
7. Recall Mode
8. Quick Tap

### 3.2 Game Features Standardization (3 days)

**Create:** `src/lib/gameEngine.ts`

**Centralized utilities:**
- `calculateGameReward()` - XP/coin calculation with accuracy multiplier
- `handleGameCompletion()` - Update progress, award XP/coins, check level-up
- `deductHeart()` - Update hearts, show "Out of Hearts" modal

**Update all 8 game pages** to use these utilities

### 3.3 Game Selection Flow Polish (1 day)

**Update:** `src/components/GameSelectionScreen.tsx`

**Show 4-stage progression clearly:**
- 🟢 **LEARN** (Mastery 0): Preview, Copy
- 🟡 **PRACTICE** (Mastery 1): Fill-in-Blank, Scramble, Builder
- 🔴 **MASTER** (Mastery 2+): Memory, Recall, Quick Tap
- ⭐ **REVIEW**: Spaced repetition

**Features:**
- Lock games until previous stage completed
- Show XP preview for each game
- Character appears with stage tip

**Deliverable:** All 8 games work perfectly, standardized reward system, polished UX

**Estimated Time:** 2 weeks

---

## 📋 PHASE 4: ADAPTIVE LEARNING ENGINE (Weeks 7-8)

**Goal:** Implement spaced repetition system  
**Priority:** HIGH - Retention core mechanic

### 4.1 Spaced Repetition Algorithm (1 week)

**Create:** `src/lib/spacedRepetition.ts`

**Simplified SM-2 Algorithm:**
- `calculateNextReviewDate()` - Intervals: 1d → 3d → 1w → 2w → 1m
- `calculateVerseStrength()` - Score 0-5 based on accuracy/time
- Decrease interval if wrong
- Increase interval if correct

**Database Updates:**
```sql
ALTER TABLE verse_progress 
ADD COLUMN next_review_date TIMESTAMPTZ,
ADD COLUMN strength_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN avg_completion_time INTEGER DEFAULT 0;

CREATE FUNCTION get_verses_due_for_review(p_user_id UUID, p_limit INT)
RETURNS TABLE (verse_id UUID, reference TEXT, strength_score DECIMAL);
```

### 4.2 Daily Review Section (2 days)

**Update:** `src/pages/Index.tsx`

**Add "📚 Daily Review" section:**
- Shows 3-5 verses due for review
- Priority: weakest verses first (strength < 3.0)
- Each verse shows:
  - Reference + preview text
  - Strength indicator (⭐⭐☆☆☆)
  - "Review Now" button
- Clicking opens game selection with review context

**Create:** `src/hooks/useReviewQueue.tsx`

### 4.3 Verse Difficulty Auto-Calculation (1 day)

**Create:** `src/lib/difficultyCalculator.ts`

**Calculate difficulty (1-5 stars) based on:**
- Word count (longer = harder)
- Syllable complexity
- Archaic language frequency ("thee", "thou")
- Store in `verses.difficulty` column

**Run migration script** for all existing verses

**Deliverable:** Smart review system adapts to retention patterns

**Estimated Time:** 2 weeks

---

## 📋 PHASE 5: ENGAGEMENT FEATURES (Weeks 9-10)

**Goal:** Grace Gifts + Context Overlay + Quest enhancements  
**Priority:** MEDIUM - Increases stickiness

### 5.1 Grace Gifts System (1 week)

**Create:** `src/components/GraceGiftBox.tsx`

**Features:**
- Animated gift box appears randomly (15% chance after game)
- Reveals one reward:
  - Double XP Token (next 3 games = 2× XP)
  - Verse Hint Pass (reveal 2 words in any game)
  - Swap Pass (skip difficult verse)
  - +25 Coin Boost
  - +2 Heart Refill
- Character appears: Victory or Joy with celebration

**Database:**
```sql
CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  item_type TEXT NOT NULL,
  quantity INT DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Update all game pages** to check for active boosts

### 5.2 Context Overlay System (1 week)

**Create:** `src/components/ContextOverlay.tsx`

**Displays when verse is tapped:**
- Current verse (highlighted)
- ± 2 surrounding verses
- "View Full Chapter" button
- Audio narration button (placeholder)
- Bookmark functionality

**Create:** `src/components/ChapterReaderKJV.tsx`
- Full chapter reading mode
- Verse numbers
- Highlight current verse
- Previous/Next chapter navigation

### 5.3 Daily Quest Enhancements (2 days)

**Already implemented, enhance with:**
- Grace Gift rewards for completing all 3 quests
- Character celebrations (Hope + Victory combo)
- Quest streaks (7 days = badge)

**Add:**
```sql
ALTER TABLE profiles ADD COLUMN quest_streak INT DEFAULT 0;
```

**Deliverable:** Grace Gifts add surprise joy; context encourages deeper study

**Estimated Time:** 2 weeks

---

## 📋 PHASE 6: SOCIAL FEATURES (Weeks 11-12)

**Goal:** Groups, leaderboards, Group Blessings  
**Priority:** MEDIUM - Community building

### 6.1 Group System Foundations (1 week)

**Database Schema:**
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  admin_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- RLS policies for groups and members
```

**Create:**
- `src/pages/Groups.tsx` - Create/join groups
- `src/components/GroupCard.tsx` - Group display
- Generate 6-character invite codes

### 6.2 Leaderboards (3 days)

**Create:** `src/pages/GroupLeaderboard.tsx`

**Displays top 20 members by:**
- XP earned this week (resets Monday)
- Total verses memorized
- Current streak count

**Database Function:**
```sql
CREATE FUNCTION get_group_leaderboard(p_group_id UUID, p_period TEXT)
RETURNS TABLE (user_id UUID, display_name TEXT, xp_this_week INT, total_verses INT, streak_count INT, rank INT);
```

**Real-time updates** using Supabase Realtime

### 6.3 Group Blessings Quest (2 days)

**Create:** `src/components/GroupBlessingQuest.tsx`

**Weekly shared goal:**
- "Complete 100 verses as a group this week"
- Progress bar shows aggregate
- If met: 1.5× XP boost for all members next week
- Victory + Hope celebration on completion

**Database:**
```sql
CREATE TABLE group_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  target_value INT NOT NULL,
  current_progress INT DEFAULT 0,
  week_start DATE NOT NULL,
  completed BOOLEAN DEFAULT false
);
```

**Deliverable:** Groups, leaderboards, shared goals operational

**Estimated Time:** 2 weeks

---

## 📋 PHASE 7: POLISH & OPTIMIZATION (Weeks 13-14)

**Goal:** Lottie animations + performance + onboarding polish  
**Priority:** HIGH - Production readiness

### 7.1 Lottie Animation Integration (1 week)

**Once 80 animation files ready** (8 states × 10 characters):

**Create:** `src/components/LottieCharacter.tsx`
- Loads from `/public/characters/{characterId}/animations/{characterId}_{state}.json`
- Falls back to static PNG if animation missing
- Context-aware states:
  - idle, celebrate, comfort, wave, thinking, cry, determined, teaching

**Update all character appearances** to use `<LottieCharacter />`

**File structure:**
```
/public/characters/
  /hope/animations/hope_idle.json
  /ember/animations/ember_celebrate.json
  ...
```

### 7.2 Performance Optimization (3 days)

**1. Prefetch Hot Books**
- Create `src/lib/prefetchHotBooks.ts`
- Prefetch: John, Psalms, Genesis, Matthew, Romans
- Background fetch (doesn't block UI)

**2. Asset Optimization**
- Compress all PNGs (TinyPNG)
- Optimize Lottie sizes (target: 15-30KB)
- Enable Brotli compression

**3. Database Indexing**
```sql
CREATE INDEX verse_progress_user_mastery_idx ON verse_progress(user_id, mastery_level);
CREATE INDEX verse_progress_review_date_idx ON verse_progress(next_review_date);
CREATE INDEX profiles_streak_idx ON profiles(streak_count DESC);
```

**4. Query Optimization**
- Use `.select('col1, col2')` instead of `*`
- Pagination for leaderboards (20 per page)
- Cache user profile in React Context

### 7.3 Onboarding Flow Refinement (2 days)

**Update:** `src/pages/Auth.tsx`

**New Flow:**
1. Welcome Screen (Hope intro)
2. **Companion Selection** (10 characters)
3. Avatar Customization (future: seed-based)
4. Daily Goal Setting (1/3/5 verses)
5. **First Verse Tutorial** (John 3:16 guided)
6. Celebration (first XP earned)

**Track:**
```sql
ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
```

### 7.4 Comprehensive Testing (3 days)

**Test:**
- All 8 games with various verses
- Offline mode (airplane mode)
- ESV whitelist fallback
- Streak edge cases
- Grace Pass activation
- Group creation/joining
- Leaderboard updates

**Performance Targets:**
- First book load: <200ms
- Cached book load: <50ms
- Verse lookup: <5ms
- Game load: <1 second
- Lighthouse score: >90

**Cross-Device:**
- iOS Safari
- Android Chrome
- Desktop browsers
- Tablet landscape/portrait

**Deliverable:** Production-ready app, optimized, polished

**Estimated Time:** 2 weeks

---

## 📊 SUCCESS METRICS BY PHASE

### Phase 0 Complete When:
- ✅ Auth navigation bug fixed
- ✅ All 8 games load real KJV text
- ✅ Offline mode functional
- ✅ No database text queries for KJV

### Phase 1 Complete When:
- ✅ 10 characters fully documented
- ✅ Placeholder PNGs for all characters
- ✅ Companion selection in onboarding
- ✅ Companion displays throughout app

### Phase 2 Complete When:
- ✅ Visual flame replaces numeric streak
- ✅ Ember appears during protection
- ✅ XP-based revival functional
- ✅ Grace Pass + Flame integrated

### Phase 3 Complete When:
- ✅ All 8 games tested end-to-end
- ✅ Standardized reward system
- ✅ Character encouragement in games
- ✅ Zero critical bugs

### Phase 4 Complete When:
- ✅ SRS algorithm calculates reviews
- ✅ "Daily Review" section on home
- ✅ Weak verses auto-resurface
- ✅ Strength scores update

### Phase 5 Complete When:
- ✅ Grace Gifts appear (15% rate)
- ✅ Context overlay shows ± 2 verses
- ✅ Daily quests give Grace Gifts
- ✅ User items tracked

### Phase 6 Complete When:
- ✅ Users create/join groups
- ✅ Group leaderboard displays
- ✅ Group Blessings Quest tracks
- ✅ Invites work smoothly

### Phase 7 Complete When:
- ✅ Lottie animations integrated
- ✅ Performance targets met
- ✅ 100% offline capability
- ✅ Onboarding >70% completion
- ✅ Zero critical bugs

---

## 🚨 CRITICAL BLOCKERS

### Blocking Everything:
1. ⚠️ **MUST PROVIDE:** KJV files (66 JSONs + SQLite) - Python script outputs
2. ✅ **FIXED:** Auth navigation bug

### Blocking Phase 1:
3. ⚠️ **MUST DEFINE:** Full personalities for Theo, Sophie, Evan, Mia, Hezekiah (5 characters)
4. Need static PNGs for 9 new characters

### Blocking Phase 7:
5. Lottie files (80 total: 8 states × 10 characters)
   - Can proceed with static placeholders

---

## 📅 TIMELINE SUMMARY

| Phase | Description | Weeks | Status |
|-------|-------------|-------|--------|
| **Phase 0** | Foundation Fixes (Auth, KJV) | Week 1 | 🔄 In Progress |
| **Phase 1** | Character System (10 companions) | Weeks 2-3 | ⏳ Blocked |
| **Phase 2** | Flame Streak & Grace | Week 4 | ⏳ Not Started |
| **Phase 3** | Games Verification | Weeks 5-6 | ⏳ Not Started |
| **Phase 4** | Adaptive Learning (SRS) | Weeks 7-8 | ⏳ Not Started |
| **Phase 5** | Engagement Features | Weeks 9-10 | ⏳ Not Started |
| **Phase 6** | Social Features | Weeks 11-12 | ⏳ Not Started |
| **Phase 7** | Polish & Optimization | Weeks 13-14 | ⏳ Not Started |

**MVP Launch:** After Phase 6 (Week 12)  
**Full Launch:** After Phase 7 (Week 14)

---

## 🎯 PRIORITY SUMMARY

**Critical (Must Have for MVP):**
- Phase 0: Foundation fixes
- Phase 1: 10-character system
- Phase 2: Flame streak
- Phase 3: Games working perfectly
- Phase 4: Adaptive learning

**Important (Should Have):**
- Phase 5: Grace Gifts + Context
- Phase 6: Social features

**Polish (Nice to Have):**
- Phase 7: Lottie animations + optimization

---

## 📝 NEXT IMMEDIATE ACTIONS

**This Week (Phase 0):**
1. ✅ Fix auth navigation bug - COMPLETE
2. ⏳ User provides KJV files (66 JSONs + SQLite)
3. ⏳ User defines 5 remaining character personalities

**Next Week (Phase 1 Start):**
4. Integrate KJV static files
5. Update all 8 games to use KJV loader
6. Test games end-to-end
7. Generate 9 new character PNGs

---

**Last Updated:** Phase 0 - Auth bug fixed, awaiting KJV files
