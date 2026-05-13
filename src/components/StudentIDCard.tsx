import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // We can use lucide icon instead since qrcode.react is not installed and user mentioned "use a Lucide icon or simple div". Let's use Lucide QrCode
import { QrCode, ShieldCheck } from 'lucide-react';

interface StudentIDCardProps {
  studentName: string;
  studentPhone: string;
  batchName: string;
  className: string;
  enrollmentDate: string;
  instituteName?: string;
}

export const StudentIDCard = forwardRef<HTMLDivElement, StudentIDCardProps>(
  ({ studentName, studentPhone, batchName, className, enrollmentDate, instituteName = "Coaching Direct" }, ref) => {
    return (
      <div 
        ref={ref}
        className="relative w-[350px] h-[500px] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans"
        style={{
          boxShadow: '0 0 40px -10px rgba(124, 58, 237, 0.3), inset 0 0 20px -5px rgba(124, 58, 237, 0.2)',
          border: '1px solid rgba(124, 58, 237, 0.3)'
        }}
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/30 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[50px] pointer-events-none" />

        {/* Header */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-white/10 relative z-10 bg-gradient-to-b from-purple-900/40 to-transparent">
          <div className="flex justify-center mb-1">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-white font-bold tracking-widest text-sm uppercase opacity-90">{instituteName}</h2>
          <p className="text-purple-300 text-[10px] tracking-widest uppercase mt-0.5">Official Student ID</p>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 flex flex-col items-center relative z-10">
          {/* Photo Placeholder */}
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/30 flex items-center justify-center p-1 shadow-inner mb-5">
            <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden">
               {/* Simple initials if no photo */}
               <span className="text-3xl font-bold text-slate-400">{studentName.charAt(0)}</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-1 text-center leading-tight">
            {studentName}
          </h1>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            {className || 'Student'}
          </p>

          <div className="w-full grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Batch</p>
              <p className="text-sm font-semibold text-slate-200 line-clamp-1">{batchName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-semibold text-slate-200">{studentPhone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Enrolled On</p>
              <p className="text-sm font-semibold text-slate-200">{enrollmentDate}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
             <div className="bg-white p-1 rounded-md">
               <QrCode className="w-8 h-8 text-black" />
             </div>
             <div>
               <p className="text-[9px] text-slate-400 uppercase tracking-wider">Verification</p>
               <p className="text-[10px] font-mono text-purple-300">SCAN TO VERIFY</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[8px] text-slate-500 uppercase tracking-widest">Valid For</p>
             <p className="text-[10px] font-bold text-slate-300">2026-2027</p>
          </div>
        </div>
      </div>
    );
  }
);

StudentIDCard.displayName = 'StudentIDCard';
