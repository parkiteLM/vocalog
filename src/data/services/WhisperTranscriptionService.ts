import { initWhisper, WhisperContext } from 'whisper.rn';
import * as FileSystem from 'expo-file-system/legacy';

export interface TranscriptionProgress {
  progress: number;
}

export class WhisperTranscriptionService {
  private whisperContext: WhisperContext | null = null;
  private isInitializing = false;
  private currentModelPath: string | null = null;

  /**
   * Returns the default directory where quantized GGML model files are stored.
   */
  getModelDirectory(): string {
    return `${FileSystem.documentDirectory}models/`;
  }

  /**
   * Returns the expected path for the tiny.en quantized Whisper model.
   */
  getDefaultModelPath(): string {
    return `${this.getModelDirectory()}ggml-tiny.en.bin`;
  }

  /**
   * Checks whether the model weights exist on disk.
   */
  async isModelDownloaded(modelPath?: string): Promise<boolean> {
    const path = modelPath ?? this.getDefaultModelPath();
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  }

  /**
   * Initializes or reuses the Whisper native C++ context.
   */
  async getContext(modelPath?: string): Promise<WhisperContext> {
    const targetPath = modelPath ?? this.getDefaultModelPath();

    if (this.whisperContext && this.currentModelPath === targetPath) {
      return this.whisperContext;
    }

    if (this.isInitializing) {
      // Small backoff wait if already initializing
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (this.whisperContext) return this.whisperContext;
    }

    this.isInitializing = true;

    try {
      if (this.whisperContext) {
        await this.whisperContext.release();
        this.whisperContext = null;
      }

      this.whisperContext = await initWhisper({
        filePath: targetPath,
        useGpu: true, // Use Metal on iOS if available
      });

      this.currentModelPath = targetPath;
      return this.whisperContext;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Transcribes a 16 kHz mono AAC/WAV audio file using the on-device Whisper engine.
   * Completely offline, 100% private ($0.00 cost).
   */
  async transcribeAudio(
    audioFilePath: string,
    options?: {
      onProgress?: (progress: number) => void;
      modelPath?: string;
    }
  ): Promise<string> {
    const fileInfo = await FileSystem.getInfoAsync(audioFilePath);
    if (!fileInfo.exists) {
      throw new Error(`Audio file not found at path: ${audioFilePath}`);
    }

    const context = await this.getContext(options?.modelPath);

    const { promise } = context.transcribe(audioFilePath, {
      language: 'en',
      maxLen: 0,
      onProgress: (progress: number) => {
        if (options?.onProgress) {
          options.onProgress(progress);
        }
      },
    });

    const result = await promise;
    return result.result?.trim() ?? '';
  }

  /**
   * Releases allocated Whisper context memory.
   */
  async release(): Promise<void> {
    if (this.whisperContext) {
      await this.whisperContext.release();
      this.whisperContext = null;
      this.currentModelPath = null;
    }
  }
}

export const whisperTranscriptionService = new WhisperTranscriptionService();
