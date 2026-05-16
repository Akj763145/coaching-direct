import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, ArrowLeft, Loader2, Calendar, MapPin, Building2, User, Hash, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyStudent() {
  const { id } = useParams(); // paymentId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    async function fetchEnrollment() {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch from API instead of RPC because of joining on auth.users logic
        const response = await fetch(`/api/public/verify-student/${id}`);
        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           throw new Error(errData.error || "Enrollment not found");
        }
        
        const data = await response.json();
        
        if (!data) throw new Error("Enrollment not found");

        setEnrollment(data);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.message || 'Invalid or expired verification ID');
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying student identity...</p>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/10"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Verification Failed</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
          The scanned QR code is either invalid, expired, or the student data cannot be found.
        </p>
        <Link 
          to="/"
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const batch = enrollment.batch;
  const institute = batch?.institute;
  
  // Format the photo. Fallback to dicebear if student photo isn't stored
  const photoUrl = enrollment.student_photo_url || `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(enrollment.student_name)}&backgroundColor=f1f5f9`;

  const isActive = enrollment.status === 'active';

  return (
    <div className="flex-1 flex flex-col min-h-[80vh] items-center py-12 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-lg z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-8 group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
        >
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100 flex flex-col items-center relative overflow-hidden">
            {isActive ? (
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold shadow-sm border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  ACTIVE BATCH
                </div>
              </div>
            ) : (
                <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold shadow-sm border border-red-200">
                  INACTIVE
                </div>
              </div>
            )}
            
            <div className="relative mb-6 group">
               <div className="relative w-32 h-32 rounded-full ring-4 ring-emerald-500/20 p-1">
                 <img 
                   src={photoUrl} 
                   alt={enrollment.student_name}
                   className="w-full h-full object-cover rounded-full shadow-lg"
                 />
                 {isActive && (
                   <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                 )}
               </div>
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 mb-1">{enrollment.student_name}</h1>
            
            <div className="flex flex-col items-center gap-1.5 mb-5 mt-2">
               {enrollment.student_phone && (
                 <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                   <Phone className="w-3.5 h-3.5 text-blue-500" />
                   {enrollment.student_phone}
                 </p>
               )}
               {enrollment.student_email && (
                 <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                   <Mail className="w-3.5 h-3.5 text-blue-500" />
                   {enrollment.student_email}
                 </p>
               )}
               {enrollment.student_dob ? (
                 <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                   <User className="w-3.5 h-3.5 text-blue-500" />
                   DOB: {enrollment.student_dob}
                 </p>
               ) : enrollment.student_age ? (
                 <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                   <User className="w-3.5 h-3.5 text-blue-500" />
                   {enrollment.student_age} Years Old
                 </p>
               ) : null}
            </div>

            <p className="text-slate-500 font-medium flex items-center justify-center gap-1.5 text-sm mb-4">
               <Hash className="w-3.5 h-3.5" />
               <span className="font-mono">{id}</span>
            </p>
            
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
               <CheckCircle2 className="w-5 h-5" />
               Identity Verified
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Enrolled In</h3>
               <div className="flex items-start gap-4">
                  {institute?.logo_url ? (
                    <img src={institute.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                       {institute?.name?.charAt(0) || <Building2 />}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">{institute?.name || 'Unknown Institute'}</p>
                    {institute?.address && (
                       <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{institute.address}</span>
                       </p>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Batch Detail</p>
                  <p className="text-slate-900 font-bold">{batch?.name} <span className="text-slate-400 font-medium">({batch?.standard})</span></p>
               </div>
               <div className="h-px w-full bg-slate-200"></div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1"><User className="w-3 h-3"/> Teacher</p>
                     <p className="text-sm font-semibold text-slate-900 truncate">{batch?.teacher?.full_name || 'Assigned Staff'}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3"/> Schedule</p>
                     <p className="text-sm font-semibold text-slate-900">{batch?.start_time} - {batch?.end_time}</p>
                  </div>
               </div>
            </div>
            
            <div className="text-center pt-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Date</p>
               <p className="text-sm font-medium text-slate-600">{new Date(enrollment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
