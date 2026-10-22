import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { JournalEntry } from '../models/JournalEntry';

export class DataExportService {
  /**
   * Generates a structured JSON archive of all entries.
   */
  async exportEntriesAsJSON(entries: JournalEntry[]): Promise<string> {
    const timestamp = Date.now();
    const exportData = {
      app: 'VocaLog',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalEntries: entries.length,
      entries,
    };

    const filePath = `${FileSystem.documentDirectory}vocalog_archive_${timestamp}.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return filePath;
  }

  /**
   * Generates a human-readable Markdown journal document.
   */
  async exportEntriesAsMarkdown(entries: JournalEntry[]): Promise<string> {
    const timestamp = Date.now();
    const exportDateStr = format(new Date(), 'MMMM d, yyyy • h:mm a');

    let md = `# VocaLog Journal Archive\n`;
    md += `*Exported on ${exportDateStr} • Total Entries: ${entries.length}*\n\n`;
    md += `*100% Offline • Private Zero-Cloud Archive*\n\n`;
    md += `---\n\n`;

    if (entries.length === 0) {
      md += `*No entries recorded.*\n`;
    } else {
      // Group entries by date
      for (const entry of entries) {
        const dateFormatted = entry.createdAt
          ? format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy • h:mm a')
          : 'Unknown Date';

        md += `## ${entry.title || 'Untitled Entry'}\n`;
        md += `**Date:** ${dateFormatted} | **Category:** ${entry.category} | **Length:** ${entry.durationSeconds}s\n\n`;

        if (entry.summary) {
          md += `> **Executive Summary:** ${entry.summary}\n\n`;
        }

        md += `### Cleaned Prose\n${entry.cleanedEntry || entry.rawTranscript}\n\n`;

        if (entry.actionItems && entry.actionItems.length > 0) {
          md += `### Action Items\n`;
          for (const item of entry.actionItems) {
            md += `- [ ] ${item}\n`;
          }
          md += `\n`;
        }

        md += `### Raw Transcript\n*${entry.rawTranscript}*\n\n`;
        md += `---\n\n`;
      }
    }

    const filePath = `${FileSystem.documentDirectory}vocalog_journal_${timestamp}.md`;
    await FileSystem.writeAsStringAsync(filePath, md, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return filePath;
  }

  /**
   * Shares the generated export file via the native sharing dialog.
   */
  async shareExportFile(filePath: string, mimeType: string = 'text/plain'): Promise<boolean> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Native file sharing is not available on this platform.');
    }

    await Sharing.shareAsync(filePath, {
      mimeType,
      dialogTitle: 'Export VocaLog Journal Archive',
      UTI: mimeType === 'application/json' ? 'public.json' : 'public.plain-text',
    });

    return true;
  }
}

export const dataExportService = new DataExportService();
