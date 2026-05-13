import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Clock, User, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function AuditLogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/master/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Real-time polling every 10s
    return () => clearInterval(interval);
  }, []);

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-apple-text dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            Live Audit Stream
          </h2>
          <p className="text-apple-text-muted mt-1">Real-time overview of critical administrative actions</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-apple-text dark:text-white mb-2">No activity detected</h3>
          <p className="text-apple-text-muted">Once administrative actions occur, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-black/5 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-slate-800">
                {logs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={log.id} 
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-apple-text dark:text-slate-300 font-medium whitespace-nowrap">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        {log.username || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{log.details}</p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
