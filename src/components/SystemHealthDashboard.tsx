import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Database, ShieldCheck, HardDrive, Loader2 } from 'lucide-react';
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
    <div className="space-y-12 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Database Connectivity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] ml-1">Network Status</h3>
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Database className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-bold text-lg tracking-tight">Main Cluster</span>
              <div className="flex items-center gap-2.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">{stats?.status || 'Online'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-bold text-lg tracking-tight">Latency</span>
              <span className="text-blue-600 font-black text-xl tracking-tight">{stats?.latency}<span className="text-sm ml-0.5 text-slate-400">ms</span></span>
            </div>
          </div>
        </motion.div>
 
        {/* Storage Usage */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] ml-1">System Index</h3>
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
              <HardDrive className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>
          
          <div className="space-y-10">
            <div>
              <div className="flex justify-between text-xs mb-3">
                <span className="text-slate-900 font-bold tracking-tight text-sm">Database Load</span>
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{rowPercentage.toFixed(1)}% Capacity</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rowPercentage, 100)}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
 
            <div>
              <div className="flex justify-between text-xs mb-3">
                <span className="text-slate-900 font-bold tracking-tight text-sm">Media Storage</span>
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stats?.media_assets_gb} GB Used</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(assetPercentage, 100)}%` }}
                  className="h-full bg-slate-900 rounded-full"
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
          className="bg-blue-600 rounded-[2rem] p-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden flex flex-col items-center justify-center text-center text-white"
        >
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <ShieldCheck size={140} />
          </div>
          <div className="bg-white/20 backdrop-blur-md p-5 rounded-full mb-6 relative z-10">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-black text-2xl mb-2 relative z-10 tracking-tight">Protocol Optimized</h2>
          <p className="text-white/80 text-sm leading-relaxed px-4 font-medium relative z-10">
            Global monitoring is active. All services at peak performance.
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
