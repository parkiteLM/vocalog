export type JournalCategory = 'Task' | 'Reflection' | 'Event' | 'Note';

export interface JournalEntry {
  id: string;                     // UUID v4
  createdAt: string;              // ISO-8601 string (e.g. 2026-10-14T19:30:00.000Z)
  audioFilePath: string | null;   // Local .m4a path (nulled after 21 days)
  durationSeconds: number;        // Spoken recording duration
  rawTranscript: string;          // Raw on-device speech-to-text output
  title: string;                  // Short entry title
  cleanedEntry: string;           // Filler-free text
  summary: string;                // 1-sentence summary
  category: JournalCategory;      // Bullet Journal category
  actionItems: string[];          // Extracted action items
  tags: string[];                 // Custom labels
  isFormatted: boolean;           // Whether NLP structuring completed
}

export interface JournalEntryRow {
  id: string;
  created_at: string;
  audio_file_path: string | null;
  duration_seconds: number;
  raw_transcript: string;
  title: string;
  cleaned_entry: string;
  summary: string;
  category: string;
  action_items: string; // JSON string
  tags: string;         // JSON string
  is_formatted: number; // 0 or 1
}

export function entryToRow(entry: JournalEntry): JournalEntryRow {
  return {
    id: entry.id,
    created_at: entry.createdAt,
    audio_file_path: entry.audioFilePath,
    duration_seconds: entry.durationSeconds,
    raw_transcript: entry.rawTranscript,
    title: entry.title,
    cleaned_entry: entry.cleanedEntry,
    summary: entry.summary,
    category: entry.category,
    action_items: JSON.stringify(entry.actionItems || []),
    tags: JSON.stringify(entry.tags || []),
    is_formatted: entry.isFormatted ? 1 : 0,
  };
}

export function rowToEntry(row: JournalEntryRow): JournalEntry {
  let actionItems: string[] = [];
  let tags: string[] = [];

  try {
    actionItems = JSON.parse(row.action_items || '[]');
  } catch {
    actionItems = [];
  }

  try {
    tags = JSON.parse(row.tags || '[]');
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    audioFilePath: row.audio_file_path,
    durationSeconds: row.duration_seconds,
    rawTranscript: row.raw_transcript,
    title: row.title,
    cleanedEntry: row.cleaned_entry,
    summary: row.summary,
    category: (row.category as JournalCategory) || 'Note',
    actionItems,
    tags,
    isFormatted: row.is_formatted === 1,
  };
}

