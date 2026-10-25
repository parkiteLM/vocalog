import { NativeModules, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const { AudioConverter } = NativeModules;

export class AudioConverterService {
  /**
   * Converts a compressed audio file (.m4a) to a 16-bit PCM .wav file
   * suitable for whisper.cpp / whisper.rn speech recognition.
   *
   * @param inputPath Path or URI to the input .m4a file.
   * @param outputPath Optional destination .wav file path.
   * @returns Promise resolving to the local file path of the converted .wav file.
   */
  async convertToWav(inputPath: string, outputPath?: string): Promise<string> {
    if (Platform.OS === 'android') {
      if (!AudioConverter || typeof AudioConverter.convertM4aToWav !== 'function') {
        throw new Error(
          'Native AudioConverter module is not available. Please verify AudioConverterPackage is registered in MainApplication.'
        );
      }

      const targetWav =
        outputPath ?? `${FileSystem.cacheDirectory}whisper_temp_${Date.now()}.wav`;

      return await AudioConverter.convertM4aToWav(inputPath, targetWav);
    }

    // Default passthrough for non-Android platforms
    return inputPath;
  }
}

export const audioConverterService = new AudioConverterService();

