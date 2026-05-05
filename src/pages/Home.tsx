import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto p-6 space-y-12 pb-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Find your perfect <span className="text-indigo-600">coaching institute</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore top-rated institutes, discover specialized batches, and compare fee structures to kickstart your learning journey.
        </p>
        <div className="max-w-xl mx-auto relative pt-4">
          <Search className="absolute left-4 top-1/2 translate-y-[-10%] text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by institute name, subject, or batch..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full shadow-sm text-lg outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Institutes Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Available Institutes ({filtered.length})</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(inst => (
            <a key={inst.id} href={`/institute/${inst.id}`} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1">
              <div className="h-32 bg-slate-100 flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-multiply"></div>
                {inst.logo ? (
                  <img src={inst.logo} alt={inst.name} className="h-full object-contain relative z-10 mix-blend-darken" />
                ) : (
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm text-indigo-600 flex items-center justify-center font-bold text-3xl shrink-0 border border-slate-100">
                     {inst.name.charAt(0)}
                   </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{inst.name}</h3>
                
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{inst.location || inst.address || 'Location not specified'}</span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Top Subjects</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(inst.batches?.map((b:any) => b.subject))).slice(0, 3).map((sub: any) => (
                      <span key={sub} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium border border-indigo-100">
                        {sub}
                      </span>
                    ))}
                    {(!inst.batches || inst.batches.length === 0) && (
                      <span className="text-slate-400 text-sm">No batches listed</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">{inst.batches?.length || 0} active batches</span>
                  <span className="text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">View Details &rarr;</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
