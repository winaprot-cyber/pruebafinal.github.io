export interface SyncItem {
  id: string;
  type: 'timeEntry' | 'bonus' | 'discount' | 'income' | 'expense' | 'debt' | 'decimo';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

const SYNC_QUEUE_KEY = 'sync-queue-v2.9.4';
const LAST_SYNC_KEY = 'last-sync-timestamp-v2.9.4';

export function addToSyncQueue(item: Omit<SyncItem, 'timestamp' | 'synced'>) {
  const queue = getSyncQueue();
  const syncItem: SyncItem = { ...item, timestamp: Date.now(), synced: false };
  queue.push(syncItem);
  saveSyncQueue(queue);
  console.log('[Sync] Item agregado a la cola:', syncItem);
}

export function getSyncQueue(): SyncItem[] {
  const queueStr = localStorage.getItem(SYNC_QUEUE_KEY);
  if (queueStr) {
    try {
      return JSON.parse(queueStr);
    } catch (error) {
      console.error('[Sync] Error al parsear la cola:', error);
      return [];
    }
  }
  return [];
}

function saveSyncQueue(queue: SyncItem[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function syncData() {
  if (!navigator.onLine) {
    console.log('[Sync] Sin conexión, no se puede sincronizar');
    return;
  }
  
  const queue = getSyncQueue();
  const pendingItems = queue.filter(item => !item.synced);
  
  if (pendingItems.length === 0) {
    console.log('[Sync] No hay items pendientes de sincronizar');
    return;
  }
  
  console.log('[Sync] Sincronizando', pendingItems.length, 'items...');
  
  try {
    for (const item of pendingItems) {
      await syncItem(item);
    }
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    console.log('[Sync] Sincronización completada');
  } catch (error) {
    console.error('[Sync] Error al sincronizar:', error);
  }
}

async function syncItem(item: SyncItem) {
  await new Promise(resolve => setTimeout(resolve, 100));
  const queue = getSyncQueue();
  const updatedQueue = queue.map(q => q.id === item.id ? { ...q, synced: true } : q);
  saveSyncQueue(updatedQueue);
  console.log('[Sync] Item sincronizado:', item.id);
}

export function cleanSyncQueue() {
  const queue = getSyncQueue();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const cleanedQueue = queue.filter(item => !item.synced || item.timestamp > thirtyDaysAgo);
  saveSyncQueue(cleanedQueue);
  console.log('[Sync] Cola limpiada, items restantes:', cleanedQueue.length);
}

export function getSyncStatus() {
  const queue = getSyncQueue();
  const pending = queue.filter(item => !item.synced).length;
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return {
    pending,
    lastSync: lastSync ? new Date(parseInt(lastSync)) : null,
    isOnline: navigator.onLine,
  };
}

export function setupSyncListeners() {
  window.addEventListener('online', () => {
    console.log('[Sync] Conexión restaurada, sincronizando...');
    syncData();
  });
  
  window.addEventListener('offline', () => {
    console.log('[Sync] Conexión perdida, modo offline activado');
  });
  
  setInterval(() => {
    if (navigator.onLine) {
      syncData();
    }
  }, 5 * 60 * 1000);
}
