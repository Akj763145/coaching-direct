import React, { forwardRef } from 'react';
import { QrCode, Building2, GraduationCap } from 'lucide-react';

interface StudentIDCardProps {
  studentName: string;
  studentPhone: string;
  batchName: string;
  className: string;
  enrollmentDate: string;
  instituteName?: string;
  bloodGroup?: string;
  rollNo?: string;
  paymentId?: string;
}

export const StudentIDCard = forwardRef<HTMLDivElement, StudentIDCardProps>(
  ({ studentName, studentPhone, batchName, className, enrollmentDate, instituteName = "Coaching Direct", bloodGroup = "O+", rollNo = "-", paymentId = "N/A" }, ref) => {
    // Generate a simple avatar
    const photoUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=f1f5f9`;

    return (
      <div 
        ref={ref}
        className="relative w-[340px] h-[540px] bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col print:shadow-none print:border-none print:rounded-none font-sans"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <GraduationCap size={240} />
        </div>

        {/* HEADER: Institute Branding */}
        <div className="bg-blue-800 text-white text-center pt-5 pb-4 px-4 relative z-10">
          <div className="flex justify-center mb-2">
             <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-lg font-bold uppercase tracking-widest leading-tight">Coaching Direct</h1>
          <p className="text-[10px] uppercase tracking-wider text-blue-200 font-medium mt-1">{instituteName}</p>
        </div>

        {/* Title Ribbon */}
        <div className="bg-amber-500 text-center py-1 relative z-10 shadow-sm">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Student ID Card</span>
        </div>

        {/* CARD BODY */}
        <div className="flex-1 flex flex-col items-center pt-6 px-6 relative z-10">
          
          {/* Photo Area - Standard Passport Ratio */}
          <div className="w-24 h-32 border-2 border-gray-300 p-1 bg-white mb-4 shadow-sm relative">
            <img 
              src={photoUrl} 
              alt="Student Photo" 
              className="w-full h-full object-cover bg-gray-50"
            />
          </div>

          {/* Student Name */}
          <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide mb-4 text-center pb-2">
            {studentName}
          </h2>

          {/* Data Table */}
          <div className="w-full space-y-1 text-sm bg-white">
            <div className="flex border-b border-gray-100 pb-1.5">
              <span className="w-24 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Payment ID</span>
              <span className="font-semibold text-gray-800 text-[11px]">: {paymentId}</span>
            </div>
            
            <div className="flex border-b border-gray-100 pb-1.5 pt-0.5">
              <span className="w-24 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Course</span>
              <span className="font-semibold text-gray-800 text-[11px] truncate w-full">: {batchName}</span>
            </div>

            <div className="flex border-b border-gray-100 pb-1.5 pt-0.5">
              <span className="w-24 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Class</span>
              <span className="font-semibold text-gray-800 text-[11px]">: {className || 'Student'}</span>
            </div>

            <div className="flex border-b border-gray-100 pb-1.5 pt-0.5">
              <span className="w-24 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Contact</span>
              <span className="font-semibold text-gray-800 text-[11px]">: {studentPhone}</span>
            </div>
            
            <div className="flex border-b border-gray-100 pb-1.5 pt-0.5">
              <span className="w-24 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Enrolled</span>
              <span className="font-semibold text-gray-800 text-[11px]">: {enrollmentDate}</span>
            </div>
          </div>

        </div>

        {/* FOOTER: Signatures and QR */}
        <div className="mt-auto px-6 py-4 flex justify-between items-end bg-gray-50 border-t border-gray-200 relative z-10 w-full">
          
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-1 border border-gray-200 rounded shadow-sm mb-1">
              <QrCode size={32} className="text-gray-800" />
            </div>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Scan to Verify</p>
          </div>
          
          {/* Signature */}
          <div className="flex flex-col items-center pb-1">
            <div className="h-6 flex items-end justify-center mb-1 w-24">
               {/* Signature Image or cursive font placeholder */}
               <span className="font-serif italic text-blue-900 text-base opacity-90">Coaching Direct</span>
            </div>
            <div className="w-24 h-px bg-gray-400 mb-1"></div>
            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-wider">Principal / Director</p>
          </div>

        </div>
        
        {/* Bottom Accent Bar */}
        <div className="h-1.5 w-full bg-blue-800"></div>

      </div>
    );
  }
);

StudentIDCard.displayName = 'StudentIDCard';
