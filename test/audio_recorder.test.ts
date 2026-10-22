const mockRecording = {
  stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
  getURI: jest.fn().mockReturnValue('file:///mock/documents/recordings/vocalog_123.m4a'),
};

const mockRequestPermissionsAsync = jest.fn();
const mockSetAudioModeAsync = jest.fn().mockResolvedValue(undefined);
const mockCreateAsync = jest.fn().mockResolvedValue({ recording: mockRecording });

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: () => mockRequestPermissionsAsync(),
    setAudioModeAsync: (options: any) => mockSetAudioModeAsync(options),
    Recording: {
      createAsync: (options: any) => mockCreateAsync(options),
    },
    AndroidOutputFormat: { MPEG_4: 2 },
    AndroidAudioEncoder: { AAC: 3 },
    IOSAudioQuality: { HIGH: 5 },
  },
}));

const mockGetInfoAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  getInfoAsync: (uri: string) => mockGetInfoAsync(uri),
  makeDirectoryAsync: (dir: string, opts: any) => mockMakeDirectoryAsync(dir, opts),
  deleteAsync: (uri: string, opts: any) => mockDeleteAsync(uri, opts),
}));

import { audioRecorderService } from '../src/data/services/AudioRecorderService';

describe('AudioRecorderService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await audioRecorderService.cancelRecording();
    mockRequestPermissionsAsync.mockResolvedValue({ granted: true });
    mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true });
  });

  describe('Permissions', () => {
    it('returns true when microphone permissions are granted', async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ granted: true });
      const granted = await audioRecorderService.requestPermissions();
      expect(granted).toBe(true);
    });

    it('returns false when microphone permissions are denied', async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ granted: false });
      const granted = await audioRecorderService.requestPermissions();
      expect(granted).toBe(false);
    });
  });

  describe('startRecording', () => {
    it('throws an error if microphone permission is not granted', async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ granted: false });

      await expect(audioRecorderService.startRecording()).rejects.toThrow(
        'Microphone permission not granted.'
      );
      expect(audioRecorderService.isRecording).toBe(false);
    });

    it('configures 16 kHz mono AAC settings and transitions isRecording to true', async () => {
      const targetPath = await audioRecorderService.startRecording();

      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        })
      );

      expect(mockCreateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            sampleRate: 16000,
            numberOfChannels: 1,
            extension: '.m4a',
          }),
          ios: expect.objectContaining({
            sampleRate: 16000,
            numberOfChannels: 1,
            extension: '.m4a',
          }),
        })
      );

      expect(targetPath).toContain('recordings/vocalog_');
      expect(targetPath.endsWith('.m4a')).toBe(true);
      expect(audioRecorderService.isRecording).toBe(true);
    });

    it('creates recordings directory if it does not exist', async () => {
      mockGetInfoAsync.mockImplementation(async (uri: string) => {
        if (uri.includes('recordings/')) {
          return { exists: false, isDirectory: false };
        }
        return { exists: true, isDirectory: true };
      });

      await audioRecorderService.startRecording();

      expect(mockMakeDirectoryAsync).toHaveBeenCalledWith(
        'file:///mock/documents/recordings/',
        { intermediates: true }
      );
    });
  });

  describe('stopRecording', () => {
    it('returns null if there is no active recording', async () => {
      const result = await audioRecorderService.stopRecording();
      expect(result).toBeNull();
    });

    it('stops recording, resets audio mode, updates isRecording to false, and returns duration', async () => {
      await audioRecorderService.startRecording();
      expect(audioRecorderService.isRecording).toBe(true);

      const result = await audioRecorderService.stopRecording();

      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result?.filePath).toBe('file:///mock/documents/recordings/vocalog_123.m4a');
      expect(result?.durationSeconds).toBeGreaterThanOrEqual(0);
      expect(audioRecorderService.isRecording).toBe(false);

      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        })
      );
    });
  });

  describe('cancelRecording', () => {
    it('stops active recording and unlinks the temporary file', async () => {
      await audioRecorderService.startRecording();
      expect(audioRecorderService.isRecording).toBe(true);

      mockGetInfoAsync.mockResolvedValue({ exists: true });

      await audioRecorderService.cancelRecording();

      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(mockDeleteAsync).toHaveBeenCalledWith(
        'file:///mock/documents/recordings/vocalog_123.m4a',
        { idempotent: true }
      );
      expect(audioRecorderService.isRecording).toBe(false);
    });

    it('safely handles cancellation when no recording is active', async () => {
      await expect(audioRecorderService.cancelRecording()).resolves.not.toThrow();
      expect(audioRecorderService.isRecording).toBe(false);
    });
  });
});

