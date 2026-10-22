const mockWriteAsStringAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  writeAsStringAsync: (...args: any[]) => mockWriteAsStringAsync(...args),
  EncodingType: {
    UTF8: 'utf8',
  },
}));

const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
const mockShareAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (...args: any[]) => mockShareAsync(...args),
}));

import { DataExportService } from '../src/data/services/DataExportService';
import { JournalEntry } from '../src/data/models/JournalEntry';

describe('DataExportService', () => {
  let service: DataExportService;

  const mockEntries: JournalEntry[] = [
    {
      id: 'entry-1',
      createdAt: '2026-10-22T14:30:00.000Z',
      audioFilePath: 'file:///mock/recordings/rec_1.m4a',
      durationSeconds: 45,
      rawTranscript: 'Send client proposal by end of day tomorrow.',
      cleanedEntry: 'Send client proposal by end of day tomorrow.',
      category: 'Task',
      actionItems: ['Send client proposal by end of day tomorrow'],
      title: 'Client Proposal Task',
      summary: 'Action item to send client proposal tomorrow.',
      tags: ['Task'],
      isFormatted: true,
    },
    {
      id: 'entry-2',
      createdAt: '2026-10-22T15:00:00.000Z',
      audioFilePath: null,
      durationSeconds: 120,
      rawTranscript: 'Thinking about the new architecture today.',
      cleanedEntry: 'Reflecting on modular architecture benefits.',
      category: 'Reflection',
      actionItems: [],
      title: 'Architecture Ideas',
      summary: 'Modular architecture reflections.',
      tags: ['Idea'],
      isFormatted: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DataExportService();
  });

  describe('exportEntriesAsJSON', () => {
    it('creates a valid JSON archive with metadata and writes to file system', async () => {
      const filePath = await service.exportEntriesAsJSON(mockEntries);

      expect(filePath).toMatch(/^file:\/\/\/mock\/documents\/vocalog_archive_\d+\.json$/);
      expect(mockWriteAsStringAsync).toHaveBeenCalledTimes(1);

      const writtenFilePath = mockWriteAsStringAsync.mock.calls[0][0];
      const writtenContent = mockWriteAsStringAsync.mock.calls[0][1];
      const writtenOptions = mockWriteAsStringAsync.mock.calls[0][2];

      expect(writtenFilePath).toBe(filePath);
      expect(writtenOptions).toEqual({ encoding: 'utf8' });

      const parsed = JSON.parse(writtenContent);
      expect(parsed.app).toBe('VocaLog');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.totalEntries).toBe(2);
      expect(parsed.entries).toHaveLength(2);
      expect(parsed.entries[0].id).toBe('entry-1');
      expect(parsed.entries[1].id).toBe('entry-2');
    });
  });

  describe('exportEntriesAsMarkdown', () => {
    it('formats entries with titles, summaries, action checkboxes, and prose', async () => {
      const filePath = await service.exportEntriesAsMarkdown(mockEntries);

      expect(filePath).toMatch(/^file:\/\/\/mock\/documents\/vocalog_journal_\d+\.md$/);
      expect(mockWriteAsStringAsync).toHaveBeenCalledTimes(1);

      const writtenContent = mockWriteAsStringAsync.mock.calls[0][1];

      expect(writtenContent).toContain('# VocaLog Journal Archive');
      expect(writtenContent).toContain('## Client Proposal Task');
      expect(writtenContent).toContain('> **Executive Summary:** Action item to send client proposal tomorrow.');
      expect(writtenContent).toContain('### Action Items');
      expect(writtenContent).toContain('- [ ] Send client proposal by end of day tomorrow');
      expect(writtenContent).toContain('## Architecture Ideas');
      expect(writtenContent).toContain('Reflecting on modular architecture benefits.');
      expect(writtenContent).toContain('100% Offline • Private Zero-Cloud Archive');
    });

    it('handles empty entries array gracefully in markdown output', async () => {
      const filePath = await service.exportEntriesAsMarkdown([]);
      expect(mockWriteAsStringAsync).toHaveBeenCalledTimes(1);

      const writtenContent = mockWriteAsStringAsync.mock.calls[0][1];
      expect(writtenContent).toContain('*No entries recorded.*');
    });
  });

  describe('shareExportFile', () => {
    it('calls native sharing when available', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(true);

      const success = await service.shareExportFile('file:///mock/documents/test.json', 'application/json');

      expect(success).toBe(true);
      expect(mockShareAsync).toHaveBeenCalledWith('file:///mock/documents/test.json', {
        mimeType: 'application/json',
        dialogTitle: 'Export VocaLog Journal Archive',
        UTI: 'public.json',
      });
    });

    it('throws error when sharing is not available on device', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(false);

      await expect(
        service.shareExportFile('file:///mock/documents/test.json', 'application/json')
      ).rejects.toThrow('Native file sharing is not available on this platform.');
    });
  });
});
