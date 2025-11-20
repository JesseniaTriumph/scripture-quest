# Scripture Quest Character System

This document outlines the complete character system for Scripture Quest, including all 8 guides (3 symbolic + 5 human) and their roles in the gamification and learning experience.

## Design Philosophy

Our characters are designed to be:
- **Globally relatable** - Appeals across age, gender, denomination, and culture
- **Emotionally resonant** - Connects with universal themes of faith, hope, wisdom, grace
- **Theologically sensitive** - Avoids literal depictions; uses symbolic and aspirational archetypes
- **Modern & polished** - Game-quality design that feels premium and inviting
- **Grace-based** - Encourages without guilt; celebrates progress over perfection

## Character Assets

All character images are stored in `src/assets/`:
- `character-hope.png`
- `character-marcus.png`
- `character-selah.png`
- `character-phoebe.png`
- `character-kai.png`
- `character-zola.png`
- `character-rhys.png`
- `character-juno.png`

---

## Symbolic Characters

### 1. Hope (The Guiding Light) - Primary Mascot

**Role**: Main mascot; appears at key celebration moments

**Concept**: A glowing, warm, animated spirit creature shaped like a soft flame or teardrop

**Appearance**:
- Core shape: Round teardrop or soft flame
- Soft bloom/glow effect
- Simple kawaii-inspired eyes; tiny dot mouth
- Floating, bouncing, gentle movement
- Star sparkles and tiny olive leaves

