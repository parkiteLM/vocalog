const mockTranscribePromise = jest.fn();
const mockTranscribe = jest.fn().mockImplementation(() => ({
  promise: mockTranscribePromise(),
  stop: jest.fn().mockResolvedValue(undefined),
}));
const mockRelease = jest.fn().mockResolvedValue(undefined);

const mockWhisperContext = {
  transcribe: mockTranscribe,
  release: mockRelease,
};

const mockInitWhisper = jest.fn().mockResolvedValue(mockWhisperContext);

jest.mock('whisper.rn', () => ({
  initWhisper: (options: any) => mockInitWhisper(options),
}));

const mockGetInfoAsync = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  getInfoAsync: (uri: string) => mockGetInfoAsync(uri),
}));

import { whisperTranscriptionService } from '../src/data/services/WhisperTranscriptionService';

describe('WhisperTranscriptionService (100% On-Device Speech-to-Text)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await whisperTranscriptionService.release();
    mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: false });
    mockTranscribePromise.mockResolvedValue({ result: 'Hello world from local Whisper' });
  });

  it('resolves correct default model directory and tiny.en file paths', () => {
    expect(whisperTranscriptionService.getModelDirectory()).toBe(
      'file:///mock/documents/models/'
    );
    expect(whisperTranscriptionService.getDefaultModelPath()).toBe(
      'file:///mock/documents/models/ggml-tiny.en.bin'
    );
  });

  it('checks if model file exists on disk', async () => {
    mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
    const exists = await whisperTranscriptionService.isModelDownloaded();
    expect(exists).toBe(true);

    mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
    const missing = await whisperTranscriptionService.isModelDownloaded();
    expect(missing).toBe(false);
  });

  it('initializes whisper context and transcribes audio file', async () => {
    const audioPath = 'file:///mock/documents/recordings/vocalog_123.m4a';

    const transcript = await whisperTranscriptionService.transcribeAudio(audioPath);

    expect(mockInitWhisper).toHaveBeenCalledWith(
      expect.objectContaining({
        filePath: 'file:///mock/documents/models/ggml-tiny.en.bin',
        useGpu: true,
      })
    );

    expect(mockTranscribe).toHaveBeenCalledWith(
      audioPath,
      expect.objectContaining({
        language: 'en',
      })
    );

    expect(transcript).toBe('Hello world from local Whisper');
  });

  it('throws an error if the audio recording file is not found', async () => {
    mockGetInfoAsync.mockResolvedValueOnce({ exists: false });

    await expect(
      whisperTranscriptionService.transcribeAudio('file:///mock/missing.m4a')
    ).rejects.toThrow('Audio file not found at path');
  });

  it('releases allocated context cleanly', async () => {
    await whisperTranscriptionService.getContext();
    await whisperTranscriptionService.release();
    expect(mockRelease).toHaveBeenCalled();
  });
});
