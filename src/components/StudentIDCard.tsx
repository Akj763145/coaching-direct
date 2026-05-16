import React, { forwardRef, useState, useEffect } from 'react';
import { Phone, Mail, Globe, Hash, Calendar, CheckCircle2, MapPin, User } from 'lucide-react';
import { AuthenticityStamp } from './AuthenticityStamp';

import { QRCodeCanvas } from 'qrcode.react';

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
  teacherName?: string;
  age?: number | string;
  dob?: string;
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
    studentEmail,
    teacherName,
    age,
    dob,
    validityDate = "Dec 2026",
    studentPhoto
  }, ref) => {
    
    const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
      const fetchImage = async (url: string | undefined, setter: (val: string) => void) => {
        if (!url) return;
        if (url.startsWith('data:')) {
          setter(url);
          return;
        }
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => setter(reader.result as string);
          reader.readAsDataURL(blob);
        } catch (err) {
          console.warn("Failed to fetch image as blob, falling back to url", url, err);
          setter(url);
        }
      };

      const initialPhotoUrl = studentPhoto || `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(studentName)}&backgroundColor=f1f5f9`;
      
      fetchImage(instituteLogo, setLogoDataUrl);
      fetchImage(initialPhotoUrl, setPhotoDataUrl);
    }, [instituteLogo, studentPhoto, studentName]);

    return (
      <div 
        ref={ref}
        id="pdf-id-card-front"
        className="w-[800px] h-[450px] bg-[#ffffff] rounded-3xl overflow-hidden flex flex-col font-sans relative border border-[#f1f5f9] shrink-0"
        style={{ color: '#0f172a' }}
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
            <div className="w-16 h-16 rounded-full bg-[#ffffff] border-2 border-[#10b981] flex items-center justify-center overflow-hidden">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="Logo" className="w-12 h-12 object-contain" />
              ) : instituteName ? (
                <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-[#ffffff] font-black text-xl">
                  {instituteName.charAt(0)}
                </div>
              ) : null}
            </div>
            <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight max-w-[300px] leading-tight text-right">
              {instituteName}
            </h1>
          </div>
        </div>

        {/* MAIN BODY: 3-Column Grid */}
        <div className="flex-1 grid grid-cols-3 gap-10 px-12 py-8 items-start">
          
          {/* Column 1: Student Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#94a3b8] uppercase tracking-widest border-b border-[#f1f5f9] pb-2">Student Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest leading-none mb-1.5">Full Name</p>
                <p className="text-xl font-black text-[#0f172a] leading-tight">{studentName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#2563eb]" />
                <span className="text-[13px] font-medium text-[#475569]">{studentPhone || 'N/A'}</span>
              </div>
              {studentEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#2563eb]" />
                  <span className="text-[13px] font-medium text-[#475569] truncate" title={studentEmail}>{studentEmail}</span>
                </div>
              )}
              {dob ? (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#2563eb]" />
                  <span className="text-[13px] font-medium text-[#475569]">DOB: {dob}</span>
                </div>
              ) : age ? (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#2563eb]" />
                  <span className="text-[13px] font-medium text-[#475569]">{age} Years Old</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Column 2: Student Image */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-2xl border-4 border-[#10b981] p-2 bg-[#ffffff] relative group">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#f8fafc] border border-[#f1f5f9]">
                {photoDataUrl && (
                  <img 
                    src={photoDataUrl} 
                    alt={studentName} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Badge */}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-[#ffffff] border-4 border-[#ffffff]">
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
                {teacherName && (
                  <div>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest leading-none mb-1.5">Teacher</p>
                    <p className="text-[13px] font-black text-[#334155] leading-tight">{teacherName}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-[#2563eb]" />
                  <span className="text-[13px] font-bold text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-1 rounded-md">{paymentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#2563eb]" />
                  <span className="text-[13px] font-medium text-[#475569]">Issued: <span className="font-bold text-[#0f172a]">{enrollmentDate}</span></span>
                </div>
            </div>
            
            <div className="flex items-end justify-between pt-4 relative">
              <div className="relative pb-2 pr-2 mt-4 ml-auto">
                <AuthenticityStamp paymentId={paymentId} date={enrollmentDate} className="w-[80px] h-[80px]" />
                <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-[0.2em] text-center mt-2 absolute -bottom-2 -left-2 w-[100px]">Authorized</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-16 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-center px-16">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-[#334155] tracking-tight uppercase">vidyanation.online</span>
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mt-0.5">Verified Student Asset</span>
          </div>
        </div>

        {/* Bottom Decorative Strip */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #2563eb, #10b981)' }}></div>
      </div>
    );
  }
);

export const StudentIDCardBack = forwardRef<HTMLDivElement, any>((props, ref) => {
  const paymentId = props.paymentId || "VN-00000000";
  
  return (
    <div 
      ref={ref}
      id="pdf-id-card-back"
      className="w-[800px] h-[450px] rounded-3xl overflow-hidden flex flex-col font-sans relative border border-[#f1f5f9] shrink-0"
      style={{ background: 'linear-gradient(to right, #dcfce7, #bfdbfe)', color: '#0f172a' }}
    >
      <div className="flex-1 flex items-center justify-center gap-16 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Mock Logo */}
          <div className="mb-6 scale-[2.0]">
            <svg className="w-16 h-16 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 38L8 16C8 16 12 10 24 18C24 18 24 38 24 38Z" fill="#2563eb"/>
              <path d="M24 38L40 16C40 16 36 10 24 18C24 18 24 38 24 38Z" fill="#0f172a"/>
              <circle cx="24" cy="8" r="5" fill="#2563eb"/>
            </svg>
          </div>

          <h1 className="text-5xl font-black text-[#0f172a] tracking-tighter mb-3">
            VidyaNation
          </h1>
          
          <p className="text-xl font-bold text-[#1e293b] tracking-tight opacity-80 uppercase">
            The Future of Local Education Search
          </p>
        </div>

        {paymentId && (
          <div className="flex flex-col items-center justify-center gap-3 bg-white/40 p-6 rounded-2xl backdrop-blur-sm border border-white/50 shadow-xl">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <QRCodeCanvas 
                value={`https://vidyanation.online/verify/${paymentId}`} 
                size={140}
                level="H"
                fgColor="#0f172a"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-[#0f172a] uppercase tracking-widest leading-tight">Verify Student</p>
              <p className="text-xs font-medium text-[#475569] mt-1">Scan QR Code</p>
            </div>
          </div>
        )}

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}></div>
      </div>
      
      {/* Footer Branding Bar */}
      <div 
        className="h-16 flex items-center justify-center px-16 border-t"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
      >
         <span className="text-sm font-black uppercase tracking-[0.4em]" style={{ color: 'rgba(15, 23, 42, 0.4)' }}>Verified Institution Asset</span>
      </div>
    </div>
  );
});

StudentIDCardFront.displayName = 'StudentIDCardFront';
StudentIDCardBack.displayName = 'StudentIDCardBack';

export const StudentIDCard = StudentIDCardFront;
