/**
 * ChapterReader Component
 * 
 * Displays full KJV chapters with book/chapter selection and verse-by-verse navigation.
 * Uses static JSON files from /public/kjv_books/ for offline-first reading.
 */

import { useState, useRef, useEffect } from 'react';
import { useKJVChapter } from '@/hooks/useKJV';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Bible book data with chapter counts
const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
];

interface ChapterReaderProps {
  initialBook?: string;
  initialChapter?: number;
  initialVerse?: number;
  onClose?: () => void;
}

export function ChapterReader({ 
  initialBook = 'John', 
  initialChapter = 3,
  initialVerse,
  onClose 
}: ChapterReaderProps) {
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(initialVerse || null);
  
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { chapter, loading, error } = useKJVChapter(selectedBook, selectedChapter);

  const currentBookData = BIBLE_BOOKS.find(b => b.name === selectedBook);
  const maxChapters = currentBookData?.chapters || 1;

  // Scroll to highlighted verse when it changes
  useEffect(() => {
    if (highlightedVerse && verseRefs.current.has(highlightedVerse)) {
      const verseElement = verseRefs.current.get(highlightedVerse);
      verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedVerse, chapter]);

  // Reset highlighted verse when chapter changes
  useEffect(() => {
    if (!initialVerse) {
      setHighlightedVerse(null);
    }
  }, [selectedChapter, selectedBook, initialVerse]);

  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1);
    } else {
      // Go to previous book's last chapter
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.name === selectedBook);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1];
        setSelectedBook(prevBook.name);
        setSelectedChapter(prevBook.chapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < maxChapters) {
      setSelectedChapter(prev => prev + 1);
    } else {
      // Go to next book's first chapter
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.name === selectedBook);
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1];
        setSelectedBook(nextBook.name);
        setSelectedChapter(1);
      }
    }
  };

  const handleVerseClick = (verseNum: number) => {
    setHighlightedVerse(prev => prev === verseNum ? null : verseNum);
  };

  const navigateVerse = (direction: 'prev' | 'next') => {
    if (!chapter?.verses.length) return;
    
    const verses = chapter.verses;
    const currentIndex = highlightedVerse 
      ? verses.findIndex(v => parseInt(v.verse) === highlightedVerse)
      : -1;
    
    if (direction === 'next') {
      if (currentIndex < verses.length - 1) {
        setHighlightedVerse(parseInt(verses[currentIndex + 1].verse));
      }
    } else {
      if (currentIndex > 0) {
        setHighlightedVerse(parseInt(verses[currentIndex - 1].verse));
      } else if (currentIndex === -1 && verses.length > 0) {
        setHighlightedVerse(parseInt(verses[0].verse));
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg font-semibold text-foreground">KJV Reader</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Book and Chapter Selectors */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border bg-muted/30">
        <Select value={selectedBook} onValueChange={(value) => {
          setSelectedBook(value);
          setSelectedChapter(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select book" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {BIBLE_BOOKS.map(book => (
              <SelectItem key={book.name} value={book.name}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedChapter.toString()} 
          onValueChange={(value) => setSelectedChapter(parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Chapter" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {Array.from({ length: maxChapters }, (_, i) => i + 1).map(num => (
              <SelectItem key={num} value={num.toString()}>
                Chapter {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Chapter navigation buttons */}
        <div className="flex items-center gap-1 ml-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevChapter}
            disabled={selectedBook === 'Genesis' && selectedChapter === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextChapter}
            disabled={selectedBook === 'Revelation' && selectedChapter === 22}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Verse-by-verse navigation */}
      {chapter && chapter.verses.length > 0 && (
        <div className="flex items-center justify-center gap-2 p-2 border-b border-border bg-muted/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateVerse('prev')}
            disabled={highlightedVerse === parseInt(chapter.verses[0].verse)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev Verse
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {highlightedVerse ? `Verse ${highlightedVerse}` : 'Tap a verse to highlight'}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateVerse('next')}
            disabled={highlightedVerse === parseInt(chapter.verses[chapter.verses.length - 1].verse)}
          >
            Next Verse
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Chapter content */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {chapter && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-center mb-6 text-foreground">
              {selectedBook} {selectedChapter}
            </h2>
            
            <div className="space-y-1">
              {chapter.verses.map((verse) => {
                const verseNum = parseInt(verse.verse);
                const isHighlighted = highlightedVerse === verseNum;
                
                return (
                  <div
                    key={verse.verse}
                    ref={(el) => {
                      if (el) verseRefs.current.set(verseNum, el);
                    }}
                    onClick={() => handleVerseClick(verseNum)}
                    className={cn(
                      "inline cursor-pointer transition-all duration-200 rounded px-1 -mx-1",
                      isHighlighted 
                        ? "bg-primary/20 text-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <sup className="text-xs font-semibold text-primary mr-1">
                      {verse.verse}
                    </sup>
                    <span className="font-serif text-foreground/90 leading-relaxed">
                      {verse.text}
                    </span>
                    {' '}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">
          King James Version (KJV) • Public Domain
        </p>
      </div>
    </div>
  );
}

export default ChapterReader;
