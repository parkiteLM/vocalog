import * as FileSystem from 'expo-file-system/legacy';
import { databaseService } from './DatabaseService';

export interface CleanupResult {
  purgedFilesCount: number;
  entriesUpdatedCount: number;
  cutoffDate: Date;
}

class StorageCleanupService {
  /**
   * Calculates the cutoff timestamp given a retention period in days.
   */
  calculateCutoffDate(retentionDays: number, fromDate: Date = new Date()): Date {
    const cutoff = new Date(fromDate);
    cutoff.setDate(cutoff.getDate() - retentionDays);
    return cutoff;
  }

  /**
   * Executes the local audio auto-cleanup routine.
   * Scans local recordings, deletes .m4a files older than retentionDays (default: 21),
   * and unlinks audio_file_path from the SQLite database while keeping all text permanent.
   */
  async runAutoCleanup(overrideDays?: number): Promise<CleanupResult> {
    const retentionDays = overrideDays ?? (await databaseService.getRetentionDays());
    const cutoffDate = this.calculateCutoffDate(retentionDays);
    const cutoffIsoString = cutoffDate.toISOString();

    let purgedFilesCount = 0;
    let entriesUpdatedCount = 0;

    try {
      // 1. Fetch entries in SQLite older than cutoff that still point to an audio file
      const expiredEntries = await databaseService.getEntriesOlderThan(cutoffIsoString);

      for (const entry of expiredEntries) {
        if (entry.audioFilePath) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(entry.audioFilePath);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(entry.audioFilePath, { idempotent: true });
              purgedFilesCount++;
            }
          } catch (fileErr) {
            // File might have already been removed manually or by OS
          }

          // 2. Unlink audio_file_path in database (preserves text, summary, action items)
          await databaseService.clearAudioPath(entry.id);
          entriesUpdatedCount++;
        }
      }

      // 3. Scan the physical recordings folder to clean up any orphaned .m4a files older than cutoff
      const recordingsDir = `${FileSystem.documentDirectory}recordings/`;
      const dirInfo = await FileSystem.getInfoAsync(recordingsDir);

      if (dirInfo.exists && dirInfo.isDirectory) {
        const fileNames = await FileSystem.readDirectoryAsync(recordingsDir);
        const cutoffEpoch = cutoffDate.getTime();

        for (const fileName of fileNames) {
          if (fileName.endsWith('.m4a')) {
            const filePath = `${recordingsDir}${fileName}`;
            try {
              const fileStat = await FileSystem.getInfoAsync(filePath);
              // If file modification time is older than cutoff, remove it
              if (fileStat.exists && fileStat.modificationTime) {
                const modTimeMs = fileStat.modificationTime * 1000;
                if (modTimeMs < cutoffEpoch) {
                  await FileSystem.deleteAsync(filePath, { idempotent: true });
                  purgedFilesCount++;
                }
              }
            } catch {
              // Non-fatal cleanup issue
            }
          }
        }
      }
    } catch (error) {
      console.warn('StorageCleanupService error during auto-cleanup:', error);
    }

    return {
      purgedFilesCount,
      entriesUpdatedCount,
      cutoffDate,
    };
  }
}

export const storageCleanupService = new StorageCleanupService();
