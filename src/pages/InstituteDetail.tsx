import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Map, Calendar, Clock, IndianRupee, User, BookOpen, MessageCircle, X, Star, Bell, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailSkeleton } from '../components/Skeleton';

const formatAcronyms = (text: string) => {
  if (!text) return '';
  const acronyms = ['neet', 'jee', 'iit', 'cbse', 'icse', 'upsc', 'ssc', 'bpsc'];
  let formatted = text;
  acronyms.forEach(acronym => {
    const regex = new RegExp(`\\b${acronym}\\b`, 'gi');
    formatted = formatted.replace(regex, acronym.toUpperCase());
  });
  return formatted;
};

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === 'TBA') return 'TBA';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

const formatDuration = (val: string) => {
  if (!val || val === '-') return '-';
  let s = val.replace(/(\d+)([a-zA-Z]+)/g, '$1 $2');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatFee = (val: string) => {
  if (!val || val.toLowerCase().includes('contact')) return 'Contact for fee';
  let formatted = val.replace(/Rs\.?|rs\.?|RS\.?|\$|INR/gi, '₹').trim();
  if (!formatted.includes('₹') && formatted.match(/\d/)) {
    formatted = '₹ ' + formatted; // Add Rupee if missing
  }
  formatted = formatted.replace(/₹\s*(\d)/g, '₹$1'); // e.g. ₹500
  formatted = formatted.replace(/\/?\s*(month|year|hr|hour|day|class)/gi, ' / $1');
  formatted = formatted.replace(/\/ \//g, '/'); // cleanup
  return formatAcronyms(formatted.replace(/\b\w/g, c => c.toUpperCase())); // capitalize words
};

const TeacherAvatar = ({ src, name }: { src?: string, name?: string }) => {
  const [error, setError] = useState(false);
  const initials = (name || '?').substring(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
      {src && !error ? (
        <img src={src} alt={name || 'Teacher'} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        initials
      )}
    </div>
  );
};

const MOCK_REVIEWS = [
  { id: 1, name: "Rahul Verma", rating: 5, text: "Excellent faculty and great study material. Really helped me improve my score!" },
  { id: 2, name: "Sneha Sharma", rating: 4, text: "Good institute overall. The test series is very tough but relevant." },
  { id: 3, name: "Aman Gupta", rating: 5, text: "The doubt clearing sessions are amazing. Teachers are very supportive." }
];

const MOCK_NOTICES = [
  { id: 1, date: "May 5, 2026", title: "New Crash Course", message: "New NEET Crash Course starting next Monday!" },
  { id: 2, date: "May 2, 2026", title: "Mock Test Results", message: "Results for the weekend mock test are now available." }
];

export default function InstituteDetail() {
  const { id } = useParams();
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchInstitute();
  }, [id]);

  const fetchInstitute = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/institutes/${id}`);
      if (res.ok) {
          setInstitute(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lead submitted:', { name, phone, batchId: selectedBatch?.id, instituteId: institute?.id });
    window.alert('Request sent to institute!');
    setModalOpen(false);
    setName('');
    setPhone('');
  };

  if (loading) return (
    <div className="p-6 md:p-10">
      <DetailSkeleton />
    </div>
  );
  if (!institute) return <div className="p-12 text-center text-apple-text-muted font-medium">Institute not found</div>;

  // Convert youtube watch URL to embed URL for iframe
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getEmbedUrl(institute.demo_video_url);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 md:space-y-10 pb-32"
    >
      
      {/* Header Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all duration-300">
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm mix-blend-overlay"></div>
        </div>

        <div className="px-6 md:px-10 pb-6 md:pb-10 pt-4 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative">
          <div className="-mt-16 sm:-mt-20 md:-mt-24 relative z-10 p-1.5 bg-white dark:bg-slate-900 rounded-[22px] md:rounded-[30px] shadow-md lg:shadow-lg flex-shrink-0 border border-slate-100 dark:border-slate-800">
             {institute.logo ? (
              <motion.img layoutId={`logo-${institute.id}`} src={institute.logo} alt={institute.name} className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[16px] md:rounded-[24px] object-contain bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 z-10 mix-blend-darken dark:mix-blend-screen" />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[16px] md:rounded-[24px] bg-indigo-100 dark:bg-indigo-900/40 border border-slate-100 dark:border-slate-700 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-3xl sm:text-5xl z-10 capitalize">
                {institute.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 z-10 pt-2 min-w-0 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight break-words capitalize">{formatAcronyms(institute.name)}</h1>
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">4.8 (120 Reviews)</span>
            </div>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-6 mt-3 md:mt-4 text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 w-full">
              {institute.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"/> <span className="truncate capitalize">{formatAcronyms(institute.address)}</span></div>}
              {institute.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"/> <span className="truncate">{institute.phone}</span></div>}
              {institute.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"/> <span className="truncate">{institute.email}</span></div>}
              {institute.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"/> <a href={institute.website} target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors truncate">Website</a></div>}
            </div>
            
            {institute.phone && (
              <div className="mt-6 md:mt-8">
                <a
                  href={`https://wa.me/${institute.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${institute.name}, I found your profile on Coaching Direct and would like to know more about your classes.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer w-full md:w-auto shadow-sm min-h-[44px]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content: Batches */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Available Batches
            </h2>
            <div className="space-y-4">
              {institute.batches && institute.batches.length > 0 ? institute.batches.map((batch: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  key={batch.id} 
                  className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col mb-5 relative">
                    {(() => {
                        const seatsLeft = (batch.id.toString().length % 15) || 5;
                        if (seatsLeft < 10) {
                          return (
                            <div className="absolute top-0 right-0 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider animate-[pulse_2s_ease-in-out_infinite] flex items-center gap-1 shadow-sm">
                              🔥 Only {seatsLeft} Seats Left
                            </div>
                          );
                        }
                        return null;
                    })()}
                    <div className="min-w-0 flex-1 w-full text-left pr-32 md:pr-40">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={`/batch/${batch.id}`} className="hover:underline block">
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight break-words capitalize">{formatAcronyms(batch.batch_name)}</h3>
                        </a>
                        {batch.status === 'running' 
                          ? <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full inline-block">Running</span>
                          : batch.status === 'not_running' 
                          ? <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full inline-block">Not Running</span>
                          : null
                        }
                      </div>
                      <div className="mt-2">
                        {batch.subject?.split(',').map((s:string) => s.trim()).filter(Boolean).map((sub: string) => (
                           <span key={sub} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] md:text-xs font-medium inline-block mt-1 mr-1 capitalize">
                             {formatAcronyms(sub)}
                           </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <TeacherAvatar src={batch.teacher_image} name={batch.teacher_name} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words line-clamp-1 capitalize">{batch.teacher_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium"><Calendar className="w-3.5 h-3.5" /> Start</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{formatDate(batch.start_date)}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium"><Clock className="w-3.5 h-3.5" /> Timing</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{batch.batch_timing || 'TBA'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Duration</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{formatDuration(batch.batch_duration)}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium"><IndianRupee className="w-3.5 h-3.5" /> Fee</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{formatFee(batch.fee_structure)}</span>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <a
                      href={`/batch/${batch.id}`}
                      className="inline-flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 min-h-[44px] px-6 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      View Details
                    </a>
                    <a
                      href="/bbb.pdf"
                      download="bbb.pdf"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[44px] px-6 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      Syllabus
                    </a>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatch(batch);
                        setModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] px-6 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      Book Free Demo
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 shadow-sm">
                  No active batches listed right now.
                </div>
              )}
            </div>
          </section>

          <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Student Reviews
              </h2>
              <button 
                onClick={() => console.log("Open review modal")}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 px-4 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] flex items-center"
              >
                Write a Review
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {MOCK_REVIEWS.map((review, i) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {review.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{review.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200 dark:fill-slate-700 dark:text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">"{review.text}"</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Demo Video & Location */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border-l-4 border-l-indigo-500 border-t border-b border-r border-slate-100 dark:border-slate-800 p-6 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              Latest Updates
            </h3>
            <div className="space-y-4">
              {MOCK_NOTICES.map(notice => (
                <div key={notice.id} className="relative pl-4 border-l border-indigo-200/60 dark:border-indigo-800/60 pb-4 last:pb-0">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-1 top-1.5 outline outline-4 outline-indigo-50/50 dark:outline-indigo-900/50"></div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">{notice.date}</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{notice.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{notice.message}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {embedUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                <svg className="w-5 h-5 text-red-500 drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                Demo Class
              </div>
              <div className="aspect-video w-full object-cover bg-slate-900">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={embedUrl} 
                  title="Demo Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          )}

          {institute.location && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
               <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Map className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"/> Location</h3>
               <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed capitalize">
                 {institute.address || (institute.location && !institute.location.includes('<iframe') ? institute.location : '')}
               </p>
               {institute.location && (institute.location.includes('http') || institute.location.includes('iframe')) ? (
                 <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative object-cover">
                   <div 
                     className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:object-cover" 
                     dangerouslySetInnerHTML={{
                       __html: institute.location.startsWith('<iframe') 
                         ? institute.location.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"') 
                         : `<iframe width="100%" height="100%" src="${institute.location}" frameborder="0"></iframe>`
                     }}
                   />
                 </div>
               ) : null}
            </motion.div>
          )}
        </div>
        
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Book Free Demo</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 md:p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Interested in <span className="font-semibold text-slate-700 dark:text-slate-200">{formatAcronyms(selectedBatch?.batch_name || '')}</span>? Leave your details below and the institute will contact you soon.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 min-h-[44px]"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