**Colors**:
- Primary: Gold (#FFD75E) - reward, holiness, promise
- Accent: Olive (#9BB67C) - growth, peace, life
- Soft white glow - purity, clarity

**When Hope Appears**:
- Level-ups
- Verse completions
- Streak celebrations
- Encouragement after wrong answers
- Loading screens

**Signature Lines**:
- "A little progress every day builds a lifetime of Scripture."
- "The Word is growing in you — keep going!"
- "You're closer than you think."

---

### 2. Marcus (The Scribe of Wisdom)

**Role**: Introduces difficult verses and deeper learning

**Concept**: A living scroll spirit creature - like a mystical helper from Studio Ghibli

**Appearance**:
- Body: Rolled parchment with subtle Hebrew/Greek-style markings
- Simple, dark, wise eyes like a seasoned teacher
- Quill feather tucked into itself
- Dust sparkles and ink droplets

**Colors**:
- Clay brown (#C6A872) - grounding, ancient
- Royal blue (#1B2A4A) - truth, wisdom
- Ink black details

**When Marcus Appears**:
- Before difficult verses
- When new game modes unlock
- Devotionals or deeper-level challenges
- Introducing spiritual concepts

**Signature Lines**:
- "Let's meditate on this together."
- "Every verse is a stone in a strong foundation."
- "You're building wisdom one line at a time."

---

### 3. Selah (The Rest & Reflection Spirit)

**Role**: Encourages rest, grace, and reflection

**Concept**: Soft blue ethereal character with gentle water-like movement; inspired by the Psalms

**Appearance**:
- Calming blue tones with white highlights
- Gentle, flowing, water-like sway
- Peaceful expression

**Colors**:
- Soft blue - peace, calm, reflection
- White highlights - purity, grace

**When Selah Appears**:
- After mastery or review sessions
- When user needs emotional regulation
- Grace moments (e.g., after missed streaks)

**Signature Lines**:
- "Take a breath. You're doing beautifully."
- "Rest is part of growth."
- "Grace for the journey."

---

## Human Guides

### 4. Phoebe (The Motivator)

**Role**: Joy, rewards, and initial success; primary cheerleader

**Personality**: Energetic, warm, highly expressive

**Diversity**: Young South Asian woman, early 20s

**Appearance**:
- Bright, approachable attire (Growth Green + Glory Gold accents)
- Animated pose (high-five, jumping, celebrating)
- Joyful expression

**When Phoebe Appears**:
- First wins
- New user onboarding
- Quick game sessions
- Reward unlocks

**Signature Lines**:
- "Yes! You're on fire!"
- "Look at you go!"
- "This is your breakthrough moment!"

---

### 5. Kai (The Disciplinarian)

**Role**: Consistency, streaks, long-term mastery; accountability without judgment

**Personality**: Calm, composed, encouraging; focuses on the "why"

**Diversity**: Middle-aged Black man, distinguished

**Appearance**:
- Neat beard, optional glasses for scholarly touch
- Professional modern attire (navy, neutral tones)
- Holding book or scroll
- Composed posture

**When Kai Appears**:
- Long streak milestones
- Discipline-building features
- Returning after a break
- Progress check-ins

**Signature Lines**:
- "Consistency is the key to mastery."
- "You're building something lasting."
- "Small steps, every day."

---

### 6. Zola (The Encourager)

**Role**: Grace, compassion, non-judgmental return; manages "loss aversion" loop

**Personality**: Gentle, empathetic, nurturing; embodies Grace Mechanics

**Diversity**: Older East African woman, 60s

**Appearance**:
- Kind, expressive eyes
- Serene warm smile
- Comfortable modern clothing (soft blue, white tones)
- Compassionate posture with open hand gesture

**When Zola Appears**:
- After missed days
- Failure states
- Offering Streak Freeze
- Returning users

**Signature Lines**:
- "Welcome back. There's no shame here."
- "Every day is a new beginning."
- "Grace covers all things."

---

### 7. Rhys (The Challenger)

**Role**: Competition, social events, leaderboards; makes progress feel like a game

**Personality**: Spirited, determined, competitive but friendly

**Diversity**: Young Latino man, early 20s

**Appearance**:
- Sporty athletic build
- Fashionable styled haircut
- Modern athletic-casual clothing with bright accents
- Confident energetic pose, stopwatch gesture

**When Rhys Appears**:
- League rankings
- Timed challenges
- Social competitions
- Speed-based games

**Signature Lines**:
- "Let's see what you've got!"
- "Race you to the top!"
- "Time to level up!"

---

### 8. Juno (The Guide)

**Role**: Wisdom, context, deeper study; introduces new collections and explains verses

**Personality**: Thoughtful, eloquent, source of deep information

**Diversity**: Young Southeast Asian woman, mid-20s

**Appearance**:
- Unique visual flair (muted purple hair highlights)
- Modern stylish attire suggesting wisdom and creativity
- Elegant thoughtful pose, explaining gesture

**When Juno Appears**:
- "Preview Mode" for new verses
- New collection unlocks
- Context and background on Scripture
- Teaching moments

**Signature Lines**:
- "Let me show you the story behind these words."
- "Understanding deepens memory."
- "There's so much beauty here."

---

## Usage Guidelines

### Character Rotation
- **Hope** is the primary mascot and should be most visible (Hero, celebrations, rewards)
- Rotate human guides based on context and game mechanics
- Use symbolic characters (Marcus, Selah) for "pause" moments

### Animation & Interaction
- Keep animations simple and consistent (float, bounce, fade-in)
- Characters should always feel supportive, never judgmental
- Use speech bubbles or callouts for character quotes

### Color Harmony
All character color palettes align with the design system in `src/index.css`:
- Gold (#FFD75E) - `--primary` variants
- Royal Blue (#1B2A4A) - `--primary` dark
- Growth Green - `--success` variants
- Soft Blue - `--accent` variants

### Accessibility
- All character images include descriptive alt text
- Characters enhance but don't block core functionality
- Text content always readable without character context

---

## Implementation Checklist

- [x] Character images generated and saved to `src/assets/`
- [x] Hope and Phoebe integrated into Hero component
- [ ] Create Character component for reusable character displays
- [ ] Add character appearances in game screens
- [ ] Create badge system with character-themed badges
- [ ] Add character quotes to loading states
- [ ] Implement character unlock progression
- [ ] Add character preferences to user profile

---

## Future Enhancements

### Phase 2
- Character voice lines (text-to-speech)
- Animated character reactions
- Character-specific achievement badges

### Phase 3
- Unlockable character variants (outfits, expressions)
- User-selectable favorite character
- Character-themed events (e.g., "Kai's Consistency Challenge")

### Phase 4
- Character backstory devotionals
- Animated character introductions
- User-generated character fan art gallery
