import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Map, Calendar, Clock, DollarSign, User, BookOpen } from 'lucide-react';

export default function InstituteDetail() {
  const { id } = useParams();
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitute();
  }, [id]);

  const fetchInstitute = async () => {
    const res = await fetch(`/api/public/institutes/${id}`);
    if (res.ok) {
        setInstitute(await res.json());
    }
    setLoading(false);
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading...</div>;
  if (!institute) return <div className="p-12 text-center text-slate-500 font-medium">Institute not found</div>;

  // Convert youtube watch URL to embed URL for iframe
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getEmbedUrl(institute.demo_video_url);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
      
      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        {institute.logo ? (
          <img src={institute.logo} alt={institute.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover bg-white shadow-sm border border-slate-100 z-10" />
        ) : (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-5xl shrink-0 z-10">
            {institute.name.charAt(0)}
          </div>
        )}
        
        <div className="flex-1 z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{institute.name}</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-slate-600">
            {institute.address && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400"/> {institute.address}</div>}
            {institute.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400"/> {institute.phone}</div>}
            {institute.email && <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400"/> {institute.email}</div>}
            {institute.website && <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-slate-400"/> <a href={institute.website} target="_blank" className="text-indigo-600 hover:underline">Website</a></div>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content: Batches */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Available Batches
            </h2>
            <div className="space-y-4">
              {institute.batches && institute.batches.length > 0 ? institute.batches.map((batch: any) => (
                <div key={batch.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{batch.batch_name}</h3>
                      <p className="text-indigo-600 font-medium text-sm px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded inline-block mt-2">{batch.subject}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white">
                        {batch.teacher_image ? <img src={batch.teacher_image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400">{batch.teacher_name.charAt(0)}</div>}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{batch.teacher_name}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" /> {batch.start_date || 'TBA'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" /> {batch.batch_timing || 'TBA'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                       <span className="text-slate-400 font-medium">Duration:</span> {batch.batch_duration || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="w-4 h-4 text-slate-400" /> {batch.fee_structure || 'Contact for fee'}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                  No active batches listed right now.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Demo Video & Location */}
        <div className="space-y-6">
          {embedUrl && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                Demo Class
              </div>
              <div className="aspect-video w-full bg-slate-900">
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
            </div>
          )}

          {institute.location && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Map className="w-5 h-5 text-indigo-600"/> Location</h3>
               <p className="text-sm text-slate-600 mb-4">{institute.location}</p>
               {institute.location.includes('http') || institute.location.includes('iframe') ? (
                 <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden" dangerouslySetInnerHTML={{__html: institute.location.startsWith('<iframe') ? institute.location : `<iframe width="100%" height="100%" src="${institute.location}" frameborder="0"></iframe>`}}></div>
               ) : null}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
