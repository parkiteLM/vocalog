import { JournalEntry, entryToRow, rowToEntry } from '../src/data/models/JournalEntry';

describe('JournalEntry Model & Row Mapping', () => {
  const sampleEntry: JournalEntry = {
    id: 'test-uuid-1234',
    createdAt: '2026-10-14T20:00:00.000Z',
    audioFilePath: 'file:///data/recordings/vocalog_1234.m4a',
    durationSeconds: 75,
    rawTranscript: 'Had a breakthrough discussion on product architecture.',
    title: 'Product Architecture',
    cleanedEntry: 'Had a breakthrough discussion on product architecture.',
    summary: 'Discussion on architecture.',
    category: 'Reflection',
    actionItems: ['Document Phase 1 progress', 'Push to GitHub'],
    tags: ['Architecture', 'Mobile'],
    isFormatted: true,
  };

  it('correctly maps a JournalEntry domain model to a SQLite database row', () => {
    const row = entryToRow(sampleEntry);

    expect(row.id).toBe('test-uuid-1234');
    expect(row.created_at).toBe('2026-10-14T20:00:00.000Z');
    expect(row.audio_file_path).toBe('file:///data/recordings/vocalog_1234.m4a');
    expect(row.duration_seconds).toBe(75);
    expect(row.raw_transcript).toBe('Had a breakthrough discussion on product architecture.');
    expect(row.title).toBe('Product Architecture');
    expect(row.category).toBe('Reflection');
    expect(row.action_items).toBe(JSON.stringify(['Document Phase 1 progress', 'Push to GitHub']));
    expect(row.tags).toBe(JSON.stringify(['Architecture', 'Mobile']));
    expect(row.is_formatted).toBe(1);
  });

  it('correctly deserializes a SQLite row back into a clean JournalEntry domain model', () => {
    const row = entryToRow(sampleEntry);
    const restored = rowToEntry(row);

    expect(restored).toEqual(sampleEntry);
    expect(restored.actionItems).toEqual(['Document Phase 1 progress', 'Push to GitHub']);
    expect(restored.tags).toEqual(['Architecture', 'Mobile']);
    expect(restored.isFormatted).toBe(true);
  });

  it('gracefully handles empty and malformed JSON in database rows', () => {
    const rawRow = {
      id: 'fallback-uuid',
      created_at: '2026-10-14T10:00:00.000Z',
      audio_file_path: null,
      duration_seconds: 30,
      raw_transcript: 'Note without actions',
      title: 'Empty Note',
      cleaned_entry: 'Note without actions',
      summary: '',
      category: 'Note',
      action_items: 'invalid-json{',
      tags: '',
      is_formatted: 0,
    };

    const entry = rowToEntry(rawRow);
    expect(entry.actionItems).toEqual([]);
    expect(entry.tags).toEqual([]);
    expect(entry.isFormatted).toBe(false);
    expect(entry.audioFilePath).toBeNull();
  });
});

