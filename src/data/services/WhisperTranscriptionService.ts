import { initWhisper, WhisperContext } from 'whisper.rn';
import * as FileSystem from 'expo-file-system/legacy';
import { audioConverterService } from './AudioConverterService';

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
   * Prioritizes bundled offline assets; automatically downloads from HuggingFace if missing.
   */
  async getContext(modelPath?: string): Promise<WhisperContext> {
    if (this.whisperContext) {
      return this.whisperContext;
    }

    if (this.isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (this.whisperContext) return this.whisperContext;
    }

    this.isInitializing = true;

    try {
      // 1. Try bundled Android asset first (100% offline, zero-network)
      if (!modelPath) {
        try {
          this.whisperContext = await initWhisper({
            filePath: 'models/ggml-tiny.en.bin',
            isBundleAsset: true,
            useGpu: false,
          });
          this.currentModelPath = 'models/ggml-tiny.en.bin';
          return this.whisperContext;
        } catch (assetErr) {
          console.warn('Bundled asset load attempt skipped or failed, trying local storage:', assetErr);
        }
      }

      // 2. Check local documents directory
      const localPath = modelPath ?? this.getDefaultModelPath();
      const localInfo = await FileSystem.getInfoAsync(localPath);

      if (!localInfo.exists) {
        // Ensure destination folder exists
        const dir = this.getModelDirectory();
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }

        // Download GGML tiny.en weights from official HuggingFace repo
        const downloadUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
        await FileSystem.downloadAsync(downloadUrl, localPath);
      }

      this.whisperContext = await initWhisper({
        filePath: localPath,
        useGpu: false,
      });

      this.currentModelPath = localPath;
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

    let wavPathToTranscribe = audioFilePath;
    let isTemporaryWav = false;

    // whisper.rn JSI requires 16-bit PCM WAV. Convert compressed m4a to WAV on Android.
    if (!audioFilePath.toLowerCase().endsWith('.wav')) {
      const tempWav = `${FileSystem.cacheDirectory}whisper_temp_${Date.now()}.wav`;
      wavPathToTranscribe = await audioConverterService.convertToWav(audioFilePath, tempWav);
      isTemporaryWav = true;
    }

    try {
      const context = await this.getContext(options?.modelPath);

      const { promise } = context.transcribe(wavPathToTranscribe, {
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
    } finally {
      if (isTemporaryWav) {
        try {
          await FileSystem.deleteAsync(wavPathToTranscribe, { idempotent: true });
        } catch {
          // Ignore transient cache cleanup errors
        }
      }
    }
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
