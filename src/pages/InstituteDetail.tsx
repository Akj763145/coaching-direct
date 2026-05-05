import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Map, Calendar, Clock, DollarSign, User, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { DetailSkeleton } from '../components/Skeleton';

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
      className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 md:space-y-10 pb-20"
    >
      
      {/* Header Profile */}
      <div className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-apple-border/40 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-apple-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-all duration-1000"></div>
        {institute.logo ? (
          <motion.img layoutId={`logo-${institute.id}`} src={institute.logo} alt={institute.name} className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[20px] md:rounded-[28px] object-contain bg-apple-gray shadow-sm border border-apple-border/50 z-10 p-2" />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[20px] md:rounded-[28px] bg-apple-gray border border-apple-border/50 text-apple-blue flex items-center justify-center font-semibold text-3xl sm:text-5xl shrink-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            {institute.name.charAt(0)}
          </div>
        )}
        
        <div className="flex-1 z-10 md:pt-2">
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-apple-text tracking-tight leading-tight break-words">{institute.name}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-3 mt-5 md:mt-6 text-[13px] md:text-[15px] font-medium text-apple-text-muted">
            {institute.address && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60"/> {institute.address}</div>}
            {institute.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60"/> {institute.phone}</div>}
            {institute.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60"/> {institute.email}</div>}
            {institute.website && <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60"/> <a href={institute.website} target="_blank" className="text-apple-blue hover:text-apple-blue-hover hover:underline transition-colors">Website</a></div>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content: Batches */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-apple-text mb-6 flex items-center gap-2 tracking-tight">
              <BookOpen className="w-5 h-5 text-apple-blue" />
              Available Batches
            </h2>
            <div className="space-y-4">
              {institute.batches && institute.batches.length > 0 ? institute.batches.map((batch: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  key={batch.id} 
                  className="bg-white p-4 sm:p-6 md:p-8 rounded-[22px] md:rounded-[24px] border border-apple-border/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-apple-border/80 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5 flex-col sm:flex-row gap-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-apple-text tracking-tight break-words">{batch.batch_name}</h3>
                      <p className="text-apple-blue font-medium text-[13px] px-2.5 py-1 bg-apple-blue/5 border border-apple-blue/10 rounded-lg inline-block mt-3">{batch.subject}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-apple-gray px-3 py-1.5 rounded-full border border-apple-border/50">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-apple-border/30">
                        {batch.teacher_image ? <img src={batch.teacher_image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-medium text-xs text-apple-text-muted">{batch.teacher_name.charAt(0)}</div>}
                      </div>
                      <span className="text-[14px] font-medium text-apple-text pr-1">{batch.teacher_name}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-6 pt-6 border-t border-apple-border/30">
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px] text-apple-text">
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-apple-text-muted uppercase tracking-widest font-medium"><Calendar className="w-3.5 h-3.5" /> Start</div> 
                      <span className="font-semibold">{batch.start_date || 'TBA'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px] text-apple-text">
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-apple-text-muted uppercase tracking-widest font-medium"><Clock className="w-3.5 h-3.5" /> Timing</div> 
                      <span className="font-semibold">{batch.batch_timing || 'TBA'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px] text-apple-text">
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-apple-text-muted uppercase tracking-widest font-medium">Duration</div> 
                      <span className="font-semibold">{batch.batch_duration || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] md:text-[14px] text-apple-text">
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-apple-text-muted uppercase tracking-widest font-medium"><DollarSign className="w-3.5 h-3.5" /> Fee</div> 
                      <span className="font-semibold">{batch.fee_structure || 'Contact for fee'}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-apple-gray p-8 rounded-[24px] border border-apple-border/30 text-center text-apple-text-muted shadow-inner">
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
              className="bg-white rounded-[24px] border border-apple-border/40 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
              <div className="p-5 border-b border-apple-border/30 font-semibold text-apple-text flex items-center gap-2.5">
                <svg className="w-5 h-5 text-red-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                Demo Class
              </div>
              <div className="aspect-video w-full bg-apple-text">
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
              className="bg-white rounded-[24px] border border-apple-border/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
               <h3 className="font-semibold text-apple-text mb-3 flex items-center gap-2"><Map className="w-5 h-5 text-apple-blue"/> Location</h3>
               <p className="text-[14px] text-apple-text-muted mb-5 leading-relaxed">{institute.location}</p>
               {institute.location && (institute.location.includes('http') || institute.location.includes('iframe')) ? (
                 <div className="aspect-square w-full overflow-hidden rounded-2xl bg-apple-gray border border-apple-border/30 relative">
                   <div 
                     className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" 
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
