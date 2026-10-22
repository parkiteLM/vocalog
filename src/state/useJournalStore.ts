import { create } from 'zustand';
import { JournalEntry } from '../data/models/JournalEntry';
import { databaseService } from '../data/services/DatabaseService';
import { audioRecorderService } from '../data/services/AudioRecorderService';
import { journalPipelineService } from '../data/services/JournalPipelineService';
import { storageCleanupService } from '../data/services/StorageCleanupService';

export interface JournalState {
  selectedDate: Date;
  entries: JournalEntry[];
  isLoading: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  activeEntryDetail: JournalEntry | null;

  // Navigation
  setSelectedDate: (date: Date) => Promise<void>;
  goToPreviousDay: () => Promise<void>;
  goToNextDay: () => Promise<void>;
  jumpToToday: () => Promise<void>;

  // Data Loading & CRUD
  loadEntriesForDate: (date: Date) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setActiveEntryDetail: (entry: JournalEntry | null) => void;

  // Recording Lifecycle
  startRecording: () => Promise<void>;
  stopRecordingAndProcess: () => Promise<JournalEntry | null>;
  cancelRecording: () => Promise<void>;

  // Maintenance
  runAppStartupRoutine: () => Promise<void>;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;

export const useJournalStore = create<JournalState>((set, get) => ({
  selectedDate: new Date(),
  entries: [],
  isLoading: false,
  isRecording: false,
  isProcessing: false,
  recordingDuration: 0,
  activeEntryDetail: null,

  setSelectedDate: async (date: Date) => {
    set({ selectedDate: date });
    await get().loadEntriesForDate(date);
  },

  goToPreviousDay: async () => {
    const current = new Date(get().selectedDate);
    current.setDate(current.getDate() - 1);
    await get().setSelectedDate(current);
  },

  goToNextDay: async () => {
    const current = new Date(get().selectedDate);
    current.setDate(current.getDate() + 1);
    await get().setSelectedDate(current);
  },

  jumpToToday: async () => {
    await get().setSelectedDate(new Date());
  },

  loadEntriesForDate: async (date: Date) => {
    set({ isLoading: true });
    try {
      const entries = await databaseService.getEntriesForDate(date);
      set({ entries, isLoading: false });
    } catch (error) {
      console.warn('Failed to load entries for date:', error);
      set({ entries: [], isLoading: false });
    }
  },

  deleteEntry: async (id: string) => {
    try {
      await databaseService.deleteEntry(id);
      const updatedEntries = get().entries.filter((entry) => entry.id !== id);
      set({
        entries: updatedEntries,
        activeEntryDetail: get().activeEntryDetail?.id === id ? null : get().activeEntryDetail,
      });
    } catch (error) {
      console.warn('Failed to delete entry:', error);
    }
  },

  setActiveEntryDetail: (entry: JournalEntry | null) => {
    set({ activeEntryDetail: entry });
  },

  startRecording: async () => {
    try {
      await audioRecorderService.startRecording();
      set({ isRecording: true, recordingDuration: 0 });

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        set((state) => ({ recordingDuration: state.recordingDuration + 1 }));
      }, 1000);
    } catch (error) {
      if (timerInterval) clearInterval(timerInterval);
      set({ isRecording: false, recordingDuration: 0 });
      throw error;
    }
  },

  stopRecordingAndProcess: async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    set({ isRecording: false, isProcessing: true });

    try {
      const recordingResult = await audioRecorderService.stopRecording();
      if (!recordingResult) {
        set({ isProcessing: false, recordingDuration: 0 });
        return null;
      }

      const newEntry = await journalPipelineService.processAudioRecording(
        recordingResult.filePath,
        recordingResult.durationSeconds
      );

      // Reload feed entries for the active date
      await get().loadEntriesForDate(get().selectedDate);
      set({ isProcessing: false, recordingDuration: 0 });

      return newEntry;
    } catch (error) {
      console.warn('Failed to process recording:', error);
      set({ isProcessing: false, recordingDuration: 0 });
      throw error;
    }
  },

  cancelRecording: async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    await audioRecorderService.cancelRecording();
    set({ isRecording: false, isProcessing: false, recordingDuration: 0 });
  },

  runAppStartupRoutine: async () => {
    try {
      // 1. Initialize SQLite schema & tables
      await databaseService.init();
      // 2. Run 21-day audio cleanup routine
      await storageCleanupService.runAutoCleanup();
      // 3. Load today's entries
      await get().loadEntriesForDate(get().selectedDate);
    } catch (error) {
      console.warn('Startup routine warning:', error);
    }
  },
}));

