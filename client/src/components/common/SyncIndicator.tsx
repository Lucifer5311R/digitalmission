import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SyncIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
}

export function SyncIndicator({ isOnline, isSyncing, pendingChanges }: SyncIndicatorProps) {
  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-600 text-sm">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>Offline</span>
        {pendingChanges > 0 && (
          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
            {pendingChanges}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-green-600 text-sm">
      <Wifi className="w-4 h-4" />
      <span>Online</span>
    </div>
  );
}
