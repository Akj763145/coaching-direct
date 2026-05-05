import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, IndianRupee, BookOpen, ChevronDown, ChevronUp, MessageCircle, ArrowLeft, Star, FileText, PlayCircle } from 'lucide-react';
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
  batch_timing: "04:00 PM - 07:00 PM",
  batch_duration: "12 months",
  fee_structure: "85000",
  institute_name: "Aakash Institute",
  institute_id: "inst-1",
  teacher_name: "Dr. Anjali Sharma",
  teacher_image: "https://i.pravatar.cc/150?u=anjali",
  status: "running",
  teacher_qualifications: "Ph.D. in Biology, AIIMS Delhi",
  teacher_bio: "Dr. Sharma has over 15 years of experience coaching medical aspirants. Her unique teaching methodology simplifies complex concepts and helps students master the NEET syllabus with confidence.",
  syllabus: [
    { id: 1, title: "Module 1: Physics Fundamentals", content: "Kinematics, Laws of Motion, Work, Energy, and Power, System of Particles and Rotational Motion." },
    { id: 2, title: "Module 2: Chemistry Basics", content: "Some Basic Concepts of Chemistry, Structure of Atom, Classification of Elements and Periodicity in Properties." },
    { id: 3, title: "Module 3: Biology - Botany", content: "Diversity in Living World, Structural Organisation in Plants and Animals, Cell Structure and Function." },
    { id: 4, title: "Module 4: Biology - Zoology", content: "Human Physiology, Reproduction, Genetics and Evolution, Biology and Human Welfare." }
  ]
};

const TeacherAvatar = ({ src, name }: { src?: string; name: string }) => {
  const [error, setError] = useState(false);
  const initials = (name || '?').substring(0, 2).toUpperCase();
  return (
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xl md:text-2xl shrink-0 shadow-sm border-2 border-white dark:border-slate-800">
      {src && !error ? (
        <img src={src} alt={name || 'Teacher'} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        initials
      )}
    </div>
  );
};

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  
  // Demo Booking State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', phone: '' });
  const [demoStatus, setDemoStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    // Actually fetch the real batch instead of mock if we have a database setup,
    // but for now we'll simulate or use the fetched data if provided by parent/api.
    const fetchBatch = async () => {
      try {
        const res = await fetch(`/api/public/batches/${id}`);
        if(res.ok) {
          const data = await res.json();
          // parse curriculum if string
          if(typeof data.curriculum === 'string') data.curriculum = JSON.parse(data.curriculum);
          setBatch(data);
        } else {
          setBatch(MOCK_BATCH); // fallback to mock if api not ready
        }
      } catch {
        setBatch(MOCK_BATCH);
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleBookDemo = () => {
    setIsDemoModalOpen(true);
  };

  const submitDemoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoStatus('submitting');
    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institute_id: batch.institute_id,
          student_name: demoForm.name,
          phone: demoForm.phone,
          target_batch: batch.batch_name
        })
      });
      if (res.ok) {
        setDemoStatus('success');
        setTimeout(() => {
          setIsDemoModalOpen(false);
          setDemoStatus('idle');
          setDemoForm({ name: '', phone: '' });
        }, 2500);
      } else {
        setDemoStatus('idle');
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      setDemoStatus('idle');
      alert('Error submitting request.');
    }
  };

  if (loading) return (
    <div className="p-6 md:p-10">
      <DetailSkeleton />
    </div>
  );

  if (!batch) return (
    <div className="p-10 text-center text-slate-500 dark:text-slate-400">Batch not found</div>
  );

  return (
    <div className="relative min-h-screen pb-24 md:pb-12 bg-apple-gray dark:bg-slate-950">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Hero & Summary Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                  {batch.subject.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string) => (
                    <span key={sub} className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold capitalize tracking-wide shadow-sm">
                      {formatAcronyms(sub)}
                    </span>
                  ))}
                  {batch.status === 'running' && (
                    <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
                      Running
                    </span>
                  )}
                  {batch.status === 'not_running' && (
                    <span className="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
                      Not Running
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 capitalize">
                  {formatAcronyms(batch.batch_name)}
                </h1>
                
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base flex items-center gap-2 mb-8">
                  by <a href={`/institute/${batch.institute_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{batch.institute_name}</a>
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Calendar className="w-5 h-5 text-indigo-500 mb-2" />
                    <div className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1">Start Date</div>
                    <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">{formatDate(batch.start_date)}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Clock className="w-5 h-5 text-orange-500 mb-2" />
                    <div className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1">Timing</div>
                    <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white leading-tight">{batch.batch_timing || 'TBA'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <PlayCircle className="w-5 h-5 text-emerald-500 mb-2" />
                    <div className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1">Duration</div>
                    <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">{batch.batch_duration || 'Not specified'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <IndianRupee className="w-5 h-5 text-blue-500 mb-2" />
                    <div className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1">Total Fee</div>
                    <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">{formatFee(batch.fee_structure)}</div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Teacher Profile Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-shadow">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> 
                  Meet Your Teacher
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <TeacherAvatar src={batch.teacher_image} name={batch.teacher_name} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {batch.teacher_name}
                    </h3>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3 bg-emerald-50 dark:bg-emerald-500/10 inline-block px-3 py-1 rounded-full">
                      {batch.teacher_qualifications}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {batch.teacher_bio}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Curriculum / Syllabus Accordion */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  What You'll Learn
                </h2>
                
                <div className="space-y-3">
                  {batch.syllabus?.map((module: any, idx: number) => (
                    <div key={module.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/20">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white pr-4">
                          {module.title}
                        </span>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          {expandedModules[module.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedModules[module.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 md:p-5 pt-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 mt-2">
                              {module.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  {!batch.syllabus?.length && (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      Detailed syllabus not uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

          </div>

          {/* Desktop Sidebar (Sticky) */}
          <div className="hidden md:block">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-xl shadow-blue-900/5 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                Enroll in {formatAcronyms(batch.batch_name)}
              </h3>
              
              <button 
                onClick={handleBookDemo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[48px] rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                Book Free Demo
              </button>
              
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I want to know more about the ${batch.batch_name} batch at ${batch.institute_name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white min-h-[48px] rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>

              <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Seats are filling fast. Secure your spot today!
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)] z-40 flex items-center gap-3">
        <a
          href={`https://wa.me/${batch.whatsapp_number || '919876543210'}?text=${encodeURIComponent(`Hi, I want to know more about the ${batch.batch_name} batch at ${batch.institute_name}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
        </a>
        <button 
          onClick={handleBookDemo}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-[48px] rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center"
        >
          Book Free Demo
        </button>
      </div>

      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDemoModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[24px] p-6 shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
            >
              <button 
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              {demoStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h3>
                  <p className="text-slate-500 dark:text-slate-400">The institute will contact you shortly to schedule your demo.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Book Free Demo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your details to request a demo call.</p>
                  
                  <form onSubmit={submitDemoForm} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Full Name</label>
                      <input 
                        required 
                        type="text" 
                        value={demoForm.name} 
                        onChange={e => setDemoForm({...demoForm, name: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">WhatsApp / Phone Number</label>
                      <input 
                        required 
                        type="tel" 
                        value={demoForm.phone} 
                        onChange={e => setDemoForm({...demoForm, phone: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" 
                        placeholder="+91 98765 43210" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={demoStatus === 'submitting'}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                      {demoStatus === 'submitting' ? 'Submitting...' : 'Request Demo'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
