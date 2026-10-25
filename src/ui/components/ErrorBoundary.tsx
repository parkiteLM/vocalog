import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          <View style={styles.header}>
            <Text style={styles.title}>VocaLog Diagnostics</Text>
            <Text style={styles.subtitle}>
              An error occurred during startup or rendering:
            </Text>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.errorMsg}>
              {this.state.error?.message || String(this.state.error)}
            </Text>
            {this.state.error?.stack && (
              <Text style={styles.stackMsg}>{this.state.error.stack}</Text>
            )}
            {this.state.errorInfo?.componentStack && (
              <Text style={styles.stackMsg}>{this.state.errorInfo.componentStack}</Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Retry App</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    color: '#14B8A6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
  },
  scroll: {
    flex: 1,
    marginVertical: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  errorMsg: {
    color: '#F87171',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stackMsg: {
    color: '#CBD5E1',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

