import React from 'react';
import { StyleSheet, Text, View, Image, StatusBar } from 'react-native';
import { Colors } from '@/core/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Brand Identity */}
      <View style={styles.card}>
        <Image
          source={require('./assets/logo/CleanedLogoOnly.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>VocaLog</Text>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>100% Offline • Zero-Cost AI</Text>
        </View>

        <Text style={styles.subtitle}>
          Phase 0: Environment & Architecture Ready
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>• Native Compilers: Verified (Clang/GCC/CMake)</Text>
          <Text style={styles.statusLabel}>• Expo SDK: 57 (Latest TypeScript)</Text>
          <Text style={styles.statusLabel}>• Retention Policy: 21 Days Auto-Purge</Text>
          <Text style={styles.statusLabel}>• Variable Cost: $0.00 / user</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  badge: {
    marginTop: 8,
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statusBox: {
    marginTop: 20,
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
});
