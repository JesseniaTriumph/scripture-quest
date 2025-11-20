export type CharacterType = 
  | "hope" 
  | "marcus" 
  | "selah" 
  | "phoebe" 
  | "kai" 
  | "zola" 
  | "rhys" 
  | "juno";

export type CharacterRole = 
  | "celebration"
  | "difficulty"
  | "rest"
  | "motivation"
  | "discipline"
  | "grace"
  | "challenge"
  | "wisdom";

export interface Character {
  id: CharacterType;
  name: string;
  role: CharacterRole;
  description: string;
  imagePath: string;
  color: string;
  quotes: string[];
  appearsWhen: string[];
}

export const CHARACTERS: Record<CharacterType, Character> = {
  hope: {
    id: "hope",
    name: "Hope",
    role: "celebration",
    description: "The Guiding Light - Primary Mascot",
    imagePath: "/src/assets/character-hope.png",
    color: "#FFD75E",
    quotes: [
      "A little progress every day builds a lifetime of Scripture.",
      "The Word is growing in you — keep going!",
      "You're closer than you think.",
      "Every verse you learn is a treasure stored in your heart.",
      "Keep shining! You're doing amazing!"
    ],
    appearsWhen: ["level-up", "verse-completion", "streak", "encouragement", "loading"]
  },
  marcus: {
    id: "marcus",
    name: "Marcus",
    role: "difficulty",
    description: "The Scribe of Wisdom",
    imagePath: "/src/assets/character-marcus.png",
    color: "#C6A872",
    quotes: [
      "Let's meditate on this together.",
      "Every verse is a stone in a strong foundation.",
      "You're building wisdom one line at a time.",
      "This verse requires focus. Take your time.",
      "Deep truths are worth the effort."
    ],
    appearsWhen: ["difficult-verse", "new-game-unlock", "devotional", "master-stage"]
  },
  selah: {
    id: "selah",
    name: "Selah",
    role: "rest",
    description: "The Rest & Reflection Spirit",
    imagePath: "/src/assets/character-selah.png",
    color: "#7EC8E3",
    quotes: [
      "Take a breath. You're doing beautifully.",
      "Rest is part of growth.",
      "Grace for the journey.",
      "Pause and reflect on what you've learned.",
      "It's okay to rest. You're right on pace."
    ],
    appearsWhen: ["post-session", "grace-moment", "review-complete"]
  },
  phoebe: {
    id: "phoebe",
    name: "Phoebe",
    role: "motivation",
    description: "The Motivator",
    imagePath: "/src/assets/character-phoebe.png",
    color: "#9BB67C",
    quotes: [
      "Yes! You're on fire!",
      "Look at you go!",
      "This is your breakthrough moment!",
      "Amazing work! Keep that momentum!",
      "You're absolutely crushing this!"
    ],
    appearsWhen: ["first-win", "onboarding", "quick-game", "reward-unlock", "learn-stage"]
  },
  kai: {
    id: "kai",
    name: "Kai",
    role: "discipline",
    description: "The Disciplinarian",
    imagePath: "/src/assets/character-kai.png",
    color: "#1B2A4A",
    quotes: [
      "Consistency is the key to mastery.",
      "You're building something lasting.",
      "Small steps, every day.",
      "Your dedication is inspiring.",
      "The journey of a thousand verses starts with one."
    ],
    appearsWhen: ["streak-milestone", "discipline-check", "returning-user", "practice-stage"]
  },
  zola: {
    id: "zola",
    name: "Zola",
    role: "grace",
    description: "The Encourager",
    imagePath: "/src/assets/character-zola.png",
    color: "#E8D5C4",
    quotes: [
      "Welcome back. There's no shame here.",
      "Every day is a new beginning.",
      "Grace covers all things.",
      "You're never too far behind to start again.",
      "I'm so glad you're here today."
    ],
    appearsWhen: ["missed-day", "failure", "streak-break", "return"]
  },
  rhys: {
    id: "rhys",
    name: "Rhys",
    role: "challenge",
    description: "The Challenger",
    imagePath: "/src/assets/character-rhys.png",
    color: "#FF6B6B",
    quotes: [
      "Let's see what you've got!",
      "Race you to the top!",
      "Time to level up!",
      "Think you can beat your best time?",
      "Ready for a challenge?"
    ],
    appearsWhen: ["timed-game", "competition", "leaderboard", "quick-tap"]
  },
  juno: {
    id: "juno",
    name: "Juno",
    role: "wisdom",
    description: "The Guide",
    imagePath: "/src/assets/character-juno.png",
    color: "#9B59B6",
    quotes: [
      "Let me show you the story behind these words.",
      "Understanding deepens memory.",
      "There's so much beauty here.",
      "Context brings Scripture to life.",
      "Every word has a purpose and meaning."
    ],
    appearsWhen: ["preview-mode", "new-collection", "teaching-moment", "verse-context"]
  }
};

// Helper to get appropriate character based on context
export const getCharacterForContext = (context: string, mastery?: number): Character => {
  // Preview mode - always Juno
  if (context === "preview") return CHARACTERS.juno;
  
  // Learn stage (mastery 0) - Phoebe
  if (context === "learn" || mastery === 0) return CHARACTERS.phoebe;
  
  // Practice stage (mastery 1) - Kai
  if (context === "practice" || mastery === 1) return CHARACTERS.kai;
  
  // Master stage (mastery 2+) - Marcus
  if (context === "master" || (mastery !== undefined && mastery >= 2)) return CHARACTERS.marcus;
  
  // Timed/challenge games - Rhys
  if (context === "quick-tap" || context === "timed") return CHARACTERS.rhys;
  
  // Success/celebration - Hope
  if (context === "success" || context === "celebration") return CHARACTERS.hope;
  
  // Grace/encouragement after failure - Zola
  if (context === "failure" || context === "grace") return CHARACTERS.zola;
  
  // Rest/review - Selah
  if (context === "review" || context === "rest") return CHARACTERS.selah;
  
  // Default to Hope
  return CHARACTERS.hope;
};

// Get random quote from character
export const getCharacterQuote = (character: Character): string => {
  return character.quotes[Math.floor(Math.random() * character.quotes.length)];
};
