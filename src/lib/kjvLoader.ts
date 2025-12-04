/**
 * KJV Bible Text Loader
 * 
 * Loads verse text from static JSON files stored in /public/kjv_books/
 * Each book is a separate JSON file with chapters and verses.
 * 
 * JSON Structure:
 * {
 *   "book": "John",
 *   "chapters": [
 *     { "chapter": "1", "verses": [{ "verse": "1", "text": "..." }] }
 *   ]
 * }
 */

// Book name to filename mapping (handles spaces and numbered books)
// Files use no spaces (e.g., "1Samuel.json" not "1 Samuel.json")
const BOOK_FILE_MAP: Record<string, string> = {
  'Genesis': 'Genesis',
  'Exodus': 'Exodus',
  'Leviticus': 'Leviticus',
  'Numbers': 'Numbers',
  'Deuteronomy': 'Deuteronomy',
  'Joshua': 'Joshua',
  'Judges': 'Judges',
  'Ruth': 'Ruth',
  '1 Samuel': '1Samuel',
  '1Samuel': '1Samuel',
  '2 Samuel': '2Samuel',
  '2Samuel': '2Samuel',
  '1 Kings': '1Kings',
  '1Kings': '1Kings',
  '2 Kings': '2Kings',
  '2Kings': '2Kings',
  '1 Chronicles': '1Chronicles',
  '1Chronicles': '1Chronicles',
  '2 Chronicles': '2Chronicles',
  '2Chronicles': '2Chronicles',
  'Ezra': 'Ezra',
  'Nehemiah': 'Nehemiah',
  'Esther': 'Esther',
  'Job': 'Job',
  'Psalms': 'Psalms',
  'Psalm': 'Psalms',
  'Proverbs': 'Proverbs',
  'Ecclesiastes': 'Ecclesiastes',
  'Song of Solomon': 'SongofSolomon',
  'SongofSolomon': 'SongofSolomon',
  'Isaiah': 'Isaiah',
  'Jeremiah': 'Jeremiah',
  'Lamentations': 'Lamentations',
  'Ezekiel': 'Ezekiel',
  'Daniel': 'Daniel',
  'Hosea': 'Hosea',
  'Joel': 'Joel',
  'Amos': 'Amos',
  'Obadiah': 'Obadiah',
  'Jonah': 'Jonah',
  'Micah': 'Micah',
  'Nahum': 'Nahum',
  'Habakkuk': 'Habakkuk',
  'Zephaniah': 'Zephaniah',
  'Haggai': 'Haggai',
  'Zechariah': 'Zechariah',
  'Malachi': 'Malachi',
  'Matthew': 'Matthew',
  'Mark': 'Mark',
  'Luke': 'Luke',
  'John': 'John',
  'Acts': 'Acts',
  'Romans': 'Romans',
  '1 Corinthians': '1Corinthians',
  '1Corinthians': '1Corinthians',
  '2 Corinthians': '2Corinthians',
  '2Corinthians': '2Corinthians',
  'Galatians': 'Galatians',
  'Ephesians': 'Ephesians',
  'Philippians': 'Philippians',
  'Colossians': 'Colossians',
  '1 Thessalonians': '1Thessalonians',
  '1Thessalonians': '1Thessalonians',
  '2 Thessalonians': '2Thessalonians',
  '2Thessalonians': '2Thessalonians',
  '1 Timothy': '1Timothy',
  '1Timothy': '1Timothy',
  '2 Timothy': '2Timothy',
  '2Timothy': '2Timothy',
  'Titus': 'Titus',
  'Philemon': 'Philemon',
  'Hebrews': 'Hebrews',
  'James': 'James',
  '1 Peter': '1Peter',
  '1Peter': '1Peter',
  '2 Peter': '2Peter',
  '2Peter': '2Peter',
  '1 John': '1John',
  '1John': '1John',
  '2 John': '2John',
  '2John': '2John',
  '3 John': '3John',
  '3John': '3John',
  'Jude': 'Jude',
  'Revelation': 'Revelation',
  'Revelations': 'Revelation',
};

// Cache for loaded books to avoid repeated fetches
const bookCache: Map<string, KJVBook> = new Map();

interface KJVVerse {
  verse: string;
  text: string;
}

interface KJVChapter {
  chapter: string;
  verses: KJVVerse[];
}

interface KJVBook {
  book: string;
  chapters: KJVChapter[];
}

