import { useState, useEffect, useCallback } from 'react';
import { salesService } from '../services/sales.service';
import { useUIStore } from '../store/uiStore';

const QUEUE_KEY = 'hl_offline_queue';

const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveQueue = (queue) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const useOfflineQueue = () => {
  const isOnline      = useUIStore(s => s.isOnline);
  const [queue, setQueue] = useState(getQueue);
  const [syncing, setSyncing] = useState(false);

  // Add a sale to offline queue
  const enqueue = useCallback((saleData) => {
    const item = { ...saleData, _queuedAt: new Date().toISOString(), _id: Date.now() };
    const newQueue = [...getQueue(), item];
    saveQueue(newQueue);
    setQueue(newQueue);
    return item;
  }, []);

  // Sync all queued sales when back online
  const syncQueue = useCallback(async () => {
    const pending = getQueue();
    if (pending.length === 0 || syncing) return;

    setSyncing(true);
    const failed = [];

    for (const item of pending) {
      try {
        const { _queuedAt, _id, storeId, ...saleData } = item;
        await salesService.createSale(storeId, saleData);
      } catch {
        failed.push(item);
      }
    }

    saveQueue(failed);
    setQueue(failed);
    setSyncing(false);
  }, [syncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline]);

  return { queue, enqueue, syncQueue, syncing, pendingCount: queue.length };
};