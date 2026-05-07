import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, IndianRupee, BookOpen, ChevronDown, ChevronUp, MessageCircle, ArrowLeft, Star, FileText, PlayCircle, X, CheckSquare, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailSkeleton } from '../components/Skeleton';

const formatAcronyms = (text: string) => {
  if (!text) return '';
  return text.replace(/\b(cbse|icse|neet|jee|ui|ux|ssc|upsc|nda|cat|mat|gmat|clat)\b/gi, match => match.toUpperCase());
};

const formatFee = (fee: string | number) => {
  if (!fee) return 'Contact for fee';
  const numMatches = String(fee).match(/\d+/g);
  if (numMatches) {
    const num = parseInt(numMatches.join(''), 10);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  }
  return fee;
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'TBA';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

const MOCK_BATCH = {
  id: "b1",
  batch_name: "Target NEET 2026",
  subject: "Physics, Chemistry, Biology",
  start_date: "2026-06-01",
  batch_timing: "04:00 PM - 06:00 PM",
  batch_duration: "12 months",
  fee_structure: "85000",
  institute_name: "Future Will Academy",
  institute_id: "inst-1",
  teacher_name: "Avnish Sir",
  teacher_image: "https://i.pravatar.cc/150?u=avnish",
  status: "running",
  mode: "Offline",
  medium: "English",
  board: "CBSE / State",
  specialization: "Physics Mastery",
  experience: "12+ Years",
  teacher_qualifications: "M.Tech, IIT Roorkee",
  teacher_bio: "Avnish Sir is a technical specialist in competitive Physics.",
  teachers: [
    {
      id: 1,
      name: "Avnish Sir",
      image: "https://i.pravatar.cc/150?u=avnish",
      specialization: "Physics Specialist",
      qualifications: "M.Tech, IIT Roorkee",
      bio: "12+ years experience in JEE/NEET Physics.",
      experience: "12+ Years"
    },
    {
      id: 2,
      name: "Dr. Smita",
      image: "https://i.pravatar.cc/150?u=smita",
      specialization: "Biology Expert",
      qualifications: "Ph.D. in Botany",
      bio: "Expert in Plant Physiology and Genetics.",
      experience: "8+ Years"
    }
  ],
  syllabus: [
    { id: 1, title: "Module 1: Mechanics & Heat", content: "Mastering Kinematics, Dynamics, and Thermal Physics through high-yield problem solving." },
    { id: 2, title: "Module 2: Electromagnetism", content: "Deep dive into Electrostatics, Magnetic effects of current, and Electromagnetic Induction." },
    { id: 3, title: "Module 3: Optics & Modern Physics", content: "Understanding Wave Optics, Dual nature of matter, and Atomic structure." },
    { id: 4, title: "Module 4: Revision & Testing", content: "Intensive 3-month mock test series and previous year paper analysis." }
  ]
};

const TeacherAvatar = ({ src, name }: { src?: string; name: string }) => {
  const [error, setError] = useState(false);
  const initials = (name || '?').substring(0, 2).toUpperCase();
  return (
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
      {src && !error ? (
        <img src={src} alt={name || 'Teacher'} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-slate-400">
          {initials}
        </div>
      )}
    </div>
  );
};

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  
  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await fetch(`/api/public/batches/${id}`);
        if(res.ok) {
          const data = await res.json();
          if(typeof data.curriculum === 'string') data.curriculum = JSON.parse(data.curriculum);
          setBatch(data);
        } else {
          setBatch(MOCK_BATCH);
        }
      } catch {
        setBatch(MOCK_BATCH);
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  if (loading) return (
    <div className="p-6 md:p-10">
      <DetailSkeleton />
    </div>
  );

  if (!batch) return (
    <div className="p-10 text-center text-slate-500 dark:text-slate-400">Batch not found</div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (batch?.institute_id || batch?.id) {
              const instId = batch.institute_id || id;
              navigate(`/institute/${instId}?tab=batches`);
            } else {
              navigate(-1);
            }
          }} 
          className="p-2 -ml-2 rounded-full hover:bg-white dark:hover:bg-slate-900 transition-colors text-slate-500 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </motion.button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* 1. Hero Header (No Cards) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {batch.subject.split(',').map((s: string) => (
              <span key={s} className="px-2.5 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                {formatAcronyms(s.trim())}
              </span>
            ))}
            {batch.status === 'running' && (
              <span className="px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/30">
                Running
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight capitalize leading-tight">
            {formatAcronyms(batch.batch_name)}
          </h1>
          <button className="mt-3 text-blue-600 dark:text-blue-400 font-semibold text-base hover:underline transition-all">
            by {batch.institute_name}
          </button>
        </motion.div>

        {/* 2. Bento Box Logistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Timing', value: batch.batch_timing, icon: Clock, color: 'text-orange-500' },
            { label: 'Mode', value: batch.mode || 'Offline', icon: Monitor, color: 'text-blue-500' },
            { label: 'Board', value: batch.board || 'CBSE', icon: CheckSquare, color: 'text-emerald-500' },
            { label: 'Duration', value: batch.batch_duration || '12 Months', icon: Calendar, color: 'text-indigo-500' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <item.icon className={`w-4 h-4 ${item.color} mb-3`} />
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{item.label}</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.value}</div>
            </motion.div>
          ))}
        </div>

        {/* 3. Premium Price Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-blue-50 dark:border-blue-900/30 shadow-xl shadow-blue-500/5 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0">
             <div className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
               Special Discount Included
             </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Course Fee</div>
              <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                {formatFee(batch.fee_structure)}
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                Inclusive of all taxes & study material
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Payment Options</div>
              <div className="flex gap-2 justify-end">
                {['EMI', 'UPI', 'CARD'].map(opt => (
                  <span key={opt} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 text-[8px] font-black text-slate-500">{opt}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. Compact Faculty Section */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Expert Faculty</h3>
          <div className="grid gap-3">
            {(batch.teachers || [{
              id: 1,
              name: batch.teacher_name,
              image: batch.teacher_image,
              specialization: batch.specialization,
              experience: batch.experience || '10+ Yrs'
            }]).map((teacher: any, idx: number) => (
              <motion.div 
                key={teacher.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-3 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {teacher.image || teacher.image_url ? (
                    <img src={teacher.image || teacher.image_url} alt={teacher.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-400">{teacher.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-slate-900 dark:text-white capitalize truncate">{teacher.name}</h4>
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 truncate">{teacher.specialization || teacher.subject}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase border border-slate-100 dark:border-slate-700">{teacher.experience || '10+ Yrs'}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-0.5">
                      <CheckSquare className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>
                </div>
                {teacher.bio && (
                  <p className="hidden md:block text-[10px] text-slate-400 italic max-w-[200px] line-clamp-2 px-4 border-l border-slate-100 dark:border-slate-800">
                    "{teacher.bio}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 5. Learning Journey (Full Modules) */}
        <div className="mb-20">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
            Learning Journey
            <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></span>
          </h3>
          <div className="relative space-y-4">
            {/* The Vertical Thread */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800/50"></div>
            
            {batch.syllabus?.map((item: any, idx: number) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex gap-6 group"
              >
                {/* Node */}
                <div className="relative z-10 w-10 h-10 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950 group-hover:scale-125 transition-transform"></div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</h4>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Phase {idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-11">
                    {item.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Sticky Action Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/50 px-6 py-4 pb-safe flex gap-3 z-50"
      >
        <a
          href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in the ${batch.batch_name} batch.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-sm h-12 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
        <button 
          className="flex-[2] bg-blue-600 text-white rounded-2xl font-bold text-sm h-12 shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Enroll Now
        </button>
      </motion.div>
    </div>
  );
}
