import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export interface RecordingResult {
  filePath: string;
  durationSeconds: number;
}

class AudioRecorderService {
  private recording: Audio.Recording | null = null;
  private recordingStartTime: number | null = null;
  private isRecordingActive = false;

  get isRecording(): boolean {
    return this.isRecordingActive;
  }

  /**
   * Requests microphone recording permissions from the operating system.
   */
  async requestPermissions(): Promise<boolean> {
    const response = await Audio.requestPermissionsAsync();
    return response.granted;
  }

  /**
   * Prepares the audio subsystem and recordings directory.
   */
  private async ensureRecordingsDirectory(): Promise<string> {
    const dir = `${FileSystem.documentDirectory}recordings/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
  }

  /**
   * Starts high-quality, 16 kHz mono AAC voice recording.
   * 16 kHz mono is the optimal sample rate for Whisper speech recognition.
   */
  async startRecording(): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted.');
    }

    if (this.recording) {
      await this.cancelRecording();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const recordingsDir = await this.ensureRecordingsDirectory();
    const timestamp = Date.now();
    const targetFilePath = `${recordingsDir}vocalog_${timestamp}.m4a`;

    // 16 kHz Mono AAC recording preset
    const recordingOptions: Audio.RecordingOptions = {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

    const { recording } = await Audio.Recording.createAsync(recordingOptions);
    this.recording = recording;
    this.recordingStartTime = Date.now();
    this.isRecordingActive = true;

    return targetFilePath;
  }

  /**
   * Stops the active recording, calculates duration, and returns the local file path.
   */
  async stopRecording(): Promise<RecordingResult | null> {
    if (!this.recording) {
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      const durationSeconds = this.recordingStartTime
        ? Math.max(1, Math.round((Date.now() - this.recordingStartTime) / 1000))
        : 0;

      this.recording = null;
      this.recordingStartTime = null;
      this.isRecordingActive = false;

      // Reset audio mode back to standard playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!uri) {
        throw new Error('Recording finished but returned no file URI.');
      }

      return {
        filePath: uri,
        durationSeconds,
      };
    } catch (error) {
      this.recording = null;
      this.recordingStartTime = null;
      this.isRecordingActive = false;
      throw error;
    }
  }

  /**
   * Cancels the active recording and discards any temporary audio file.
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording) return;

    try {
      const uri = this.recording.getURI();
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
      this.recordingStartTime = null;
      this.isRecordingActive = false;

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch {
      this.recording = null;
      this.recordingStartTime = null;
      this.isRecordingActive = false;
    }
  }
}

export const audioRecorderService = new AudioRecorderService();
