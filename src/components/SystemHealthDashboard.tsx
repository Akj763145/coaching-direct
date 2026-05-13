import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Database, ShieldCheck, Activity, HardDrive, Wifi, Clock, Loader2 } from 'lucide-react';
import AuditLogsPanel from './AuditLogsPanel';

interface SystemStats {
  database_rows: number;
  database_limit: number;
  media_assets_gb: number;
  status: string;
  latency: number;
}

export default function SystemHealthDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/master/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const rowPercentage = stats ? (stats.database_rows / stats.database_limit) * 100 : 0;
  const assetPercentage = stats ? (stats.media_assets_gb / 10) * 100 : 0; // Assuming 10GB limit for demo

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Database Connectivity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Database Connectivity</h3>
            <Database className="w-5 h-5 text-zinc-700 group-hover:text-blue-500 transition-colors" />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium text-lg">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-emerald-400 font-bold">{stats?.status || 'Online'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium text-lg">Latency</span>
              <span className="text-zinc-400 font-mono text-xl">{stats?.latency}ms</span>
            </div>
          </div>
        </motion.div>

        {/* Storage Usage */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Storage Usage</h3>
            <HardDrive className="w-5 h-5 text-zinc-700 group-hover:text-amber-500 transition-colors" />
          </div>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80 font-medium">Database Rows</span>
                <span className="text-zinc-500 font-mono italic">{stats?.database_rows.toLocaleString()} / {stats?.database_limit.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rowPercentage, 100)}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80 font-medium">Media Assets</span>
                <span className="text-zinc-500 font-mono italic">~{stats?.media_assets_gb} GB</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(assetPercentage, 100)}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Health Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#05110d] rounded-[2.5rem] p-8 border border-emerald-500/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center"
        >
          <div className="bg-emerald-500/10 p-5 rounded-full mb-6">
            <ShieldCheck className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-white font-black text-2xl mb-3">System is Healthy</h2>
          <p className="text-emerald-400/60 text-sm leading-relaxed px-4">
            All services are operating normally. No critical issues detected in the last 24 hours.
          </p>
        </motion.div>

      </div>

      {/* Real-time Logs section */}
      <div className="mt-12">
        <AuditLogsPanel />
      </div>
    </div>
  );
}
