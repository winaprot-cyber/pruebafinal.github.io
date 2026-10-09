import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { getSyncStatus } from '../utils/offlineSync';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus(getSyncStatus());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus(getSyncStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-20 right-6 z-30">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
        isOnline 
          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' 
          : 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
      }`}>
        {isOnline ? (
          <>
            <Wifi size={16} />
            <span className="text-xs font-medium">En línea</span>
            {syncStatus.pending > 0 && (
              <span className="text-xs bg-orange-500/30 px-2 py-0.5 rounded">
                {syncStatus.pending} pendiente{syncStatus.pending > 1 ? 's' : ''}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-xs font-medium">Offline</span>
            <span className="text-xs bg-emerald-500/30 px-2 py-0.5 rounded">
              3 meses
            </span>
          </>
        )}
      </div>
    </div>
  );
}
