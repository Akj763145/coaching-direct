import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    const res = await fetch('/api/public/institutes');
    if (res.ok) setInstitutes(await res.json());
  };

  const filtered = institutes.filter(inst => {
    const searchLower = search.toLowerCase();
    const instName = inst.name.toLowerCase();
    const hasBatchMatch = inst.batches?.some((b: any) => b.subject.toLowerCase().includes(searchLower) || b.batch_name.toLowerCase().includes(searchLower));
    return instName.includes(searchLower) || hasBatchMatch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 pb-24">
      {/* Search Header */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-apple-text tracking-tight">Available Institutes</h2>
        
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-muted w-5 h-5 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search by institute or subject..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-apple-border/50 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-base outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all duration-300"
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
          className="flex items-center text-apple-text-muted text-sm mb-6 pb-4 border-b border-apple-border/30"
        >
          <span>Showing {filtered.length} institutes</span>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst, i) => (
            <motion.a 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 + 0.3, ease: [0.23, 1, 0.32, 1] }}
              key={inst.id} 
              href={`/institute/${inst.id}`} 
              className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-apple-border/30 transition-all duration-500 ease-out hover:-translate-y-1"
            >
              <div className="h-32 bg-apple-gray flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 to-purple-500/5 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-50"></div>
                {inst.logo ? (
                  <motion.img layoutId={`logo-${inst.id}`} src={inst.logo} alt={inst.name} className="h-full object-contain relative z-10 mix-blend-darken scale-95 group-hover:scale-100 transition-transform duration-500 ease-out" />
                ) : (
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm text-apple-blue flex items-center justify-center font-semibold text-3xl shrink-0 border border-apple-border/30 scale-95 group-hover:scale-100 transition-transform duration-500 ease-out">
                     {inst.name.charAt(0)}
                   </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[22px] font-semibold text-apple-text tracking-tight transition-colors line-clamp-1">{inst.name}</h3>
                
                <div className="flex items-center gap-2 mt-2 text-sm text-apple-text-muted">
                  <MapPin className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate">{inst.location || inst.address || 'Location not specified'}</span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="text-[11px] font-medium text-apple-text-muted uppercase tracking-widest">Top Subjects</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(inst.batches?.map((b:any) => b.subject))).slice(0, 3).map((sub: any) => (
                      <span key={sub} className="bg-apple-blue/5 text-apple-blue px-2.5 py-1 rounded-lg text-xs font-medium">
                        {sub}
                      </span>
                    ))}
                    {(!inst.batches || inst.batches.length === 0) && (
                      <span className="text-apple-text-muted text-sm">No batches listed</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-apple-border/30 flex items-center justify-between">
                  <span className="text-sm text-apple-text-muted">{inst.batches?.length || 0} active batches</span>
                  <span className="text-apple-blue font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">View <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">&rarr;</span></span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}
