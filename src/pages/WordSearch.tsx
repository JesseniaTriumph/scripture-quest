import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHearts } from "@/hooks/useHearts";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { HeartsDisplay } from "@/components/HeartsDisplay";
import { CharacterGuide } from "@/components/CharacterGuide";
import { getCharacterForContext } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

type Cell = {
  letter: string;
  row: number;
  col: number;
  wordIndex: number;
  letterIndex: number;
};

export default function WordSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const { user } = useAuth();
  const { hearts, loseHeart, refreshHearts } = useHearts();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<Set<number>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);

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

      if (error || !data) {
        toast.error("Failed to load verse");
        navigate("/");
        return;
      }

      setVerse(data);
      generateWordSearch(data.text);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate]);

  const generateWordSearch = (text: string) => {
    // Extract key words (3+ letters, exclude common words)
    const commonWords = new Set(['the', 'and', 'but', 'for', 'not', 'with', 'that', 'this', 'from', 'they', 'have', 'been', 'were', 'said', 'are', 'his', 'her', 'was', 'all', 'you']);
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !commonWords.has(w))
      .slice(0, 8);

    setTargetWords(words);

    // Create 12x12 grid
    const size = 12;
    const newGrid: Cell[][] = Array(size).fill(null).map((_, row) =>
      Array(size).fill(null).map((_, col) => ({
        letter: '',
        row,
        col,
        wordIndex: -1,
        letterIndex: -1
      }))
    );

    // Place words in grid (horizontal, vertical, or diagonal)
    words.forEach((word, wordIndex) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 50) {
        const direction = Math.floor(Math.random() * 4); // 0: right, 1: down, 2: diagonal-right, 3: diagonal-left
        const startRow = Math.floor(Math.random() * size);
        const startCol = Math.floor(Math.random() * size);

        if (canPlaceWord(newGrid, word, startRow, startCol, direction, size)) {
          placeWord(newGrid, word, startRow, startCol, direction, wordIndex);
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells with random letters
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!newGrid[row][col].letter) {
          newGrid[row][col].letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
  };

  const canPlaceWord = (grid: Cell[][], word: string, startRow: number, startCol: number, direction: number, size: number): boolean => {
    const dirMap = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const [dRow, dCol] = dirMap[direction];

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      if (row < 0 || row >= size || col < 0 || col >= size) return false;
      if (grid[row][col].letter && grid[row][col].letter !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (grid: Cell[][], word: string, startRow: number, startCol: number, direction: number, wordIndex: number) => {
    const dirMap = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const [dRow, dCol] = dirMap[direction];

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;
      grid[row][col].letter = word[i];
      grid[row][col].wordIndex = wordIndex;
      grid[row][col].letterIndex = i;
    }
  };

  const handleMouseDown = (cell: Cell) => {
    if (completed || foundWords.has(cell.wordIndex)) return;
    setIsDragging(true);
    setSelectedCells([cell]);
  };

  const handleMouseEnter = (cell: Cell) => {
    if (!isDragging || completed) return;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;

    // Only allow continuous selection in same direction
    if (selectedCells.length > 0) {
      const isAdjacent = 
        Math.abs(cell.row - lastCell.row) <= 1 && 
        Math.abs(cell.col - lastCell.col) <= 1 &&
        !(cell.row === lastCell.row && cell.col === lastCell.col);

      if (isAdjacent && !selectedCells.some(c => c.row === cell.row && c.col === cell.col)) {
        setSelectedCells([...selectedCells, cell]);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Check if selected cells form a word
    const selectedWord = selectedCells.map(c => c.letter).join('');
    const wordIndex = targetWords.findIndex(w => w === selectedWord.toLowerCase());

    if (wordIndex !== -1 && !foundWords.has(wordIndex)) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(wordIndex);
      setFoundWords(newFoundWords);
      toast.success(`Found: ${targetWords[wordIndex]}`);

      if (newFoundWords.size === targetWords.length) {
        handleComplete();
      }
    }

    setSelectedCells([]);
  };

  const handleComplete = async () => {
    if (!verse || !user) return;

    setCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const xpEarned = verse.xp_reward;
    const coinsEarned = Math.floor(xpEarned / 10);

    try {
      await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verse.id,
        p_correct: true,
        p_xp_earned: xpEarned,
        p_coins_earned: coinsEarned
      });

      toast.success(`Earned ${xpEarned} XP and ${coinsEarned} coins!`);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(c => c.row === row && c.col === col);
  };

  const isCellFound = (wordIndex: number) => {
    return foundWords.has(wordIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <HeartsDisplay />
        </div>

        <h1 className="text-2xl font-bold text-center">{verse.reference}</h1>

        <CharacterGuide 
          character={getCharacterForContext("learn")} 
          message={completed 
            ? "Amazing work! You found all the words! 🎉" 
            : "Find all the hidden words from the verse. Drag across letters to select them!"
          }
        />

        <Card className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Find these words:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {targetWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      foundWords.has(idx)
                        ? "bg-green-500/20 text-green-700 dark:text-green-300 line-through"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className="inline-grid gap-1"
                style={{ gridTemplateColumns: `repeat(12, minmax(0, 1fr))` }}
                onMouseLeave={handleMouseUp}
              >
                {grid.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      className={`w-8 h-8 sm:w-10 sm:h-10 border rounded flex items-center justify-center font-medium text-sm transition-colors ${
                        isCellFound(cell.wordIndex)
                          ? "bg-green-500/30 border-green-500 text-green-700 dark:text-green-300"
                          : isCellSelected(rowIdx, colIdx)
                          ? "bg-primary/40 border-primary"
                          : "bg-muted border-border hover:bg-muted/80"
                      }`}
                      onMouseDown={() => handleMouseDown(cell)}
                      onMouseEnter={() => handleMouseEnter(cell)}
                      onMouseUp={handleMouseUp}
                    >
                      {cell.letter.toUpperCase()}
                    </button>
                  ))
                )}
              </div>
            </div>

            {completed && (
              <div className="text-center space-y-4 pt-4 border-t">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  All words found! 🎉
                </p>
                <Button onClick={() => navigate(`/game-selection?verseId=${verseId}&verseRef=${verse.reference}`)}>
                  Continue
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
