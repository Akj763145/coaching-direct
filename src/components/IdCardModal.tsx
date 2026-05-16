import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Loader2, FileText } from 'lucide-react';
import { StudentIDCardFront, StudentIDCardBack } from './StudentIDCard';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { StudentIdPdf } from './StudentIdPdf';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any;
  studentName: string;
  studentPhone: string;
  studentPhoto?: string;
  classNameLabel?: string;
  instituteName?: string;
}

export function IdCardModal({ 
  isOpen, onClose, enrollment, 
  studentName, studentPhone, studentPhoto,
  classNameLabel, 
  instituteName 
}: IdCardModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const canvas = document.getElementById('qr-view') as HTMLCanvasElement;
        if (canvas) {
          setQrCodeDataUrl(canvas.toDataURL('image/png'));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !enrollment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -30 }}
          className="bg-white p-4 md:p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center border border-slate-200 shadow-2xl max-w-full max-h-[95vh]"
        >
          {/* Modal Header */}
          <div className="w-full flex items-center justify-between mb-6 px-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Asset</h2>
              <p className="text-sm text-slate-500 font-medium">Verified 2-Sided credential for {instituteName || 'Academy'}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-900 transition-all bg-slate-50 hover:bg-slate-100 rounded-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 overflow-y-auto max-w-full p-2 flex flex-col gap-8 scrollbar-hide">
            <div id="pdf-wrapper" className="scale-[0.4] sm:scale-[0.55] md:scale-[0.7] lg:scale-[0.85] xl:scale-100 origin-top">
              <div className="flex flex-col gap-10">
                <StudentIDCardFront 
                  studentName={studentName || 'Ayush Kumar'}
                  studentPhone={studentPhone || '0000000000'}
                  batchName={enrollment.batches?.name || enrollment.batches?.batch_name || 'Generic Batch'}
                  className={classNameLabel || 'Student'}
                  enrollmentDate={new Date(enrollment.enrollment_date || enrollment.created_at || Date.now()).toLocaleDateString()}
                  instituteName={instituteName || enrollment.batches?.institutes?.name || 'Ritik Sir\'s Academy'}
                  instituteLogo={enrollment.batches?.institutes?.logo}
                  paymentId={enrollment.razorpay_payment_id || 'manual-pay-001'}
                  age={
                    enrollment.student_profiles?.age 
                    || (enrollment.student_profiles?.dob 
                        ? Math.floor((new Date().getTime() - new Date(enrollment.student_profiles.dob).getTime()) / 3.15576e+10)
                        : undefined)
                  }
                  dob={enrollment.student_profiles?.dob}
                  teacherName={enrollment.batches?.teacher_name}
                  studentEmail={enrollment.student_profiles?.email || undefined}
                  studentPhoto={studentPhoto || enrollment.student_profiles?.photo_url}
                />
                <StudentIDCardBack paymentId={enrollment.razorpay_payment_id || 'manual-pay-001'} />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center mt-auto">
            {qrCodeDataUrl ? (
              <PDFDownloadLink
                document={
                  <StudentIdPdf
                    studentName={studentName || 'Ayush Kumar'}
                    studentPhone={studentPhone || '0000000000'}
                    batchName={enrollment.batches?.name || enrollment.batches?.batch_name || 'Generic Batch'}
                    enrollmentDate={new Date(enrollment.enrollment_date || enrollment.created_at || Date.now()).toLocaleDateString()}
                    instituteName={instituteName || enrollment.batches?.institutes?.name || 'Ritik Sir\'s Academy'}
                    instituteLogo={enrollment.batches?.institutes?.logo}
                    paymentId={enrollment.razorpay_payment_id || 'manual-pay-001'}
                    age={
                      enrollment.student_profiles?.age 
                      || (enrollment.student_profiles?.dob 
                          ? Math.floor((new Date().getTime() - new Date(enrollment.student_profiles.dob).getTime()) / 3.15576e+10)
                          : undefined)
                    }
                    dob={enrollment.student_profiles?.dob}
                    teacherName={enrollment.batches?.teacher_name}
                    studentEmail={enrollment.student_profiles?.email || undefined}
                    studentPhoto={studentPhoto || enrollment.student_profiles?.photo_url || `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(studentName || 'user')}&backgroundColor=f1f5f9`}
                    qrCodeDataUrl={qrCodeDataUrl}
                  />
                }
                fileName={`VidyaNation_ID_${enrollment?.razorpay_payment_id || 'manual'}.pdf`}
                className="w-full sm:w-[380px] py-4.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-2xl font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 group px-4 h-14"
              >
                {({ loading }) => (
                  <>
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Generating Document...
                      </>
                    ) : (
                      <>
                        <FileText className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                        Download 2-Side HD ID Card
                      </>
                    )}
                  </>
                )}
              </PDFDownloadLink>
            ) : (
              <button
                disabled
                className="w-full sm:w-[380px] py-4.5 bg-slate-900 opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-3 px-4 h-14"
              >
                <Loader2 className="w-6 h-6 animate-spin" />
                Preparing Canvas...
              </button>
            )}
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center sm:text-left">
              True Vector • 2 Pages • Credit Card Size PDF
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
