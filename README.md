# Scripture Quest

**A gamified Scripture memorization app that makes learning Bible verses fun and engaging.**

## Project info

**URL**: https://lovable.dev/projects/eca16520-cebd-43fb-b966-40cb766f1aab

## About Scripture Quest

Scripture Quest is a mobile-first web application designed to help users memorize Bible verses through interactive mini-games, daily streaks, badges, and a supportive community. Inspired by successful learning platforms like Duolingo, Scripture Quest combines proven gamification mechanics with grace-based pedagogy to make Scripture memory accessible, enjoyable, and sustainable.

### Key Features

- 🎮 **8 Interactive Mini-Games**: Preview, Copy, Fill-in-the-blank, Word Scramble, Verse Builder, Memory Match, Recall, and Quick Tap
- 🔥 **Flame Streak System**: Visual streak tracking protected by Grace Pass with Ember as your streak guardian
- 🏆 **XP, Levels & Badges**: Earn rewards for progress and achievements
- 💎 **Hearts & Coins**: Game economy with lives and in-app currency
- 🎁 **Grace Gifts**: Random surprise rewards (Double XP, Hint Passes, Coin Boosts, Heart Refills)
- 🧠 **Adaptive Learning Engine**: Spaced repetition system that adapts to your retention patterns
- 👥 **Social Features**: Friends, church groups, leaderboards, and Group Blessings (coming soon)
- 🎯 **Curated Scripture Paths**: Topical collections like Foundations, Comfort, Identity, Prayer
- 📱 **Mobile-First Design**: Responsive, beautiful, and accessible
- 🌟 **10 Character Companions**: Choose your spiritual buddy to guide your journey

### Character System

Scripture Quest features 10 unique character companions that guide and encourage you:

1. **Hope** 🕊️ - The Guiding Light (primary mascot)
2. **Ember** 🔥 - Flame/Streak Guardian
3. **Grace** 🌸 - Compassion & Forgiveness
4. **Theo** 📖 - (In Development)
5. **Victory** 👑 - Achievement & Celebration
6. **Sophie** 🌟 - (In Development)
7. **Evan** 💪 - (In Development)
8. **Mia** 🎨 - (In Development)
9. **Hezekiah** 🦁 - (In Development)
10. **Joy** 😊 - Pure Happiness & Celebration

You select your companion during onboarding, and they appear throughout your journey to celebrate wins, comfort losses, and encourage you forward.

See [CHARACTER_SYSTEM.md](./CHARACTER_SYSTEM.md) for full character details.

### KJV Architecture

Scripture Quest uses an **offline-first architecture** for King James Version (KJV) text:
- 66 static JSON files (one per book) stored in `/public/kjv_books/`
- SQLite database for verse metadata (references, difficulty, XP rewards)
- Total size: ~4.5MB gzipped
- **100% offline capability** - no remote API calls required
- ESV available for exactly 500 whitelisted verses (copyright compliance)

This design minimizes infrastructure costs and ensures Scripture is always accessible, even without internet connection.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/eca16520-cebd-43fb-b966-40cb766f1aab) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Lovable Cloud (Supabase backend)
- Lottie (for character animations - Phase 7)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/eca16520-cebd-43fb-b966-40cb766f1aab) and click on Share -> Publish.

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete 7-phase implementation plan (14 weeks total).

**Current Status:** Phase 0 in progress (Foundation Fixes)

## Can I connect a custom domain to my Scripture Quest project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
