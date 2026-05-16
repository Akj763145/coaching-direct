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
  isPrint?: boolean;
  id?: string;
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
    studentPhoto,
    isPrint,
    id = "pdf-id-card-front"
  }, ref) => {
    
    const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
      const fetchImage = async (url: string | undefined, setter: (val: string | undefined) => void) => {
        if (!url) return;
        if (url.startsWith('data:')) {
          setter(url);
          return;
        }
        try {
          // Attempt using proxy to bypass CORS
          const proxyUrl = url.startsWith('/') ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => setter(reader.result as string);
          reader.readAsDataURL(blob);
        } catch (err) {
          console.warn("Failed to fetch image as blob via proxy, falling back to url", url, err);
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
        id={id}
        className="bg-[#ffffff] rounded-3xl overflow-hidden flex flex-col font-sans relative border border-[#f1f5f9] shrink-0"
        style={{ color: '#0f172a', width: '800px', height: '450px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden', border: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}
      >
        {/* HEADER: Gradient Banner */}
        <div 
          className="h-28 w-full flex items-center px-10 relative"
          style={{ background: 'linear-gradient(to right, #dcfce7, #eff6ff, #bfdbfe)', height: '7rem', width: '100%', display: 'flex', alignItems: 'center', paddingLeft: '2.5rem', paddingRight: '2.5rem', position: 'relative', boxSizing: 'border-box' }}
        >
          {/* Logo & Branding */}
          <div className="flex items-center justify-start" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <div className="flex items-center justify-start" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <svg className="w-10 h-10 shrink-0" style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0 }} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 38L8 16C8 16 12 10 24 18C24 18 24 38 24 38Z" fill="#2563eb"/>
                <path d="M24 38L40 16C40 16 36 10 24 18C24 18 24 38 24 38Z" fill="#0f172a"/>
                <circle cx="24" cy="8" r="5" fill="#2563eb"/>
              </svg>
              <div className="flex flex-col ml-3" style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.75rem' }}>
                <span className={`text-2xl font-black flex items-center text-[#2563eb] whitespace-nowrap`} style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', color: '#2563eb', whiteSpace: 'nowrap', lineHeight: 1 }}>
                  VidyaNation
                </span>
                <span className={`text-[10px] font-bold text-[#94a3b8] uppercase mt-0.5 whitespace-nowrap`} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.125rem', whiteSpace: 'nowrap', lineHeight: 1 }}>The Future of local education</span>
              </div>
            </div>
          </div>

          {/* Institute Info (Centered/Rightish) */}
          <div className="flex-1 flex items-center justify-end pr-4" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '1rem' }}>
            <div className="w-16 h-16 shrink-0 rounded-full bg-[#ffffff] border-2 border-[#10b981] flex items-center justify-center p-2 mr-6" style={{ width: '4rem', height: '4rem', flexShrink: 0, borderRadius: '9999px', backgroundColor: '#ffffff', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', marginRight: '1.5rem', boxSizing: 'border-box' }}>
              {logoDataUrl ? (
                <div 
                  className="w-full h-full"
                  style={{ 
                    width: '100%', height: '100%',
                    backgroundImage: `url(${logoDataUrl})`, 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat' 
                  }}
                />
              ) : instituteName ? (
                <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-[#ffffff] font-black text-xl" style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#10b981', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: '1.25rem' }}>
                  {instituteName.charAt(0)}
                </div>
              ) : null}
            </div>
            <h1 className={`text-2xl font-black text-[#1e293b] uppercase max-w-[200px] leading-tight text-right truncate whitespace-nowrap`} style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', maxWidth: '200px', lineHeight: 1.25, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {instituteName}
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-row px-10 py-8 justify-between items-stretch" style={{ flex: 1, display: 'flex', flexDirection: 'row', padding: '2rem 2.5rem', justifyContent: 'space-between', alignItems: 'stretch', boxSizing: 'border-box' }}>
          
          {/* Column 1: Student Details */}
          <div className="flex flex-col w-[30%]" style={{ display: 'flex', flexDirection: 'column', width: '30%' }}>
            <h3 className="text-sm font-black text-[#94a3b8] uppercase border-b border-[#f1f5f9] pb-2 mb-6" style={{ fontSize: '0.875rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1.5rem', whiteSpace: 'nowrap' }}>Student Details</h3>
            <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mb-4" style={{ marginBottom: '1rem' }}>
                <p className="text-xs font-bold text-[#94a3b8] uppercase leading-none mb-1.5 whitespace-nowrap" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1, marginBottom: '0.375rem', whiteSpace: 'nowrap' }}>Full Name</p>
                <p className="text-xl font-black text-[#0f172a] leading-tight max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentName}</p>
              </div>
              <div className="flex items-center mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Phone size={14} className="text-[#2563eb]" style={{ color: '#2563eb' }} />
                <span className="text-[13px] font-medium text-[#475569] ml-2 max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginLeft: '0.5rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentPhone || 'N/A'}</span>
              </div>
              {studentEmail && (
                <div className="flex items-start mb-4" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <Mail size={14} className="text-[#2563eb] shrink-0 mt-0.5" style={{ color: '#2563eb', flexShrink: 0, marginTop: '0.125rem' }} />
                  <span className="text-[12px] font-medium text-[#475569] leading-tight ml-2 max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 500, color: '#475569', lineHeight: 1.25, marginLeft: '0.5rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentEmail}</span>
                </div>
              )}
              {dob ? (
                <div className="flex items-center mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <User size={14} className="text-[#2563eb]" style={{ color: '#2563eb' }} />
                  <span className="text-[13px] font-medium text-[#475569] ml-2 max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginLeft: '0.5rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>DOB: {dob}</span>
                </div>
              ) : age ? (
                <div className="flex items-center mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <User size={14} className="text-[#2563eb]" style={{ color: '#2563eb' }} />
                  <span className="text-[13px] font-medium text-[#475569] ml-2 max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginLeft: '0.5rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{age} Years Old</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Column 2: Student Image */}
          <div className="flex flex-col items-center justify-center w-[30%]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '30%' }}>
            <div className="w-48 h-48 rounded-2xl border-4 border-[#10b981] p-2 bg-[#ffffff] relative group" style={{ width: '12rem', height: '12rem', borderRadius: '1rem', border: '4px solid #10b981', padding: '0.5rem', backgroundColor: '#ffffff', position: 'relative', boxSizing: 'border-box' }}>
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#f8fafc] border border-[#f1f5f9]" style={{ width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                {photoDataUrl && (
                  <div 
                    className="w-full h-full"
                    style={{ 
                      width: '100%', height: '100%',
                      backgroundImage: `url(${photoDataUrl})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center', 
                      backgroundRepeat: 'no-repeat' 
                    }}
                  />
                )}
              </div>
              {/* Badge */}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-[#ffffff] border-4 border-[#ffffff]" style={{ position: 'absolute', bottom: '-0.75rem', right: '-0.75rem', width: '2.5rem', height: '2.5rem', backgroundColor: '#10b981', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '4px solid #ffffff', boxSizing: 'border-box' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          {/* Column 3: Batch Details */}
          <div className="flex flex-col justify-between h-full w-[30%]" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '30%' }}>
            <div>
              <h3 className="text-sm font-black text-[#94a3b8] uppercase border-b border-[#f1f5f9] pb-2 mb-4" style={{ fontSize: '0.875rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem', whiteSpace: 'nowrap' }}>Batch Details</h3>
              <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="mb-4" style={{ marginBottom: '1rem' }}>
                  <p className="text-xs font-bold text-[#94a3b8] uppercase leading-none mb-1.5 whitespace-nowrap" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1, marginBottom: '0.375rem', whiteSpace: 'nowrap' }}>Batch Name</p>
                  <p className="text-lg font-black text-[#0f172a] leading-tight max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{batchName}</p>
                </div>
                {teacherName && (
                  <div className="mb-4" style={{ marginBottom: '1rem' }}>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase leading-none mb-1.5 whitespace-nowrap" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1, marginBottom: '0.375rem', whiteSpace: 'nowrap' }}>Teacher</p>
                    <p className="text-[13px] font-black text-[#334155] leading-tight max-w-[150px] truncate whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 900, color: '#334155', lineHeight: 1.25, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacherName}</p>
                  </div>
                )}
                <div className="flex items-center mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <Hash size={14} className="text-[#2563eb] shrink-0" style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span className="text-[12px] font-bold text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-1 rounded-md ml-2 max-w-[150px] leading-tight truncate whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 700, color: '#334155', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', marginLeft: '0.5rem', maxWidth: '150px', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paymentId}</span>
                </div>
                <div className="flex items-center mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <Calendar size={14} className="text-[#2563eb]" style={{ color: '#2563eb' }} />
                  <span className="text-[13px] font-medium text-[#475569] ml-2 whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>Issued: <span className="font-bold text-[#0f172a] whitespace-nowrap" style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{enrollmentDate}</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-end justify-between pt-4 relative mt-auto" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '1rem', position: 'relative', marginTop: 'auto' }}>
              <div className="relative pb-2 pr-2 ml-auto w-[80px]" style={{ position: 'relative', paddingBottom: '0.5rem', paddingRight: '0.5rem', marginLeft: 'auto', width: '80px' }}>
                <AuthenticityStamp paymentId={paymentId} date={enrollmentDate} className="w-[80px] h-[80px]" />
                <p className="text-[8px] font-black text-[#94a3b8] uppercase text-center mt-2 absolute -bottom-2 -left-2 w-[100px]" style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', marginTop: '0.5rem', position: 'absolute', bottom: '-0.5rem', left: '-0.5rem', width: '100px', whiteSpace: 'nowrap' }}>Authorized</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-16 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-center px-16" style={{ height: '4rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4rem', boxSizing: 'border-box' }}>
          <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="text-sm font-bold text-[#334155] uppercase whitespace-nowrap" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>vidyanation.online</span>
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase mt-0.5 whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.125rem', whiteSpace: 'nowrap' }}>Verified Student Asset</span>
          </div>
        </div>

        {/* Bottom Decorative Strip */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #2563eb, #10b981)', height: '0.375rem', width: '100%' }}></div>
      </div>
    );
  }
);

export const StudentIDCardBack = forwardRef<HTMLDivElement, any>((props, ref) => {
  const paymentId = props.paymentId || "VN-00000000";
  const id = props.id || "pdf-id-card-back";
  
  return (
    <div 
      ref={ref}
      id={id}
      className="rounded-3xl overflow-hidden flex flex-col font-sans relative border border-[#f1f5f9] shrink-0"
      style={{ background: 'linear-gradient(to right, #dcfce7, #bfdbfe)', color: '#0f172a', width: '800px', height: '450px', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden', border: '1px solid #f1f5f9', whiteSpace: 'nowrap', boxSizing: 'border-box' }}
    >
      <div className="flex-1 flex flex-row items-center justify-center p-12" style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', zIndex: 10 }}>
        <div className="flex flex-col items-center justify-center text-center mr-16" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginRight: '4rem' }}>
          {/* Mock Logo */}
          <div className="mb-6 scale-[2.0]" style={{ marginBottom: '1.5rem', transform: 'scale(2.0)' }}>
            <svg className="w-16 h-16 shrink-0" style={{ width: '4rem', height: '4rem', flexShrink: 0 }} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 38L8 16C8 16 12 10 24 18C24 18 24 38 24 38Z" fill="#2563eb"/>
              <path d="M24 38L40 16C40 16 36 10 24 18C24 18 24 38 24 38Z" fill="#0f172a"/>
              <circle cx="24" cy="8" r="5" fill="#2563eb"/>
            </svg>
          </div>

          <h1 className="text-5xl font-black text-[#0f172a] mb-3 whitespace-nowrap" style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', whiteSpace: 'nowrap', lineHeight: 1 }}>
            VidyaNation
          </h1>
          
          <p className="text-xl font-bold text-[#1e293b] opacity-80 uppercase whitespace-nowrap" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', opacity: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
            The Future of Local Education Search
          </p>
        </div>

        {paymentId && (
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-sm border shadow-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', borderColor: 'rgba(255, 255, 255, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div className="bg-white p-2 rounded-xl shadow-sm mb-3" style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '0.75rem' }}>
              <QRCodeCanvas 
                value={`https://vidyanation.online/verify/${paymentId}`} 
                size={140}
                level="H"
                fgColor="#0f172a"
              />
            </div>
            <div className="text-center" style={{ textAlign: 'center' }}>
              <p className="text-sm font-black text-[#0f172a] uppercase leading-tight whitespace-nowrap" style={{ fontSize: '0.875rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', lineHeight: 1.25, whiteSpace: 'nowrap' }}>Verify Student</p>
              <p className="text-xs font-medium text-[#475569] mt-1 whitespace-nowrap" style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>Scan QR Code</p>
            </div>
          </div>
        )}

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" style={{ position: 'absolute', top: 0, left: 0, width: '8rem', height: '8rem', filter: 'blur(64px)', borderRadius: '9999px', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.2)', zIndex: -1 }}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" style={{ position: 'absolute', bottom: 0, right: 0, width: '16rem', height: '16rem', filter: 'blur(64px)', borderRadius: '9999px', transform: 'translate(33.33%, 33.33%)', backgroundColor: 'rgba(37, 99, 235, 0.1)', zIndex: -1 }}></div>
      </div>
      
      {/* Footer Branding Bar */}
      <div 
        className="h-16 flex items-center justify-center px-16 border-t"
        style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4rem', backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.2)', zIndex: 10, position: 'relative' }}
      >
         <span className="text-sm font-black uppercase whitespace-nowrap" style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'rgba(15, 23, 42, 0.4)' }}>Verified Institution Asset</span>
      </div>
    </div>
  );
});

StudentIDCardFront.displayName = 'StudentIDCardFront';
StudentIDCardBack.displayName = 'StudentIDCardBack';

export const StudentIDCard = StudentIDCardFront;
