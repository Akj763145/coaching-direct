import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Filter, IdCard, Grid } from 'lucide-react';
import { IdCardModal } from './IdCardModal';

interface AdminLedgerProps {
  enrollments: any[];
}

export default function AdminLedger({ enrollments }: AdminLedgerProps) {
  const [selectedInstitute, setSelectedInstitute] = useState<string>('all');
  const [selectedIdCard, setSelectedIdCard] = useState<any>(null);

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
      className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="p-6 md:p-8 lg:p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Platform Ledger</h2>
          <p className="text-sm text-slate-500 mt-1 md:mt-2 font-medium">Global enrollment and financial performance index.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 md:left-5 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="pl-10 md:pl-12 pr-10 py-3 md:py-3.5 bg-slate-50 border-transparent rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all appearance-none w-full sm:min-w-[240px] cursor-pointer"
            >
              <option value="all">All Channels</option>
              {uniqueInstitutes.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
            <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
               <Grid size={16} />
            </div>
          </div>

          <div className="bg-slate-900 px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] shadow-xl shadow-slate-200 min-w-0 sm:min-w-[200px]">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Gross Yield</p>
            <p className="text-xl md:text-2xl font-black text-white truncate">₹{dynamicRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {/* Desktop Table View */}
        <table className="hidden md:table w-full text-left">
          <thead>
            <tr className="bg-white border-b border-slate-50">
              <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
              <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Product</th>
              <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
              <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                  No transaction data available.
                </td>
              </tr>
            ) : (
              filteredEnrollments.map((e: any, index: number) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-all">
                  <td className="py-6 px-8">
                    <div className="text-sm font-bold text-slate-900">{new Date(e.created_at).toLocaleDateString()}</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-1">{new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{e.student_profiles?.full_name || 'Anonymous'}</span>
                      <span className="text-[11px] text-slate-400 font-medium mt-1">
                        {e.batches?.institutes?.name || 'N/A'} • {e.batches?.batch_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="text-sm font-black text-slate-900">₹{e.amount != null ? Number(e.amount).toLocaleString() : parseInt((e.batches?.fee_structure || '1000').replace(/[^0-9]/g, '') || '1000', 10).toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">Settled</div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <button
                      onClick={() => setSelectedIdCard(e)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-black text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 uppercase tracking-widest shadow-sm hover:shadow-blue-500/20"
                    >
                      <IdCard className="w-4 h-4" />
                      ID Asset
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredEnrollments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium italic">
              No transaction data available.
            </div>
          ) : (
            filteredEnrollments.map((e: any, index: number) => (
              <div key={index} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      {new Date(e.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-[15px] font-bold text-slate-900 leading-tight">
                      {e.student_profiles?.full_name || 'Anonymous'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-black text-slate-900">
                      ₹{e.amount != null ? Number(e.amount).toLocaleString() : parseInt((e.batches?.fee_structure || '1000').replace(/[^0-9]/g, '') || '1000', 10).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">
                      Settled
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-3 rounded-xl">
                   <div className="w-2 h-2 rounded-full bg-slate-300" />
                   <span className="truncate">
                     {e.batches?.institutes?.name || 'N/A'} • {e.batches?.batch_name || 'N/A'}
                   </span>
                </div>

                <button
                  onClick={() => setSelectedIdCard(e)}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-[11px] font-black text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 uppercase tracking-widest shadow-sm"
                >
                  <IdCard className="w-4 h-4" />
                  View ID Asset
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <IdCardModal
        isOpen={!!selectedIdCard}
        onClose={() => setSelectedIdCard(null)}
        enrollment={selectedIdCard}
        studentName={selectedIdCard?.student_profiles?.full_name || 'Anonymous Student'}
        studentPhone={selectedIdCard?.student_profiles?.phone_number || 'N/A'}
        studentPhoto={selectedIdCard?.student_profiles?.photo_url || undefined}
        classNameLabel={selectedIdCard?.student_profiles?.education_level || 'Student'}
        instituteName={selectedIdCard?.batches?.institutes?.name || 'Coaching Direct'}
      />
    </motion.div>
  );
}
