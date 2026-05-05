import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { HomeSkeleton } from '../components/Skeleton';

export default function Home() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/institutes');
      if (res.ok) setInstitutes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const getLocationText = (inst: any) => {
    if (inst.address) return inst.address;
    if (inst.location && !inst.location.includes('<iframe')) return inst.location;
    return 'Location not specified';
  };

  const filtered = institutes.filter(inst => {
    const searchLower = search.toLowerCase();
    const instName = inst.name.toLowerCase();
    const hasBatchMatch = inst.batches?.some((b: any) => b.subject.toLowerCase().includes(searchLower) || b.batch_name.toLowerCase().includes(searchLower));
    return instName.includes(searchLower) || hasBatchMatch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 md:space-y-10 pb-24">
      {/* Search Header */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-4 md:pt-6"
      >
        <h2 className="text-2xl md:text-4xl font-semibold text-apple-text tracking-tight px-1">Available Institutes</h2>
        
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-muted w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search by institute or subject..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-apple-border/50 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-sm md:text-base outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all duration-300 min-h-[44px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </motion.section>

      {/* Institutes Grid */}
      <section>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center text-apple-text-muted text-[13px] mb-5 pb-3 border-b border-apple-border/30 px-1"
        >
          <span>{loading ? 'Discovering institutes...' : `Showing ${filtered.length} Institute${filtered.length === 1 ? '' : 's'}`}</span>
        </motion.div>
        
        {loading ? (
          <HomeSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((inst, i) => (
            <motion.a 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 + 0.3, ease: [0.23, 1, 0.32, 1] }}
              key={inst.id} 
              href={`/institute/${inst.id}`} 
              className="group flex flex-col border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer min-h-[44px]"
            >
              <div className="h-32 bg-apple-gray flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 to-purple-500/5 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-50"></div>
                {inst.logo ? (
                  <motion.img layoutId={`logo-${inst.id}`} src={inst.logo} alt={inst.name} className="h-full object-contain relative z-10 mix-blend-darken scale-95 group-hover:scale-100 transition-transform duration-500 ease-out" />
                ) : (
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm text-apple-blue flex items-center justify-center font-semibold text-3xl shrink-0 border border-apple-border/30 scale-95 group-hover:scale-100 transition-transform duration-500 ease-out capitalize">
                     {inst.name.charAt(0)}
                   </div>
                )}
              </div>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <h3 className="text-[22px] font-semibold text-apple-text tracking-tight transition-colors line-clamp-1 capitalize">{inst.name}</h3>
                
                <div className="flex items-center gap-2 mt-2 text-sm text-apple-text-muted">
                  <MapPin className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate capitalize">{getLocationText(inst)}</span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Top Subjects</div>
                  <div className="flex flex-wrap gap-0">
                    {Array.from(new Set(inst.batches?.flatMap((b:any) => b.subject?.split(',').map((s:string) => s.trim()).filter(Boolean)) || [])).slice(0, 3).map((sub: any) => (
                      <span key={sub} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] md:text-xs font-medium inline-block mt-1 mr-1 capitalize">
                        {sub}
                      </span>
                    ))}
                    {(!inst.batches || inst.batches.length === 0) && (
                      <span className="text-slate-400 text-sm mt-1">No batches listed</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-apple-border/30 flex items-center justify-between">
                  <span className="text-sm text-apple-text-muted">{inst.batches?.length || 0} active batches</span>
                  <span className="text-apple-blue font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300 min-h-[44px]">View <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">&rarr;</span></span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}
