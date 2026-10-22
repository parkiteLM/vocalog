const mockGetInfoAsync = jest.fn();
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);
const mockReadDirectoryAsync = jest.fn().mockResolvedValue([]);

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  getInfoAsync: (uri: string) => mockGetInfoAsync(uri),
  deleteAsync: (uri: string, opts: any) => mockDeleteAsync(uri, opts),
  readDirectoryAsync: (dir: string) => mockReadDirectoryAsync(dir),
}));

const mockGetRetentionDays = jest.fn().mockResolvedValue(21);
const mockGetEntriesOlderThan = jest.fn().mockResolvedValue([]);
const mockClearAudioPath = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/data/services/DatabaseService', () => ({
  databaseService: {
    getRetentionDays: () => mockGetRetentionDays(),
    getEntriesOlderThan: (cutoff: string) => mockGetEntriesOlderThan(cutoff),
    clearAudioPath: (id: string) => mockClearAudioPath(id),
  },
}));

import { storageCleanupService } from '../src/data/services/StorageCleanupService';

describe('StorageCleanupService.runAutoCleanup execution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRetentionDays.mockResolvedValue(21);
    mockGetEntriesOlderThan.mockResolvedValue([]);
    mockReadDirectoryAsync.mockResolvedValue([]);
    mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true });
  });

  it('purges physical .m4a files and unlinks audio path in database for expired entries', async () => {
    const expiredEntry1 = {
      id: 'entry-1',
      createdAt: '2026-09-01T12:00:00.000Z',
      audioFilePath: 'file:///mock/documents/recordings/vocalog_expired_1.m4a',
    };
    const expiredEntry2 = {
      id: 'entry-2',
      createdAt: '2026-09-02T12:00:00.000Z',
      audioFilePath: 'file:///mock/documents/recordings/vocalog_expired_2.m4a',
    };

    mockGetEntriesOlderThan.mockResolvedValue([expiredEntry1, expiredEntry2]);
    mockGetInfoAsync.mockImplementation(async (uri: string) => {
      return { exists: true, isDirectory: false };
    });

    const result = await storageCleanupService.runAutoCleanup(21);

    expect(mockDeleteAsync).toHaveBeenCalledWith(
      'file:///mock/documents/recordings/vocalog_expired_1.m4a',
      { idempotent: true }
    );
    expect(mockDeleteAsync).toHaveBeenCalledWith(
      'file:///mock/documents/recordings/vocalog_expired_2.m4a',
      { idempotent: true }
    );
    expect(mockClearAudioPath).toHaveBeenCalledWith('entry-1');
    expect(mockClearAudioPath).toHaveBeenCalledWith('entry-2');

    expect(result.purgedFilesCount).toBe(2);
    expect(result.entriesUpdatedCount).toBe(2);
  });

  it('handles already-deleted physical files gracefully and still unlinks DB audio path', async () => {
    const missingFileEntry = {
      id: 'entry-missing',
      createdAt: '2026-09-01T12:00:00.000Z',
      audioFilePath: 'file:///mock/documents/recordings/non_existent.m4a',
    };

    mockGetEntriesOlderThan.mockResolvedValue([missingFileEntry]);
    mockGetInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.includes('non_existent.m4a')) {
        return { exists: false, isDirectory: false };
      }
      return { exists: true, isDirectory: true };
    });

    const result = await storageCleanupService.runAutoCleanup(21);

    expect(mockClearAudioPath).toHaveBeenCalledWith('entry-missing');
    expect(result.entriesUpdatedCount).toBe(1);
    expect(result.purgedFilesCount).toBe(0);
  });

  it('purges orphaned .m4a files in recordings folder that are older than cutoff', async () => {
    mockGetEntriesOlderThan.mockResolvedValue([]);
    mockReadDirectoryAsync.mockResolvedValue([
      'orphaned_old.m4a',
      'recent_audio.m4a',
      'ignore.txt',
    ]);

    const oldModTimeSec = Math.floor(new Date('2026-09-01T00:00:00.000Z').getTime() / 1000);
    const recentModTimeSec = Math.floor(Date.now() / 1000);

    mockGetInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.includes('orphaned_old.m4a')) {
        return { exists: true, isDirectory: false, modificationTime: oldModTimeSec };
      }
      if (uri.includes('recent_audio.m4a')) {
        return { exists: true, isDirectory: false, modificationTime: recentModTimeSec };
      }
      return { exists: true, isDirectory: true };
    });

    const result = await storageCleanupService.runAutoCleanup(21);

    expect(mockDeleteAsync).toHaveBeenCalledWith(
      'file:///mock/documents/recordings/orphaned_old.m4a',
      { idempotent: true }
    );
    expect(mockDeleteAsync).not.toHaveBeenCalledWith(
      'file:///mock/documents/recordings/recent_audio.m4a',
      expect.anything()
    );
    expect(result.purgedFilesCount).toBe(1);
  });
});

