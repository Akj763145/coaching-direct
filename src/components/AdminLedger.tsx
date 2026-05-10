import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Search, Filter } from 'lucide-react';

interface AdminLedgerProps {
  enrollments: any[];
}

export default function AdminLedger({ enrollments }: AdminLedgerProps) {
  const [selectedInstitute, setSelectedInstitute] = useState<string>('all');

  const uniqueInstitutes = useMemo(() => {
    const map = new Map<string, string>();
    enrollments.forEach(e => {
      const id = e.batches?.institute_id;
      const name = e.batches?.institutes?.name;
      if (id && name && !map.has(id)) {
        map.set(id, name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    if (selectedInstitute === 'all') return enrollments;
    return enrollments.filter(e => e.batches?.institute_id === selectedInstitute);
  }, [enrollments, selectedInstitute]);

  const dynamicRevenue = useMemo(() => {
    return filteredEnrollments.reduce((sum, e) => {
      const amount = e.amount != null ? Number(e.amount) : parseInt((e.batches?.fee_structure || '1000').replace(/[^0-9]/g, '') || '1000', 10);
      return sum + amount;
    }, 0);
  }, [filteredEnrollments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">Platform Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Comprehensive view of all enrollments and sales across the platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none min-w-[200px]"
            >
              <option value="all">All Institutes</option>
              {uniqueInstitutes.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{dynamicRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Institute</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment ID</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No sales recorded yet.
                </td>
              </tr>
            ) : (
              filteredEnrollments.map((e: any, index: number) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(e.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' })}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                    {e.batches?.institutes?.name || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                    {e.batches?.batch_name || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                    {e.student_profiles?.full_name || 'Anonymous Student'}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                    {e.razorpay_payment_id || 'manual'}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">
                    ₹{e.amount != null ? Number(e.amount).toLocaleString() : parseInt((e.batches?.fee_structure || '1000').replace(/[^0-9]/g, '') || '1000', 10).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
