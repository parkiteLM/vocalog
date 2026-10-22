import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Mic, Square, X } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../core/theme';
import { useJournalStore } from '../../state/useJournalStore';

export const FloatingRecordButton: React.FC = () => {
  const {
    isRecording,
    isProcessing,
    recordingDuration,
    startRecording,
    stopRecordingAndProcess,
    cancelRecording,
  } = useJournalStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isRecording, pulseAnim]);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMainButtonPress = async () => {
    if (isProcessing) return;

    if (isRecording) {
      await stopRecordingAndProcess();
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* Live Recording HUD / Timer */}
      {isRecording && (
        <View style={styles.hudContainer}>
          <View style={styles.timerPill}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>{formatTimer(recordingDuration)}</Text>
          </View>
        </View>
      )}

      {/* Processing Indicator HUD */}
      {isProcessing && (
        <View style={styles.hudContainer}>
          <View style={styles.processingPill}>
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.processingText}>Transcribing on-device...</Text>
          </View>
        </View>
      )}

      {/* Buttons Row */}
      <View style={styles.buttonsRow}>
        {/* Cancel Button (Visible during recording) */}
        {isRecording && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelRecording}
            accessibilityLabel="Cancel recording"
          >
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Main Mic / Stop FAB with Animated Pulse */}
        <View style={styles.mainButtonWrapper}>
          {isRecording && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.25],
                    outputRange: [0.6, 0.0],
                  }),
                },
              ]}
            />
          )}

          <TouchableOpacity
            style={[
              styles.mainButton,
              isRecording && styles.mainButtonRecording,
              isProcessing && styles.mainButtonProcessing,
            ]}
            onPress={handleMainButtonPress}
            activeOpacity={0.8}
            disabled={isProcessing}
            accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice journal'}
          >
            {isProcessing ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : isRecording ? (
              <Square size={26} color={Colors.textPrimary} fill={Colors.textPrimary} />
            ) : (
              <Mic size={30} color={Colors.background} />
            )}
          </TouchableOpacity>
        </View>

        {/* Placeholder to balance Cancel button in layout */}
        {isRecording && <View style={styles.balancePlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudContainer: {
    marginBottom: Spacing.sm + 4,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.recording,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.recording,
    marginRight: 8,
  },
  timerText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  processingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  processingText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 24,
  },
  balancePlaceholder: {
    width: 44,
    height: 44,
    marginLeft: 24,
  },
  mainButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
  },
  pulseRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.recording,
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  mainButtonRecording: {
    backgroundColor: Colors.recording,
    shadowColor: Colors.recording,
  },
  mainButtonProcessing: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
});

