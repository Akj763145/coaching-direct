import React, { forwardRef } from 'react';
import { Phone, Mail, Globe, MapPin, Hash, Calendar, CheckCircle2 } from 'lucide-react';
import { AuthenticityStamp } from './AuthenticityStamp';

interface StudentIDCardProps {
  studentName: string;
  studentPhone: string;
  batchName: string;
  className: string;
  enrollmentDate: string;
  instituteName?: string;
  instituteLogo?: string;
  paymentId?: string;
  studentEmail?: string;
  location?: string;
  validityDate?: string;
  studentPhoto?: string;
}

export const StudentIDCardFront = forwardRef<HTMLDivElement, StudentIDCardProps>(
  ({ 
    studentName, 
    studentPhone, 
    batchName, 
    className, 
    enrollmentDate, 
    instituteName = "VidyaNation Academy", 
    instituteLogo,
    paymentId = "VN-00000000",
    studentEmail = "student@vidyanation.online",
    location = "Motihari, Bihar",
    validityDate = "Dec 2026",
    studentPhoto
  }, ref) => {
    // Use student photo if provided, otherwise generate a placeholder
    const photoUrl = studentPhoto || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=f1f5f9`;

    return (
      <div 
        ref={ref}
        id="pdf-id-card-front"
        className="w-[800px] h-[450px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans relative border border-slate-100 shrink-0"
      >
        {/* HEADER: Gradient Banner */}
        <div 
          className="h-28 w-full flex items-center px-10 relative"
          style={{ background: 'linear-gradient(to right, #dcfce7, #eff6ff, #bfdbfe)' }}
        >
          {/* Logo & Branding */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 38L8 16C8 16 12 10 24 18C24 18 24 38 24 38Z" fill="#2563eb"/>
                <path d="M24 38L40 16C40 16 36 10 24 18C24 18 24 38 24 38Z" fill="#0f172a"/>
                <circle cx="24" cy="8" r="5" fill="#2563eb"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight flex items-center gap-1 text-[#2563eb]">
                  VidyaNation
                </span>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mt-0.5">The Future of local education</span>
              </div>
            </div>
          </div>

          {/* Institute Info (Centered/Rightish) */}
          <div className="flex-1 flex items-center justify-end gap-6 pr-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#10b981] flex items-center justify-center overflow-hidden shadow-sm">
              {instituteLogo ? (
                <img src={instituteLogo} alt="Logo" className="w-12 h-12 object-contain" crossOrigin="anonymous" />
              ) : (
                <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-white font-black text-xl">
                  {instituteName.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight max-w-[300px] leading-tight">
              {instituteName}
            </h1>
          </div>
        </div>

        {/* MAIN BODY: 3-Column Grid */}
        <div className="flex-1 grid grid-cols-3 gap-10 px-12 py-10 items-center">
          
          {/* Column 1: Student Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#94a3b8] uppercase tracking-widest border-b border-[#f1f5f9] pb-2">Student Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest leading-none mb-1.5">Full Name</p>
                <p className="text-xl font-black text-[#0f172a] leading-tight">{studentName}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#2563eb]" />
                <span className="text-[13px] font-medium text-[#475569]">{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-[#2563eb]" />
                <span className="text-[13px] font-bold text-[#334155] bg-[#f8fafc] px-2 py-1 rounded-md">{paymentId}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Student Image */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-2xl border-4 border-[#10b981] p-2 bg-white shadow-xl relative group">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#f8fafc] border border-[#f1f5f9]">
                <img 
                  src={photoUrl} 
                  alt={studentName} 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          {/* Column 3: Batch Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#94a3b8] uppercase tracking-widest border-b border-[#f1f5f9] pb-2">Batch Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest leading-none mb-1.5">Batch Name</p>
                <p className="text-lg font-black text-[#0f172a] leading-tight">{batchName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#2563eb]" />
                <span className="text-[13px] font-medium text-[#475569]">Valid Till: <span className="font-bold text-[#0f172a]">{validityDate}</span></span>
              </div>
              
              <div className="pt-4 relative">
                <div className="w-full h-px bg-[#e2e8f0] mb-1.5"></div>
                <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-[0.2em] text-center">Authorized Signature</p>
                <div className="absolute -top-16 right-0 -mr-4">
                  <AuthenticityStamp paymentId={paymentId} date={enrollmentDate} className="w-[100px] h-[100px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-16 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between px-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white transition-transform hover:scale-110">
              <Phone size={14} />
            </div>
            <span className="text-sm font-bold text-[#334155] tracking-tight">{studentPhone}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white transition-transform hover:scale-110">
              <Mail size={14} />
            </div>
            <span className="text-sm font-bold text-[#334155] tracking-tight">{studentEmail}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white transition-transform hover:scale-110">
              <Globe size={14} />
            </div>
            <span className="text-sm font-bold text-[#334155] tracking-tight">vidyanation.online</span>
          </div>
        </div>

        {/* Bottom Decorative Strip */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #2563eb, #10b981)' }}></div>
      </div>
    );
  }
);

export const StudentIDCardBack = forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div 
      ref={ref}
      id="pdf-id-card-back"
      className="w-[800px] h-[450px] rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans relative border border-[#f1f5f9] shrink-0"
      style={{ background: 'linear-gradient(to right, #dcfce7, #bfdbfe)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        {/* Mock Logo */}
        <div className="mb-8 scale-[2.5]">
          <svg className="w-16 h-16 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 38L8 16C8 16 12 10 24 18C24 18 24 38 24 38Z" fill="#2563eb"/>
            <path d="M24 38L40 16C40 16 36 10 24 18C24 18 24 38 24 38Z" fill="#0f172a"/>
            <circle cx="24" cy="8" r="5" fill="#2563eb"/>
          </svg>
        </div>

        <h1 className="text-6xl font-black text-[#0f172a] tracking-tighter mb-4">
          VidyaNation
        </h1>
        
        <p className="text-2xl font-bold text-[#1e293b] tracking-tight opacity-80 uppercase">
          The Future of Local Education Search
        </p>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}></div>
      </div>
      
      {/* Footer Branding Bar */}
      <div 
        className="h-16 flex items-center justify-center px-16 border-t border-white/20"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(12px)' }}
      >
         <span className="text-sm font-black text-slate-900/40 uppercase tracking-[0.4em]">Verified Institution Asset</span>
      </div>
    </div>
  );
});

StudentIDCardFront.displayName = 'StudentIDCardFront';
StudentIDCardBack.displayName = 'StudentIDCardBack';

export const StudentIDCard = StudentIDCardFront;
