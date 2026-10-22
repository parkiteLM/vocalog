import * as SQLite from 'expo-sqlite';
import { JournalEntry, JournalEntryRow, entryToRow, rowToEntry } from '../models/JournalEntry';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initializes the SQLite database, creating tables and performance indexes.
   */
  async init(): Promise<SQLite.SQLiteDatabase> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    this.db = await SQLite.openDatabaseAsync('vocalog.db');

    // Create journal entries table
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        audio_file_path TEXT,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        raw_transcript TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        cleaned_entry TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'Note',
        action_items TEXT NOT NULL DEFAULT '[]',
        tags TEXT NOT NULL DEFAULT '[]',
        is_formatted INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries (created_at DESC);

      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);

    // Ensure default retention days setting is populated (21 days)
    const existingRetention = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM user_settings WHERE key = ?',
      ['retention_days']
    );
    if (!existingRetention) {
      await this.db.runAsync(
        'INSERT INTO user_settings (key, value) VALUES (?, ?)',
        ['retention_days', '21']
      );
    }

    this.isInitialized = true;
    return this.db;
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db || !this.isInitialized) {
      return await this.init();
    }
    return this.db;
  }

  /**
   * Inserts or replaces a journal entry.
   */
  async insertEntry(entry: JournalEntry): Promise<void> {
    const db = await this.getDb();
    const row = entryToRow(entry);

    await db.runAsync(
      `INSERT OR REPLACE INTO entries (
        id, created_at, audio_file_path, duration_seconds, raw_transcript,
        title, cleaned_entry, summary, category, action_items, tags, is_formatted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.created_at,
        row.audio_file_path,
        row.duration_seconds,
        row.raw_transcript,
        row.title,
        row.cleaned_entry,
        row.summary,
        row.category,
        row.action_items,
        row.tags,
        row.is_formatted,
      ]
    );
  }

  /**
   * Updates an existing journal entry.
   */
  async updateEntry(entry: JournalEntry): Promise<void> {
    await this.insertEntry(entry);
  }

  /**
   * Retrieves all journal entries ordered by latest first.
   */
  async getAllEntries(): Promise<JournalEntry[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<JournalEntryRow>(
      'SELECT * FROM entries ORDER BY created_at DESC'
    );
    return rows.map(rowToEntry);
  }

  /**
   * Retrieves an entry by its unique ID.
   */
  async getEntryById(id: string): Promise<JournalEntry | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<JournalEntryRow>(
      'SELECT * FROM entries WHERE id = ?',
      [id]
    );
    return row ? rowToEntry(row) : null;
  }

  /**
   * Daily date-range query: Fetches all entries recorded between 00:00:00 and 23:59:59
   * on the specified calendar date, ordered latest time first (DESC).
   */
  async getEntriesForDate(date: Date): Promise<JournalEntry[]> {
    const db = await this.getDb();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rows = await db.getAllAsync<JournalEntryRow>(
      `SELECT * FROM entries 
       WHERE created_at >= ? AND created_at <= ? 
       ORDER BY created_at DESC`,
      [startOfDay.toISOString(), endOfDay.toISOString()]
    );

    return rows.map(rowToEntry);
  }

  /**
   * Retrieves all entries created strictly before the specified ISO cutoff string.
   * Used by the 21-day audio auto-cleanup routine.
   */
  async getEntriesOlderThan(cutoffIsoString: string): Promise<JournalEntry[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<JournalEntryRow>(
      'SELECT * FROM entries WHERE created_at < ? AND audio_file_path IS NOT NULL',
      [cutoffIsoString]
    );
    return rows.map(rowToEntry);
  }

  /**
   * Unlinks the audio_file_path from an entry while keeping all other text fields permanent.
   */
  async clearAudioPath(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE entries SET audio_file_path = NULL WHERE id = ?',
      [id]
    );
  }

  /**
   * Deletes an entry by ID.
   */
  async deleteEntry(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
  }

  /**
   * Gets user retention setting (defaults to 21 days).
   */
  async getRetentionDays(): Promise<number> {
    const db = await this.getDb();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM user_settings WHERE key = ?',
      ['retention_days']
    );
    return result ? parseInt(result.value, 10) : 21;
  }

  /**
   * Updates user retention setting (for future Pro tier).
   */
  async setRetentionDays(days: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
      ['retention_days', days.toString()]
    );
  }
}

export const databaseService = new DatabaseService();

