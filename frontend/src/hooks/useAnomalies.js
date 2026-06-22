import { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import api from '../services/api';

export const useAnomalies = (autoRefreshMinutes = 60) => {
  const activeStoreId  = useUIStore(s => s.activeStoreId);
  const [anomalies, setAnomalies]   = useState([]);
  const [loading,   setLoading]     = useState(false);
  const [lastFetch, setLastFetch]   = useState(null);

  const fetchAnomalies = async () => {
    if (!activeStoreId) return;
    setLoading(true);
    try {
      const res = await api.get('/anomalies', {
        params: { storeId: activeStoreId, days: 30 },
      });
      setAnomalies(res.data.anomalies || []);
      setLastFetch(new Date());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, autoRefreshMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeStoreId]);

  const highSeverity = anomalies.filter(a => a.severity === 'high');
  const hasAlerts    = highSeverity.length > 0;

  return { anomalies, loading, hasAlerts, highSeverity, lastFetch, refresh: fetchAnomalies };
};