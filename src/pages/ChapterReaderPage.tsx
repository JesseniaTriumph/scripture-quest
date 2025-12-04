/**
 * ChapterReaderPage
 * 
 * Full-page route for the KJV Chapter Reader.
 * Parses URL params for initial book/chapter/verse.
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChapterReader } from '@/components/ChapterReader';

export default function ChapterReaderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const book = searchParams.get('book') || 'John';
  const chapter = parseInt(searchParams.get('chapter') || '3');
  const verse = searchParams.get('verse') ? parseInt(searchParams.get('verse')!) : undefined;

  return (
    <div className="h-screen">
      <ChapterReader
        initialBook={book}
        initialChapter={chapter}
        initialVerse={verse}
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
