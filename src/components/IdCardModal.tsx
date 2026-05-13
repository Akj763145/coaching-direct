import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { StudentIDCard } from './StudentIDCard';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any;
  studentName: string;
  studentPhone: string;
  classNameLabel?: string;
  instituteName?: string;
}

export function IdCardModal({ 
  isOpen, onClose, enrollment, 
  studentName, studentPhone, classNameLabel, 
  instituteName 
}: IdCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${studentName.replace(/\s+/g, '_')}_ID.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !enrollment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-zinc-900/50 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center border border-white/10"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-black/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 mt-4">
            <StudentIDCard 
              ref={cardRef}
              studentName={studentName || 'Student'}
              studentPhone={studentPhone || 'N/A'}
              batchName={enrollment.batches?.name || enrollment.batches?.batch_name || 'N/A'}
              className={classNameLabel || 'Student'}
              enrollmentDate={new Date(enrollment.enrollment_date || enrollment.created_at || Date.now()).toLocaleDateString()}
              instituteName={instituteName || 'Coaching Direct'}
            />
          </div>

          <button
            onClick={downloadCard}
            disabled={isDownloading}
            className="w-[350px] py-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            )}
            {isDownloading ? 'Generating...' : 'Download ID Card'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
