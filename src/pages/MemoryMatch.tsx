import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHearts } from "@/hooks/useHearts";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { CharacterGuide } from "@/components/CharacterGuide";
import { CHARACTERS } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

interface Card {
  id: number;
  content: string;
  type: "reference" | "text";
  matched: boolean;
  flipped: boolean;
  verseId: string;
}

export default function MemoryMatch() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hearts, loseHeart } = useHearts();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (!verseId || !user) {
      navigate("/");
      return;
    }

    const fetchVerse = async () => {
      const { data, error } = await supabase
        .from("verses")
        .select("*")
        .eq("id", verseId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load verse",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setVerse(data);
      generateCards(data);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate, toast]);

  const generateCards = (verseData: Verse) => {
    // Split verse into 4 segments
    const words = verseData.text.split(/\s+/);
    const segmentSize = Math.ceil(words.length / 4);
    
    const segments: Card[] = [];
    for (let i = 0; i < 4; i++) {
      const start = i * segmentSize;
      const end = Math.min((i + 1) * segmentSize, words.length);
      const segmentText = words.slice(start, end).join(" ");
      
      // Reference card
      segments.push({
        id: i * 2,
        content: `${verseData.reference} (Part ${i + 1})`,
        type: "reference",
        matched: false,
        flipped: false,
        verseId: `segment-${i}`
      });
      
      // Text card
      segments.push({
        id: i * 2 + 1,
        content: segmentText,
        type: "text",
        matched: false,
        flipped: false,
        verseId: `segment-${i}`
      });
    }

    // Shuffle cards
    const shuffled = segments.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = (index: number) => {
    if (selectedCards.length >= 2 || cards[index].flipped || cards[index].matched) {
      return;
    }

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setAttempts(prev => prev + 1);
      checkMatch(newSelected[0], newSelected[1]);
    }
  };

  const checkMatch = async (index1: number, index2: number) => {
    const card1 = cards[index1];
    const card2 = cards[index2];

    if (card1.verseId === card2.verseId && card1.type !== card2.type) {
      // Match found!
      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].matched = true;
        newCards[index2].matched = true;
        setCards(newCards);
        setSelectedCards([]);
        
        const newMatches = matches + 1;
        setMatches(newMatches);

        if (newMatches === 4) {
          completeGame();
        }
      }, 500);
    } else {
      // No match - don't lose heart for wrong attempts
      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].flipped = false;
        newCards[index2].flipped = false;
        setCards(newCards);
        setSelectedCards([]);
      }, 1000);
    }
  };

  const completeGame = async () => {
    setIsComplete(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    if (user && verseId && verse) {
      await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verseId,
        p_correct: true,
        p_xp_earned: verse.xp_reward,
        p_coins_earned: Math.max(10 - attempts, 3), // Bonus for fewer attempts
      });

      toast({
        title: "Memory Master!",
        description: `You earned ${verse.xp_reward} XP and ${Math.max(10 - attempts, 3)} coins!`,
      });
    }
  };

  const handleComplete = () => {
    navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`)}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Memory Match</h1>
              <p className="text-white/90">Match verse references with their text</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Lamp Oil</p>
              <p className="text-2xl font-bold">{hearts}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Character Guide - Marcus for Master stage */}
        <CharacterGuide 
          character={CHARACTERS.marcus}
          message="Test your memory and connect the pieces. This challenges your mastery."
        />
        {showInstructions ? (
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">📖 How to Play Memory Match</h2>
            <div className="text-left space-y-4 mb-6">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Goal:</strong> Connect the verse reference with the scripture text <strong>in sequential order</strong>.
              </p>
              <p className="text-muted-foreground">
                The verse has been split into 4 parts. Match each part number with its text:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-primary">Part 1</strong> → First phrase of the verse</li>
                <li><strong className="text-primary">Part 2</strong> → Second phrase</li>
                <li><strong className="text-primary">Part 3</strong> → Third phrase</li>
                <li><strong className="text-primary">Part 4</strong> → Final phrase</li>
              </ul>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Example:</strong> For John 3:16, you'd match:<br/>
                <span className="text-sm italic">"{verse?.reference} (Part 1)" ↔ "For God so loved the world, that"</span>
              </p>
            </div>
            <Button
              onClick={() => setShowInstructions(false)}
              className="w-full gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              Start Game
            </Button>
          </Card>
        ) : !isComplete && (
          <div className="mb-6 text-center">
            <div className="flex justify-center gap-8 text-lg">
              <span className="text-muted-foreground">Matches: <span className="text-primary font-bold">{matches}/4</span></span>
              <span className="text-muted-foreground">Attempts: <span className="font-bold">{attempts}</span></span>
            </div>
          </div>
        )}

        {showInstructions ? null : isComplete ? (
          <Card className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Perfect Match!</h2>
              <p className="text-lg text-muted-foreground">
                You completed the game in {attempts} attempts
              </p>
            </div>
            <Button
              onClick={handleComplete}
              className="w-full gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              Continue
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square cursor-pointer transition-all duration-300 ${
                  card.matched 
                    ? "bg-success/10 border-success" 
                    : card.flipped 
                    ? "bg-primary/10 border-primary" 
                    : "hover:bg-muted"
                }`}
              >
                <div className="h-full flex items-center justify-center p-4">
                  {card.flipped || card.matched ? (
                    <div className="text-center">
                      <p className={`text-xs font-semibold mb-2 ${
                        card.type === "reference" ? "text-primary" : "text-foreground"
                      }`}>
                        {card.type === "reference" ? "📖 Reference" : "📝 Text"}
                      </p>
                      <p className="text-sm font-medium">{card.content}</p>
                    </div>
                  ) : (
                    <div className="text-4xl">❓</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
