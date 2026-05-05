import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Map, Calendar, Clock, IndianRupee, User, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
      {src && !error ? (
        <img src={src} alt={name || 'Teacher'} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        initials
      )}
    </div>
  );
};

export default function InstituteDetail() {
  const { id } = useParams();
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 relative overflow-hidden transition-all duration-300">
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm mix-blend-overlay"></div>
        </div>

        <div className="px-6 md:px-10 pb-6 md:pb-10 pt-4 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative">
          <div className="-mt-16 sm:-mt-20 md:-mt-24 relative z-10 p-1.5 bg-white rounded-[22px] md:rounded-[30px] shadow-md lg:shadow-lg flex-shrink-0">
             {institute.logo ? (
              <motion.img layoutId={`logo-${institute.id}`} src={institute.logo} alt={institute.name} className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[16px] md:rounded-[24px] object-contain bg-white border border-slate-100 z-10" />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[16px] md:rounded-[24px] bg-indigo-100 border border-slate-100 text-indigo-700 flex items-center justify-center font-bold text-3xl sm:text-5xl z-10 capitalize">
                {institute.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 z-10 pt-2 min-w-0 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-slate-900 tracking-tight leading-tight break-words capitalize">{formatAcronyms(institute.name)}</h1>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-6 mt-3 md:mt-4 text-sm md:text-base font-medium text-slate-500 w-full">
              {institute.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600 shrink-0"/> <span className="truncate capitalize">{formatAcronyms(institute.address)}</span></div>}
              {institute.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600 shrink-0"/> <span className="truncate">{institute.phone}</span></div>}
              {institute.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600 shrink-0"/> <span className="truncate">{institute.email}</span></div>}
              {institute.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600 shrink-0"/> <a href={institute.website} target="_blank" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors truncate">Website</a></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content: Batches */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Available Batches
            </h2>
            <div className="space-y-4">
              {institute.batches && institute.batches.length > 0 ? institute.batches.map((batch: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  key={batch.id} 
                  className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col mb-5">
                    <div className="min-w-0 flex-1 w-full text-left">
                      <h3 className="text-xl font-semibold text-slate-800 tracking-tight break-words capitalize">{formatAcronyms(batch.batch_name)}</h3>
                      <div className="mt-2">
                        {batch.subject?.split(',').map((s:string) => s.trim()).filter(Boolean).map((sub: string) => (
                           <span key={sub} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] md:text-xs font-medium inline-block mt-1 mr-1 capitalize">
                             {formatAcronyms(sub)}
                           </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <TeacherAvatar src={batch.teacher_image} name={batch.teacher_name} />
                        <span className="text-sm font-medium text-slate-700 break-words line-clamp-1 capitalize">{batch.teacher_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-6 pt-6 border-t border-slate-200">
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium"><Calendar className="w-3.5 h-3.5" /> Start</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 capitalize">{formatDate(batch.start_date)}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium"><Clock className="w-3.5 h-3.5" /> Timing</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 capitalize">{batch.batch_timing || 'TBA'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Duration</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 capitalize">{formatDuration(batch.batch_duration)}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium"><IndianRupee className="w-3.5 h-3.5" /> Fee</div> 
                      <span className="text-xs md:text-sm font-semibold text-slate-800 capitalize">{formatFee(batch.fee_structure)}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
                  No active batches listed right now.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Demo Video & Location */}
        <div className="space-y-6">
          {embedUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-5 border-b border-gray-100 font-semibold text-slate-900 flex items-center gap-2.5">
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
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
               <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Map className="w-5 h-5 text-blue-600 shrink-0"/> Location</h3>
               <p className="text-[14px] text-slate-500 mb-5 leading-relaxed capitalize">
                 {institute.address || (institute.location && !institute.location.includes('<iframe') ? institute.location : '')}
               </p>
               {institute.location && (institute.location.includes('http') || institute.location.includes('iframe')) ? (
                 <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-200 relative object-cover">
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
    </motion.div>
  );
}
