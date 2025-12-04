import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Share2, Loader2, BookMarked } from "lucide-react";
import { useKJVVerse } from "@/hooks/useKJV";
import { Link } from "react-router-dom";

export const DailyVerse = () => {
  // Default verse - can be made dynamic later with daily rotation
  const verseReference = "John 3:16";
  const { text, loading, error } = useKJVVerse(verseReference);

  // Parse reference to extract book, chapter, and verse for the reader link
  const parseReference = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)/);
    if (match) {
      return { book: match[1], chapter: match[2], verse: match[3] };
    }
    return { book: 'John', chapter: '3', verse: '16' };
  };

  const { book, chapter, verse } = parseReference(verseReference);
  const readerUrl = `/reader?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`;

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Verse of the Day
          </h2>
          <p className="text-lg text-muted-foreground">
            Start your spiritual journey with today's inspiring verse
          </p>
        </div>
        
        <Card className="p-8 md:p-12 shadow-xl border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 gradient-accent"></div>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : (
                <>
                  <p className="text-2xl md:text-3xl font-serif leading-relaxed text-foreground mb-4">
                    "{text}"
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {verseReference} (KJV)
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button className="gradient-primary text-white hover:opacity-90 flex-1">
              Practice This Verse
            </Button>
            <Button variant="outline" className="border-2" asChild>
              <Link to={readerUrl}>
                <BookMarked className="mr-2 h-4 w-4" />
                View Full Chapter
              </Link>
            </Button>
            <Button variant="outline" className="border-2">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