/**
 * Parse a verse reference into its components
 * Examples: "John 3:16", "1 Corinthians 13:4-7", "Psalm 23:1"
 */
export function parseReference(reference: string): {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
} | null {
  // Match patterns like "John 3:16" or "1 John 3:16" or "John 3:16-18"
  const match = reference.match(/^(\d?\s?[A-Za-z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
  
  if (!match) {
    console.error(`Invalid verse reference format: ${reference}`);
    return null;
  }

  const book = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const startVerse = parseInt(match[3], 10);
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

  return { book, chapter, startVerse, endVerse };
}

/**
 * Load a book's JSON file from the static files
 */
async function loadBook(bookName: string): Promise<KJVBook | null> {
  const fileName = BOOK_FILE_MAP[bookName];
  
  if (!fileName) {
    console.error(`Unknown book: ${bookName}`);
    return null;
  }

  // Check cache first
  if (bookCache.has(fileName)) {
    return bookCache.get(fileName)!;
  }

  try {
    const response = await fetch(`/kjv_books/${fileName}.json`);
    
    if (!response.ok) {
      console.error(`Failed to load book ${fileName}: ${response.status}`);
      return null;
    }

    const book: KJVBook = await response.json();
    bookCache.set(fileName, book);
    return book;
  } catch (error) {
    console.error(`Error loading book ${fileName}:`, error);
    return null;
  }
}

/**
 * Get verse text by reference
 * @param reference - e.g., "John 3:16" or "Psalm 23:1-3"
 * @returns The verse text or null if not found
 */
export async function getVerseText(reference: string): Promise<string | null> {
  const parsed = parseReference(reference);
  
  if (!parsed) {
    return null;
  }

  const book = await loadBook(parsed.book);
  
  if (!book) {
    return null;
  }

  const chapter = book.chapters.find(c => parseInt(c.chapter, 10) === parsed.chapter);
  
  if (!chapter) {
    console.error(`Chapter ${parsed.chapter} not found in ${parsed.book}`);
    return null;
  }

  // Collect verses in the range
  const verses: string[] = [];
  
  for (let v = parsed.startVerse; v <= parsed.endVerse; v++) {
    const verse = chapter.verses.find(ver => parseInt(ver.verse, 10) === v);
    if (verse) {
      verses.push(verse.text);
    }
  }

  if (verses.length === 0) {
    console.error(`Verses ${parsed.startVerse}-${parsed.endVerse} not found in ${parsed.book} ${parsed.chapter}`);
    return null;
  }

  return verses.join(' ');
}

/**
 * Get multiple verses with their references
 * Useful for context display (± surrounding verses)
 */
export async function getVersesWithContext(
  reference: string,
  contextBefore: number = 2,
  contextAfter: number = 2
): Promise<Array<{ reference: string; text: string }> | null> {
  const parsed = parseReference(reference);
  
  if (!parsed) {
    return null;
  }

  const book = await loadBook(parsed.book);
  
  if (!book) {
    return null;
  }

  const chapter = book.chapters.find(c => parseInt(c.chapter, 10) === parsed.chapter);
  
  if (!chapter) {
    return null;
  }

  const startVerse = Math.max(1, parsed.startVerse - contextBefore);
  const endVerse = Math.min(chapter.verses.length, parsed.endVerse + contextAfter);

  const results: Array<{ reference: string; text: string }> = [];

  for (let v = startVerse; v <= endVerse; v++) {
    const verse = chapter.verses.find(ver => parseInt(ver.verse, 10) === v);
    if (verse) {
      results.push({
        reference: `${parsed.book} ${parsed.chapter}:${v}`,
        text: verse.text,
      });
    }
  }

  return results;
}

/**
 * Get an entire chapter
 */
export async function getChapter(
  bookName: string,
  chapterNum: number
): Promise<KJVChapter | null> {
  const book = await loadBook(bookName);
  
  if (!book) {
    return null;
  }

  return book.chapters.find(c => parseInt(c.chapter, 10) === chapterNum) || null;
}

/**
 * Preload commonly used books for faster access
 */
export async function preloadBooks(bookNames: string[]): Promise<void> {
  await Promise.all(bookNames.map(loadBook));
}

/**
 * Clear the book cache (useful for memory management)
 */
export function clearBookCache(): void {
  bookCache.clear();
}

/**
 * Get all book names
 */
export function getAllBookNames(): string[] {
  return [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
    'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];
}
