import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { syncEngine, SyncState } from '../services/syncEngine';
import { getPendingCount } from '../services/db';

interface SyncContextType {
  isOnline: boolean;
  syncState: SyncState;
  pendingChanges: number;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncEngine.sync(); // Auto-sync when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup state change handler
    syncEngine.setStateChangeHandler((state, count) => {
      setSyncState(state);
      setPendingChanges(count);
    });

    // Initial pending count
    getPendingCount().then(setPendingChanges);

    // Periodic sync check (every 60s)
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncEngine.sync();
      }
      getPendingCount().then(setPendingChanges);
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    await syncEngine.sync();
    const count = await getPendingCount();
    setPendingChanges(count);
  }, []);

  return (
    <SyncContext.Provider value={{ isOnline, syncState, pendingChanges, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
}
