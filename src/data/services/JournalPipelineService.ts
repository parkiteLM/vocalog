import { JournalEntry } from '../models/JournalEntry';
import { databaseService } from './DatabaseService';
import { textStructuringService } from './TextStructuringService';
import { whisperTranscriptionService } from './WhisperTranscriptionService';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface PipelineOptions {
  onTranscriptionProgress?: (progress: number) => void;
  rawTranscriptOverride?: string; // Useful for manual notes or fallback
}

export class JournalPipelineService {
  /**
   * Complete end-to-end processing pipeline:
   * 1. Transcribes audio file on-device via Whisper C++ engine.
   * 2. Cleans verbal filler words and formats text.
   * 3. Categorizes entry (Task, Reflection, Event, Note).
   * 4. Extracts actionable checklist bullet items.
   * 5. Synthesizes title and executive summary.
   * 6. Persists structured entry to local SQLite database.
   */
  async processAudioRecording(
    audioFilePath: string,
    durationSeconds: number,
    options?: PipelineOptions
  ): Promise<JournalEntry> {
    // 1. On-device Speech-to-Text via Whisper (or use override if provided)
    let rawTranscript = options?.rawTranscriptOverride;
    if (rawTranscript === undefined) {
      rawTranscript = await whisperTranscriptionService.transcribeAudio(audioFilePath, {
        onProgress: options?.onTranscriptionProgress,
      });
    }

    // 2. Zero-cost local text structuring
    const structured = textStructuringService.structureRawTranscript(rawTranscript);

    // 3. Construct domain JournalEntry model
    const entry: JournalEntry = {
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      audioFilePath,
      durationSeconds,
      rawTranscript,
      cleanedEntry: structured.cleanedEntry,
      category: structured.category,
      actionItems: structured.actionItems,
      title: structured.title,
      summary: structured.summary,
      tags: [structured.category],
      isFormatted: true,
    };

    // 4. Save permanently to SQLite
    await databaseService.insertEntry(entry);

    return entry;
  }
}

export const journalPipelineService = new JournalPipelineService();

