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
    <div className="relative min-h-screen pb-32 bg-[#F5F5F7] dark:bg-[#000000]">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Listings
        </motion.button>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {batch.subject.split(',').map((s: string) => (
              <span key={s} className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800">
                {formatAcronyms(s.trim())}
              </span>
            ))}
            {batch.status === 'running' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                Running
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            {formatAcronyms(batch.batch_name)}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            by <span className="text-blue-600 dark:text-blue-400">{batch.institute_name}</span>
          </p>
        </motion.div>

        {/* Bento Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 mb-16">
          {/* Section A: Fee (Primary) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 md:row-span-2 bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-6 right-6">
              <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-orange-500/20">
                Special Discount
              </span>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Total Course Fee</h3>
              <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                {formatFee(batch.fee_structure)}
              </div>
            </div>
            <p className="text-slate-400 dark:text-slate-600 text-xs font-semibold mt-8">Inclusive of all taxes & study material</p>
          </motion.div>

          {/* Section B: Timing & Mode */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm"
          >
            <Clock className="w-5 h-5 text-orange-500 mb-4" />
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Timing</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{batch.batch_timing}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm"
          >
            <Monitor className="w-5 h-5 text-blue-500 mb-4" />
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mode</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{batch.mode || 'Offline'}</div>
          </motion.div>

          {/* Section C: Medium & Board */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm"
          >
            <BookOpen className="w-5 h-5 text-indigo-500 mb-4" />
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Medium</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{batch.medium || 'English'}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm"
          >
            <CheckSquare className="w-5 h-5 text-emerald-500 mb-4" />
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Board</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{batch.board || 'CBSE / State'}</div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Journey & Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Dynamic Syllabus Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Learning Journey</h2>
                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  {batch.batch_duration}
                </div>
              </div>
              
              <div className="relative space-y-12 pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800"></div>
                
                {batch.syllabus?.map((module: any, i: number) => (
                  <motion.div 
                    key={module.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex gap-8"
                  >
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    
                    <div className="flex-1 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          {module.title}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {module.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Specialist / Team Profile */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sticky top-12 space-y-6"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Faculty Team
              </h3>

              {(batch.teachers || [{
                id: 1,
                name: batch.teacher_name,
                image: batch.teacher_image,
                specialization: batch.specialization,
                qualifications: batch.teacher_qualifications,
                bio: batch.teacher_bio,
                experience: batch.experience
              }]).map((teacher: any, idx: number) => (
                <motion.div 
                  key={teacher.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-[40px] p-6 border border-slate-100 dark:border-white/5 shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <TeacherAvatar src={teacher.image || teacher.image_url} name={teacher.name} />
                    
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">
                        {teacher.name}
                      </h3>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                        {teacher.specialization || teacher.subject}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mb-4">
                         <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                           {teacher.experience || '10+ Yrs'}
                         </span>
                         <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                           Verified
                         </span>
                      </div>
                    </div>
                    
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center italic mb-4 line-clamp-3">
                      "{teacher.bio}"
                    </div>
                    
                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Background</div>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{teacher.qualifications}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Interactive CTA */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/5 p-3 rounded-[32px] shadow-2xl flex items-center gap-3">
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I want to know more about the ${batch.batch_name} batch at ${batch.institute_name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
          <button 
            className="flex-[1.5] bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
          >
            Enroll Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
