import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  id: string;
  reference: string;
  text: string;
  keywords: string[];
}

export default function PreviewMode() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleComplete = async () => {
    if (!user || !verseId) return;

    // Award small XP for preview completion
    const { error } = await supabase.rpc("update_verse_progress", {
      p_user_id: user.id,
      p_verse_id: verseId,
      p_correct: true,
      p_xp_earned: 5,
      p_coins_earned: 0,
    });

    if (!error) {
      toast({
        title: "Preview Complete!",
        description: "You earned 5 XP. Ready to try Copy Mode?",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <h1 className="text-2xl font-bold">Preview Mode</h1>
          <p className="text-white/90">Read and familiarize yourself with this verse</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">{verse?.reference}</h2>
            <p className="text-sm text-muted-foreground">Take your time to read and understand</p>
          </div>

          <div className="bg-primary/5 p-8 rounded-lg mb-8">
            <p className="text-2xl leading-relaxed text-center font-serif">
              {verse?.text}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-lg">Key Words to Remember:</h3>
            <div className="flex flex-wrap gap-2">
              {verse?.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-full font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">💡 Tips for Memorization:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Read the verse out loud several times</li>
              <li>• Focus on the key words highlighted above</li>
              <li>• Try to understand the meaning and context</li>
              <li>• Visualize the verse or create a mental image</li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground mb-6">
            Time spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>

          <Button
            onClick={handleComplete}
            className="w-full gradient-primary text-white hover:opacity-90"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            I'm Ready - Continue to Practice
          </Button>
        </Card>
      </div>
    </div>
  );
}
