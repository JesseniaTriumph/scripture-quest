/**
 * useKJV Hook
 * 
 * React hook for loading KJV Bible verses from static JSON files.
 * Provides loading state, error handling, and caching via the kjvLoader utility.
 */

import { useState, useEffect, useCallback } from 'react';
import { getVerseText, getVersesWithContext, getChapter, preloadBooks } from '@/lib/kjvLoader';

interface KJVChapter {
  chapter: string;
  verses: Array<{ verse: string; text: string }>;
}

interface UseKJVVerseResult {
  text: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseKJVContextResult {
  verses: Array<{ reference: string; text: string }> | null;
  loading: boolean;
  error: string | null;
}

interface UseKJVChapterResult {
  chapter: KJVChapter | null;
  loading: boolean;
  error: string | null;
}

/**
 * Load a single verse or verse range by reference
 * @param reference - e.g., "John 3:16" or "Psalm 23:1-3"
 */
export function useKJVVerse(reference: string | null): UseKJVVerseResult {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = useCallback(async () => {
    if (!reference) {
      setText(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getVerseText(reference);
      if (result) {
        setText(result);
      } else {
        setError(`Verse not found: ${reference}`);
        setText(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verse');
      setText(null);
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    fetchVerse();
  }, [fetchVerse]);

  return { text, loading, error, refetch: fetchVerse };
}

/**
 * Load verses with surrounding context
 * @param reference - e.g., "John 3:16"
 * @param contextBefore - Number of verses before (default: 2)
 * @param contextAfter - Number of verses after (default: 2)
 */
export function useKJVContext(
  reference: string | null,
  contextBefore: number = 2,
  contextAfter: number = 2
): UseKJVContextResult {
  const [verses, setVerses] = useState<Array<{ reference: string; text: string }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setVerses(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchContext = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getVersesWithContext(reference, contextBefore, contextAfter);
        if (result) {
          setVerses(result);
        } else {
          setError(`Context not found for: ${reference}`);
          setVerses(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load context');
        setVerses(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [reference, contextBefore, contextAfter]);

  return { verses, loading, error };
}

/**
 * Load an entire chapter
 * @param bookName - e.g., "John"
 * @param chapterNum - e.g., 3
 */
export function useKJVChapter(
  bookName: string | null,
  chapterNum: number | null
): UseKJVChapterResult {
  const [chapter, setChapter] = useState<KJVChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookName || chapterNum === null) {
      setChapter(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchChapter = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getChapter(bookName, chapterNum);
        if (result) {
          setChapter(result);
        } else {
          setError(`Chapter not found: ${bookName} ${chapterNum}`);
          setChapter(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapter');
        setChapter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [bookName, chapterNum]);

  return { chapter, loading, error };
}

/**
 * Preload commonly used books for faster access
 * Call this on app initialization or when entering game modes
 */
export function usePreloadKJV(bookNames: string[]) {
  useEffect(() => {
    if (bookNames.length > 0) {
      preloadBooks(bookNames);
    }
  }, [bookNames.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}
