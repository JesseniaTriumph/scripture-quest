import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VerseCard } from "./VerseCard";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Verse {
  id: string;
  reference: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp_reward: number;
  collection_id: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const VersesHub = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: collectionsData } = await supabase
        .from('collections')
        .select('*')
        .order('order_index');

      const { data: versesData } = await supabase
        .from('verses')
        .select('*')
        .order('created_at');

      if (collectionsData) setCollections(collectionsData);
      if (versesData) setVerses(versesData as Verse[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handlePlay = (verse: Verse) => {
    toast({
      title: `Starting ${verse.reference}! 📖`,
      description: `Get ready to memorize Scripture and earn +${verse.xp_reward} XP!`,
    });
    // TODO: Navigate to game page
  };

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container max-w-7xl">
          <p className="text-center text-muted-foreground">Loading verses...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="container max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Scripture Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master verses from curated collections. Progress from beginner to mastery and unlock rewards!
          </p>
        </div>

        <Tabs defaultValue={collections[0]?.id} className="w-full">
          <TabsList className="w-full justify-start mb-8 overflow-x-auto">
            {collections.map((collection) => (
              <TabsTrigger key={collection.id} value={collection.id} className="flex items-center gap-2">
                <span>{collection.icon}</span>
                {collection.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {collections.map((collection) => (
            <TabsContent key={collection.id} value={collection.id}>
              <div className="mb-6">
                <p className="text-muted-foreground">{collection.description}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {verses
                  .filter((v) => v.collection_id === collection.id)
                  .map((verse) => (
                    <VerseCard key={verse.id} verse={verse} onPlay={handlePlay} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
