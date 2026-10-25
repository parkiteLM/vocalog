import React from 'react';
import { DailyFeedScreen } from './src/ui/screens/DailyFeedScreen';
import { ErrorBoundary } from './src/ui/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <DailyFeedScreen />
    </ErrorBoundary>
  );
}
