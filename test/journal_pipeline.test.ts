const mockTranscribeAudio = jest.fn();

jest.mock('../src/data/services/WhisperTranscriptionService', () => ({
  whisperTranscriptionService: {
    transcribeAudio: (path: string, options?: any) => mockTranscribeAudio(path, options),
  },
}));

const mockInsertEntry = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/data/services/DatabaseService', () => ({
  databaseService: {
    insertEntry: (entry: any) => mockInsertEntry(entry),
  },
}));

import { journalPipelineService } from '../src/data/services/JournalPipelineService';
import { JournalEntry } from '../src/data/models/JournalEntry';

describe('JournalPipelineService (End-to-End Orchestrator)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('transcribes, structures, and persists an audio recording to SQLite', async () => {
    mockTranscribeAudio.mockResolvedValue(
      'Um, today I really need to call Dave about the software architecture. Remember to send the spec sheet.'
    );

    const audioFilePath = 'file:///mock/documents/recordings/vocalog_123.m4a';
    const durationSeconds = 35;

    const entry: JournalEntry = await journalPipelineService.processAudioRecording(
      audioFilePath,
      durationSeconds
    );

    // 1. Verify Whisper STT was invoked with audio path
    expect(mockTranscribeAudio).toHaveBeenCalledWith(
      audioFilePath,
      expect.objectContaining({})
    );

    // 2. Verify returned entry domain properties
    expect(entry.id).toBeDefined();
    expect(entry.id.length).toBeGreaterThan(10);
    expect(entry.audioFilePath).toBe(audioFilePath);
    expect(entry.durationSeconds).toBe(durationSeconds);
    expect(entry.createdAt).toBeDefined();

    // 3. Verify text structuring results
    expect(entry.rawTranscript).toBe(
      'Um, today I really need to call Dave about the software architecture. Remember to send the spec sheet.'
    );
    expect(entry.cleanedEntry).not.toContain('Um');
    expect(entry.category).toBe('Task');
    expect(entry.actionItems.length).toBeGreaterThanOrEqual(1);
    expect(entry.title).toBeDefined();
    expect(entry.summary).toBeDefined();
    expect(entry.isFormatted).toBe(true);

    // 4. Verify database persistence was called with the entry
    expect(mockInsertEntry).toHaveBeenCalledWith(entry);
  });

  it('supports rawTranscriptOverride to bypass Whisper transcription when provided', async () => {
    const overrideTranscript =
      'Reflecting on today: I felt peaceful during my morning meditation and realized consistency is key.';

    const entry = await journalPipelineService.processAudioRecording(
      'file:///mock/documents/recordings/manual.m4a',
      12,
      { rawTranscriptOverride: overrideTranscript }
    );

    // Should not call Whisper when override is provided
    expect(mockTranscribeAudio).not.toHaveBeenCalled();

    expect(entry.rawTranscript).toBe(overrideTranscript);
    expect(entry.category).toBe('Reflection');
    expect(entry.isFormatted).toBe(true);
    expect(mockInsertEntry).toHaveBeenCalledWith(entry);
  });
});
