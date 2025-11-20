import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

export default function CopyMode() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);

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
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate, toast]);

  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
  };

  useEffect(() => {
    if (!verse) return;
    
    const normalized = normalizeText(userInput);
    const target = normalizeText(verse.text);
    
    if (normalized === target) {
      setIsComplete(true);
    }
  }, [userInput, verse]);

  const handleComplete = async () => {
    if (!user || !verseId || !verse) return;

    const { error } = await supabase.rpc("update_verse_progress", {
      p_user_id: user.id,
      p_verse_id: verseId,
      p_correct: true,
      p_xp_earned: Math.floor(verse.xp_reward / 2), // Half XP for copy mode
      p_coins_earned: 2,
    });

    if (!error) {
      toast({
        title: "Great Job!",
        description: `You earned ${Math.floor(verse.xp_reward / 2)} XP and 2 coins!`,
      });
    }

    navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading verse...</p>
      </div>
    );
  }

  const progress = verse ? (userInput.length / verse.text.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary p-6 text-white">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`)}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <h1 className="text-2xl font-bold">Copy Mode</h1>
          <p className="text-white/90">Type the verse while viewing it</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{verse?.reference}</h2>
          </div>

          {/* Verse Display */}
          <div className="bg-primary/5 p-6 rounded-lg mb-6">
            <p className="text-xl leading-relaxed text-center font-serif">
              {verse?.text}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Input Area */}
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Start typing the verse here..."
            className="min-h-[200px] text-lg mb-6"
            autoFocus
          />

          {isComplete && (
            <div className="bg-success/10 border border-success text-success p-4 rounded-lg mb-6 text-center">
              <CheckCircle className="w-6 h-6 inline mr-2" />
              Perfect! You've typed the entire verse correctly!
            </div>
          )}

          <Button
            onClick={handleComplete}
            disabled={!isComplete}
            className="w-full gradient-primary text-white hover:opacity-90"
            size="lg"
          >
            Continue
          </Button>
        </Card>
      </div>
    </div>
  );
}
