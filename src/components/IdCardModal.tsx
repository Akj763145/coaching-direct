import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Loader2, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { StudentIDCardFront, StudentIDCardBack } from './StudentIDCard';

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
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCard = async () => {
    if (!frontCardRef.current || !backCardRef.current) {
      console.error('Refs not found');
      return;
    }
    
    setIsDownloading(true);
    try {
      // Small delay to ensure rendering and image fetching is complete
      await new Promise(resolve => setTimeout(resolve, 1500));

      const options = {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          // Remove transform from the scaling wrapper
          const wrapper = clonedDoc.getElementById('pdf-wrapper');
          if (wrapper) {
            wrapper.style.transform = 'none';
          }
          // Ensure elements are visible in clone
          const front = clonedDoc.getElementById('pdf-id-card-front');
          const back = clonedDoc.getElementById('pdf-id-card-back');
          if (front) front.style.transform = 'none';
          if (back) back.style.transform = 'none';
          
          // Workaround for html2canvas oklch crash
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
             const htmlEl = el as HTMLElement;
             if (htmlEl && htmlEl.className && typeof htmlEl.className === 'string') {
                htmlEl.className = htmlEl.className.replace(/shadow-[a-zA-Z0-9_-]+/g, '');
                htmlEl.className = htmlEl.className.replace(/bg-gradient-[a-zA-Z0-9_-]+/g, '');
             }
          });
        }
      };

      // Capture Front Side
      const canvasFront = await html2canvas(frontCardRef.current, options);
      // Capture Back Side
      const canvasBack = await html2canvas(backCardRef.current, options);

      const imgDataFront = canvasFront.toDataURL('image/png', 1.0);
      const imgDataBack = canvasBack.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 450]
      });

      // Page 1: Front
      pdf.setPage(1);
      pdf.addImage(imgDataFront, 'PNG', 0, 0, 800, 450);
      
      // Page 2: Back
      pdf.addPage([800, 450], 'landscape');
      pdf.setPage(2);
      pdf.addImage(imgDataBack, 'PNG', 0, 0, 800, 450);

      pdf.save(`${studentName.split(' ')[0]}_VidyaNation_ID.pdf`);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('Error generating PDF: ' + (err.message || 'Unknown error') + '. Please ensure all images are loaded.');
    } finally {
      setIsDownloading(false);
    }
  };

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
                  ref={frontCardRef}
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
                <StudentIDCardBack 
                  ref={backCardRef}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center mt-auto">
            <button
              onClick={downloadCard}
              disabled={isDownloading}
              className="w-full sm:w-[380px] py-4.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-2xl font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <FileText className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              )}
              {isDownloading ? 'Capturing Sides...' : 'Download 2-Side HD ID Card'}
            </button>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center sm:text-left">
              High Definition • 2 Pages • A4/Landscape PDF
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
