import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar, Navigation, SlidersHorizontal, X, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HomeSkeleton } from '../components/Skeleton';

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

const MEDIUMS = ['English', 'Hindi', 'Bilingual'];
const BOARDS = ['CBSE', 'State Board', 'ICSE', 'NEET', 'JEE'];

export default function Home() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [maxFee, setMaxFee] = useState<number>(50000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Compare states
  const [compareList, setCompareList] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/institutes');
      if (res.ok) {
        const data = await res.json();
        // Enrich data with mock properties for filtering if they don't exist
        const enriched = data.map((inst: any) => ({
          ...inst,
          batches: inst.batches?.map((b: any) => ({
            ...b,
            medium: b.medium || MEDIUMS[Math.floor(Math.random() * MEDIUMS.length)],
            fee_value: parseInt(b.fee_structure?.replace(/\D/g, '') || Math.floor(Math.random() * 8000 + 1000).toString())
          }))
        }));
        setInstitutes(enriched);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          // Mock distances for institutes
          setInstitutes(prev => prev.map(inst => ({
            ...inst,
            distance: (Math.random() * 5 + 0.5).toFixed(1) + ' km'
          })));
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          alert('Could not get your location.');
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
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
    const hasBatchMatch = inst.batches?.some((b: any) => b.subject?.toLowerCase().includes(searchLower) || b.batch_name?.toLowerCase().includes(searchLower));
    const searchMatch = instName.includes(searchLower) || hasBatchMatch;
    
    if (!searchMatch) return false;

    // Filters
    if (selectedMediums.length > 0) {
      const matchesMedium = inst.batches?.some((b: any) => selectedMediums.includes(b.medium));
      if (!matchesMedium) return false;
    }

    if (selectedBoards.length > 0) {
      const matchesBoard = inst.batches?.some((b: any) => 
        selectedBoards.some(board => b.batch_name?.toLowerCase().includes(board.toLowerCase()) || b.subject?.toLowerCase().includes(board.toLowerCase()))
      ) || selectedBoards.some(board => instName.includes(board.toLowerCase()) || inst.description?.toLowerCase().includes(board.toLowerCase()));
      if (!matchesBoard) return false;
    }

    if (maxFee < 50000) {
      const hasAffordableBatch = inst.batches?.some((b: any) => (b.fee_value || 5000) <= maxFee);
      if (!hasAffordableBatch && inst.batches && inst.batches.length > 0) return false;
    }

    return true;
  });

  const handleToggleCompare = (e: React.MouseEvent, inst: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCompareList(prev => {
      const exists = prev.find(p => p.id === inst.id);
      if (exists) return prev.filter(p => p.id !== inst.id);
      if (prev.length >= 3) {
        alert('You can only compare up to 3 institutes at a time.');
        return prev;
      }
      return [...prev, inst];
    });
  };

  const FilterContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-8">
      {onClose && (
        <div className="flex items-center justify-between md:hidden -mt-2 -mx-2 p-2">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Filters</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
      )}

      <div>
        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 mb-3">Medium</h4>
        <div className="space-y-2.5">
          {MEDIUMS.map(m => (
            <label key={m} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 transition-colors"
                checked={selectedMediums.includes(m)}
                onChange={(e) => {
                  if(e.target.checked) setSelectedMediums([...selectedMediums, m]);
                  else setSelectedMediums(selectedMediums.filter(x => x !== m));
                }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 mb-3">Board / Exam</h4>
        <div className="space-y-2.5">
          {BOARDS.map(b => (
            <label key={b} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 transition-colors"
                checked={selectedBoards.includes(b)}
                onChange={(e) => {
                  if(e.target.checked) setSelectedBoards([...selectedBoards, b]);
                  else setSelectedBoards(selectedBoards.filter(x => x !== b));
                }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{b}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 mb-3">Max Fee (₹{maxFee.toLocaleString()})</h4>
        <input 
          type="range" 
          min="500" max="50000" step="500"
          value={maxFee}
          onChange={e => setMaxFee(Number(e.target.value))}
          className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          <span>₹500</span>
          <span>₹50,000+</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 md:space-y-10 pb-24">
      {/* Search Header */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-4 md:pt-6"
      >
        <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight px-1 hidden lg:block">Available Institutes</h2>
        
        <div className="relative w-full lg:max-w-2xl flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by institute or subject..." 
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 min-h-[44px] dark:text-white dark:placeholder-slate-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={handleFindNearMe}
            className="shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 w-[44px] h-[44px] rounded-xl transition-colors shadow-sm relative group"
            title="Find Near Me"
          >
            <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse text-blue-500' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
          </button>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 w-[44px] h-[44px] rounded-xl transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </motion.section>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
               <SlidersHorizontal className="w-5 h-5" />
               <h3 className="font-semibold text-lg">Filters</h3>
             </div>
             <FilterContent />
          </div>
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden" 
                onClick={() => setIsFilterOpen(false)} 
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-[300px] max-w-[80vw] bg-white dark:bg-slate-900 z-50 p-6 md:hidden overflow-y-auto shadow-2xl"
              >
                  <FilterContent onClose={() => setIsFilterOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <section className="flex-1 min-w-0 w-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center text-slate-500 dark:text-slate-400 text-[13px] mb-5 pb-3 border-b border-slate-200 dark:border-slate-800 px-1"
          >
            <span>{loading ? 'Discovering institutes...' : `Showing ${filtered.length} Institute${filtered.length === 1 ? '' : 's'}`}</span>
          </motion.div>
          
          {loading ? (
            <HomeSkeleton />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((inst, i) => {
                const isSelectedForCompare = compareList.some(p => p.id === inst.id);
                
                return (
              <motion.a 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 + 0.1, ease: [0.23, 1, 0.32, 1] }}
                key={inst.id} 
                href={`/institute/${inst.id}`} 
                className={`group flex flex-col border shadow-sm rounded-xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer min-h-[44px] ${isSelectedForCompare ? 'border-blue-500 ring-1 ring-blue-500 shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div className="h-32 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500 group-hover:opacity-50"></div>
                  
                  <button 
                    onClick={(e) => handleToggleCompare(e, inst)}
                    className="absolute top-3 left-3 z-30 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    title={isSelectedForCompare ? 'Remove from comparison' : 'Add to comparison'}
                  >
                    {isSelectedForCompare ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    )}
                  </button>

                  {inst.distance && (
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 z-20">
                      <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      {inst.distance} away
                    </div>
                  )}
                  {inst.logo ? (
                    <motion.img layoutId={`logo-${inst.id}`} src={inst.logo} alt={inst.name} className="h-full object-contain relative z-10 mix-blend-darken dark:mix-blend-screen scale-95 group-hover:scale-100 transition-transform duration-500 ease-out" />
                  ) : (
                     <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-3xl shrink-0 border border-slate-200 dark:border-slate-700 scale-95 group-hover:scale-100 transition-transform duration-500 ease-out capitalize">
                       {inst.name.charAt(0)}
                     </div>
                  )}
                </div>
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <h3 className="text-[20px] md:text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight transition-colors line-clamp-1 capitalize">{formatAcronyms(inst.name)}</h3>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4 shrink-0 opacity-70" />
                    <span className="truncate capitalize">{formatAcronyms(getLocationText(inst))}</span>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">Top Subjects</div>
                    <div className="flex flex-wrap gap-0">
                      {Array.from(new Set(inst.batches?.flatMap((b:any) => b.subject?.split(',').map((s:string) => s.trim()).filter(Boolean)) || [])).slice(0, 3).map((sub: any) => (
                        <span key={sub} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] md:text-xs font-medium inline-block mt-1 mr-1 capitalize">
                          {formatAcronyms(sub)}
                        </span>
                      ))}
                      {(!inst.batches || inst.batches.length === 0) && (
                        <span className="text-slate-400 dark:text-slate-500 text-sm mt-1">No batches listed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{inst.batches?.length || 0} active batches</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300 min-h-[44px]">View <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">&rarr;</span></span>
                  </div>
                </div>
              </motion.a>
              )})}
            </div>
          )}
        </section>
      </div>

      {/* Floating Compare Action Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-blue-900/20 rounded-2xl px-6 py-4 flex items-center gap-6"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Compare</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{compareList.length}/3 Institutes</span>
            </div>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Compare Now
            </button>
            <button 
              onClick={() => setCompareList([])}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">Compare Institutes</h3>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
                <div className="grid gap-6 md:gap-8" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
                  {/* Headers */}
                  {compareList.map(inst => (
                    <div key={inst.id} className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-4">
                        {inst.logo ? (
                          <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain mix-blend-darken dark:mix-blend-screen" />
                        ) : (
                          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inst.name.charAt(0)}</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-2 capitalize">{formatAcronyms(inst.name)}</h4>
                      <a href={`/institute/${inst.id}`} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View Profile</a>
                    </div>
                  ))}
                  
                  {/* Top Subjects Row */}
                  <div className="col-span-full mt-4">
                    <h5 className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-4 text-center border-b border-slate-100 dark:border-slate-800 pb-2">Top Subjects</h5>
                    <div className="grid gap-6 md:gap-8" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
                      {compareList.map(inst => (
                        <div key={inst.id} className="flex flex-wrap gap-2 justify-center content-start">
                          {Array.from(new Set(inst.batches?.flatMap((b:any) => b.subject?.split(',').map((s:string) => s.trim()).filter(Boolean)) || [])).slice(0, 5).map((sub: any) => (
                            <span key={sub} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium capitalize">
                              {formatAcronyms(sub)}
                            </span>
                          ))}
                          {(!inst.batches || inst.batches.length === 0) && (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">N/A</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Batches Row */}
                  <div className="col-span-full">
                    <h5 className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-4 text-center border-b border-slate-100 dark:border-slate-800 pb-2">Active Batches</h5>
                    <div className="grid gap-6 md:gap-8" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
                      {compareList.map(inst => (
                        <div key={inst.id} className="text-center font-medium text-slate-900 dark:text-white text-lg">
                          {inst.batches?.length || 0}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distance Row */}
                  <div className="col-span-full">
                    <h5 className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-4 text-center border-b border-slate-100 dark:border-slate-800 pb-2">Distance</h5>
                    <div className="grid gap-6 md:gap-8" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
                      {compareList.map(inst => (
                        <div key={inst.id} className="text-center font-medium text-slate-900 dark:text-white flex items-center justify-center gap-1">
                          {inst.distance ? (
                            <>
                              <MapPin className="w-4 h-4 text-blue-500" />
                              {inst.distance}
                            </>
                          ) : (
                            <span className="text-slate-400 text-sm">Unknown</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
