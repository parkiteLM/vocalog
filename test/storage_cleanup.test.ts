jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: true }),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/data/services/DatabaseService', () => ({
  databaseService: {
    getRetentionDays: jest.fn().mockResolvedValue(21),
    getEntriesOlderThan: jest.fn().mockResolvedValue([]),
    clearAudioPath: jest.fn().mockResolvedValue(undefined),
  },
}));

import { storageCleanupService } from '../src/data/services/StorageCleanupService';

describe('StorageCleanupService & 21-Day Retention Logic', () => {
  it('correctly calculates the 21-day cutoff boundary from a reference date', () => {
    // Reference date: Oct 25, 2026, 12:00:00 UTC
    const referenceDate = new Date('2026-10-25T12:00:00.000Z');
    
    // 21 days earlier must be Oct 4, 2026, 12:00:00 UTC
    const cutoffDate = storageCleanupService.calculateCutoffDate(21, referenceDate);

    expect(cutoffDate.toISOString()).toBe('2026-10-04T12:00:00.000Z');
  });

  it('correctly classifies dates as older or newer than the 21-day cutoff threshold', () => {
    const referenceDate = new Date('2026-10-25T12:00:00.000Z');
    const cutoff = storageCleanupService.calculateCutoffDate(21, referenceDate);

    const recordingA = new Date('2026-10-03T12:00:00.000Z'); // 22 days old (EXPIRED)
    const recordingB = new Date('2026-10-05T12:00:00.000Z'); // 20 days old (RETAINED)
    const recordingC = new Date('2026-10-24T12:00:00.000Z'); // 1 day old (RETAINED)

    expect(recordingA.getTime() < cutoff.getTime()).toBe(true);
    expect(recordingB.getTime() < cutoff.getTime()).toBe(false);
    expect(recordingC.getTime() < cutoff.getTime()).toBe(false);
  });

  it('supports custom retention days for future Pro tier configuration (e.g. 7, 14, 60 days)', () => {
    const referenceDate = new Date('2026-10-25T12:00:00.000Z');

    // 7-day cutoff: Oct 18
    const cutoff7 = storageCleanupService.calculateCutoffDate(7, referenceDate);
    expect(cutoff7.toISOString()).toBe('2026-10-18T12:00:00.000Z');

    // 60-day cutoff: Aug 26
    const cutoff60 = storageCleanupService.calculateCutoffDate(60, referenceDate);
    expect(cutoff60.toISOString()).toBe('2026-08-26T12:00:00.000Z');
  });
});
