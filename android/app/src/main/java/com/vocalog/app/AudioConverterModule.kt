package com.vocalog.app

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.nio.ByteBuffer
import java.nio.ByteOrder

class AudioConverterModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AudioConverter"

    @ReactMethod
    fun convertM4aToWav(inputPath: String, outputPath: String, promise: Promise) {
        Thread {
            try {
                val cleanInput = if (inputPath.startsWith("file://")) inputPath.removePrefix("file://") else inputPath
                val cleanOutput = if (outputPath.startsWith("file://")) outputPath.removePrefix("file://") else outputPath

                val inputFile = File(cleanInput)
                if (!inputFile.exists()) {
                    promise.reject("E_FILE_NOT_FOUND", "Input audio file does not exist: $cleanInput")
                    return@Thread
                }

                val extractor = MediaExtractor()
                extractor.setDataSource(cleanInput)

                var audioTrackIndex = -1
                var inputFormat: MediaFormat? = null

                for (i in 0 until extractor.trackCount) {
                    val format = extractor.getTrackFormat(i)
                    val mime = format.getString(MediaFormat.KEY_MIME) ?: ""
                    if (mime.startsWith("audio/")) {
                        audioTrackIndex = i
                        inputFormat = format
                        break
                    }
                }

                if (audioTrackIndex == -1 || inputFormat == null) {
                    extractor.release()
                    promise.reject("E_NO_AUDIO_TRACK", "No audio track found in file")
                    return@Thread
                }

                extractor.selectTrack(audioTrackIndex)
                val mime = inputFormat.getString(MediaFormat.KEY_MIME) ?: "audio/mp4a-latm"
                var sampleRate = if (inputFormat.containsKey(MediaFormat.KEY_SAMPLE_RATE)) inputFormat.getInteger(MediaFormat.KEY_SAMPLE_RATE) else 16000
                var channelCount = if (inputFormat.containsKey(MediaFormat.KEY_CHANNEL_COUNT)) inputFormat.getInteger(MediaFormat.KEY_CHANNEL_COUNT) else 1

                val codec = MediaCodec.createDecoderByType(mime)
                codec.configure(inputFormat, null, null, 0)
                codec.start()

                val outputFile = File(cleanOutput)
                outputFile.parentFile?.mkdirs()
                val fos = FileOutputStream(outputFile)

                // Reserve 44 bytes for WAV header
                val header = ByteArray(44)
                fos.write(header)

                var totalAudioLen = 0L
                val bufferInfo = MediaCodec.BufferInfo()
                var sawInputEOS = false
                var sawOutputEOS = false
                val timeoutUs = 5000L

                while (!sawOutputEOS) {
                    if (!sawInputEOS) {
                        val inputBufIndex = codec.dequeueInputBuffer(timeoutUs)
                        if (inputBufIndex >= 0) {
                            val inputBuf = codec.getInputBuffer(inputBufIndex)!!
                            val sampleSize = extractor.readSampleData(inputBuf, 0)
                            if (sampleSize < 0) {
                                codec.queueInputBuffer(inputBufIndex, 0, 0, 0L, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                                sawInputEOS = true
                            } else {
                                val presentationTimeUs = extractor.sampleTime
                                codec.queueInputBuffer(inputBufIndex, 0, sampleSize, presentationTimeUs, 0)
                                extractor.advance()
                            }
                        }
                    }

                    val outputBufIndex = codec.dequeueOutputBuffer(bufferInfo, timeoutUs)
                    if (outputBufIndex >= 0) {
                        if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                            sawOutputEOS = true
                        }
                        if (bufferInfo.size > 0) {
                            val outputBuf = codec.getOutputBuffer(outputBufIndex)!!
                            outputBuf.position(bufferInfo.offset)
                            outputBuf.limit(bufferInfo.offset + bufferInfo.size)
                            val chunk = ByteArray(bufferInfo.size)
                            outputBuf.get(chunk)
                            fos.write(chunk)
                            totalAudioLen += bufferInfo.size
                        }
                        codec.releaseOutputBuffer(outputBufIndex, false)
                    } else if (outputBufIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                        val newFormat = codec.outputFormat
                        if (newFormat.containsKey(MediaFormat.KEY_SAMPLE_RATE)) {
                            sampleRate = newFormat.getInteger(MediaFormat.KEY_SAMPLE_RATE)
                        }
                        if (newFormat.containsKey(MediaFormat.KEY_CHANNEL_COUNT)) {
                            channelCount = newFormat.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
                        }
                    }
                }

                fos.flush()
                fos.close()
                codec.stop()
                codec.release()
                extractor.release()

                // Overwrite the header with accurate sizes and audio specs
                val raf = RandomAccessFile(outputFile, "rw")
                raf.seek(0)
                writeWavHeader(raf, totalAudioLen, sampleRate, channelCount)
                raf.close()

                promise.resolve("file://$cleanOutput")
            } catch (e: Exception) {
                promise.reject("E_CONVERSION_FAILED", "Failed to convert audio to WAV: " + e.message, e)
            }
        }.start()
    }

    private fun writeWavHeader(raf: RandomAccessFile, audioDataLen: Long, sampleRate: Int, channels: Int) {
        val totalDataLen = audioDataLen + 36
        val byteRate = sampleRate * channels * 2

        val header = ByteBuffer.allocate(44)
        header.order(ByteOrder.LITTLE_ENDIAN)

        // RIFF chunk
        header.put('R'.code.toByte())
        header.put('I'.code.toByte())
        header.put('F'.code.toByte())
        header.put('F'.code.toByte())
        header.putInt(totalDataLen.toInt())
        header.put('W'.code.toByte())
        header.put('A'.code.toByte())
        header.put('V'.code.toByte())
        header.put('E'.code.toByte())

        // fmt chunk
        header.put('f'.code.toByte())
        header.put('m'.code.toByte())
        header.put('t'.code.toByte())
        header.put(' '.code.toByte())
        header.putInt(16) // Subchunk1Size
        header.putShort(1.toShort()) // PCM format = 1
        header.putShort(channels.toShort())
        header.putInt(sampleRate)
        header.putInt(byteRate)
        header.putShort((channels * 2).toShort()) // block align
        header.putShort(16.toShort()) // bits per sample

        // data chunk
        header.put('d'.code.toByte())
        header.put('a'.code.toByte())
        header.put('t'.code.toByte())
        header.put('a'.code.toByte())
        header.putInt(audioDataLen.toInt())

        raf.write(header.array())
    }
}
