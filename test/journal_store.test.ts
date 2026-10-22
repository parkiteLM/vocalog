const mockGetEntriesForDate = jest.fn().mockResolvedValue([]);
const mockDeleteEntry = jest.fn().mockResolvedValue(undefined);
const mockInit = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/data/services/DatabaseService', () => ({
  databaseService: {
    getEntriesForDate: (date: Date) => mockGetEntriesForDate(date),
    deleteEntry: (id: string) => mockDeleteEntry(id),
    init: () => mockInit(),
  },
}));

const mockStartRecording = jest.fn().mockResolvedValue('file:///mock/recordings/test.m4a');
const mockStopRecording = jest.fn().mockResolvedValue({
  filePath: 'file:///mock/recordings/test.m4a',
  durationSeconds: 15,
});
const mockCancelRecording = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/data/services/AudioRecorderService', () => ({
  audioRecorderService: {
    startRecording: () => mockStartRecording(),
    stopRecording: () => mockStopRecording(),
    cancelRecording: () => mockCancelRecording(),
  },
}));

const mockProcessAudioRecording = jest.fn().mockResolvedValue({
  id: 'new-entry-1',
  createdAt: '2026-10-22T10:00:00.000Z',
  audioFilePath: 'file:///mock/recordings/test.m4a',
  durationSeconds: 15,
  rawTranscript: 'Raw speech text',
  cleanedEntry: 'Raw speech text',
  category: 'Task',
  actionItems: [],
  title: 'Task Title',
  summary: 'Summary text',
  tags: ['Task'],
  isFormatted: true,
});

jest.mock('../src/data/services/JournalPipelineService', () => ({
  journalPipelineService: {
    processAudioRecording: (path: string, duration: number) =>
      mockProcessAudioRecording(path, duration),
  },
}));

const mockRunAutoCleanup = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/data/services/StorageCleanupService', () => ({
  storageCleanupService: {
    runAutoCleanup: () => mockRunAutoCleanup(),
  },
}));

import { useJournalStore } from '../src/state/useJournalStore';

describe('useJournalStore (State Management)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useJournalStore.setState({
      selectedDate: new Date('2026-10-22T12:00:00.000Z'),
      entries: [],
      isLoading: false,
      isRecording: false,
      isProcessing: false,
      recordingDuration: 0,
      activeEntryDetail: null,
    });
  });

  describe('Date Navigation', () => {
    it('sets selected date and loads entries for that date', async () => {
      const targetDate = new Date('2026-10-15T12:00:00.000Z');
      await useJournalStore.getState().setSelectedDate(targetDate);

      expect(useJournalStore.getState().selectedDate).toEqual(targetDate);
      expect(mockGetEntriesForDate).toHaveBeenCalledWith(targetDate);
    });

    it('navigates to the previous day correctly', async () => {
      const initialDate = new Date('2026-10-22T12:00:00.000Z');
      useJournalStore.setState({ selectedDate: initialDate });

      await useJournalStore.getState().goToPreviousDay();

      const newDate = useJournalStore.getState().selectedDate;
      expect(newDate.getDate()).toBe(21);
      expect(mockGetEntriesForDate).toHaveBeenCalled();
    });

    it('navigates to the next day correctly', async () => {
      const initialDate = new Date('2026-10-22T12:00:00.000Z');
      useJournalStore.setState({ selectedDate: initialDate });

      await useJournalStore.getState().goToNextDay();

      const newDate = useJournalStore.getState().selectedDate;
      expect(newDate.getDate()).toBe(23);
      expect(mockGetEntriesForDate).toHaveBeenCalled();
    });

    it('jumps to today', async () => {
      const pastDate = new Date('2026-05-01T12:00:00.000Z');
      useJournalStore.setState({ selectedDate: pastDate });

      await useJournalStore.getState().jumpToToday();

      const today = new Date();
      expect(useJournalStore.getState().selectedDate.toDateString()).toBe(
        today.toDateString()
      );
    });
  });

  describe('CRUD & Modals', () => {
    it('deletes an entry from state and database', async () => {
      const mockEntry = {
        id: 'entry-to-delete',
        createdAt: '2026-10-22T10:00:00.000Z',
        audioFilePath: null,
        durationSeconds: 10,
        rawTranscript: 'Test',
        cleanedEntry: 'Test',
        category: 'Note' as const,
        actionItems: [],
        title: 'Test',
        summary: 'Test',
        tags: [],
        isFormatted: true,
      };

      useJournalStore.setState({ entries: [mockEntry] });

      await useJournalStore.getState().deleteEntry('entry-to-delete');

      expect(mockDeleteEntry).toHaveBeenCalledWith('entry-to-delete');
      expect(useJournalStore.getState().entries).toHaveLength(0);
    });

    it('sets and clears active entry detail modal', () => {
      const mockEntry = {
        id: 'entry-detail',
        createdAt: '2026-10-22T10:00:00.000Z',
        audioFilePath: null,
        durationSeconds: 10,
        rawTranscript: 'Test',
        cleanedEntry: 'Test',
        category: 'Note' as const,
        actionItems: [],
        title: 'Detail',
        summary: 'Detail',
        tags: [],
        isFormatted: true,
      };

      useJournalStore.getState().setActiveEntryDetail(mockEntry);
      expect(useJournalStore.getState().activeEntryDetail).toEqual(mockEntry);

      useJournalStore.getState().setActiveEntryDetail(null);
      expect(useJournalStore.getState().activeEntryDetail).toBeNull();
    });
  });

  describe('Recording Lifecycle', () => {
    it('starts recording and updates isRecording to true', async () => {
      await useJournalStore.getState().startRecording();

      expect(mockStartRecording).toHaveBeenCalled();
      expect(useJournalStore.getState().isRecording).toBe(true);
    });

    it('stops recording, invokes pipeline, reloads entries, and returns new entry', async () => {
      useJournalStore.setState({ isRecording: true });

      const newEntry = await useJournalStore.getState().stopRecordingAndProcess();

      expect(mockStopRecording).toHaveBeenCalled();
      expect(mockProcessAudioRecording).toHaveBeenCalledWith(
        'file:///mock/recordings/test.m4a',
        15
      );
      expect(useJournalStore.getState().isRecording).toBe(false);
      expect(useJournalStore.getState().isProcessing).toBe(false);
      expect(newEntry?.id).toBe('new-entry-1');
    });

    it('cancels active recording and resets state', async () => {
      useJournalStore.setState({ isRecording: true });

      await useJournalStore.getState().cancelRecording();

      expect(mockCancelRecording).toHaveBeenCalled();
      expect(useJournalStore.getState().isRecording).toBe(false);
      expect(useJournalStore.getState().isProcessing).toBe(false);
    });
  });
});

