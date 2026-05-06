import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar, Navigation, SlidersHorizontal, X, CheckSquare, Square, Map as MapIcon, Sparkles, MessageSquarePlus, Navigation2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { HomeSkeleton } from '../components/Skeleton';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const setSearch = (val: string) => {
    setSearchParams(prev => {
      if (val) prev.set('search', val);
      else prev.delete('search');
      return prev;
    }, { replace: true });
  };
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [maxFee, setMaxFee] = useState<number>(50000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'rating' | 'distance' | 'fee'>('name');

  useEffect(() => {
    if (searchParams.get('filters') === 'open') {
      setIsFilterOpen(true);
    } else {
      setIsFilterOpen(false);
    }
  }, [searchParams]);

  const closeFilters = () => {
    setIsFilterOpen(false);
    setSearchParams(prev => {
      prev.delete('filters');
      return prev;
    }, { replace: true });
  };
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const enrichedInstitutes = React.useMemo(() => {
    return institutes.map(inst => {
      if (!userLocation) return inst;
      
      // Use DB coordinates if they are valid numbers and not 0 (unlikely for specific institutes)
      const hasValidCoords = typeof inst.latitude === 'number' && typeof inst.longitude === 'number' && 
                            !isNaN(inst.latitude) && !isNaN(inst.longitude) &&
                            (inst.latitude !== 0 || inst.longitude !== 0);

      const instLat = hasValidCoords ? inst.latitude : 26.6575 + (Math.sin(inst.id.length) * 0.02);
      const instLng = hasValidCoords ? inst.longitude : 84.8989 + (Math.cos(inst.id.length) * 0.02);
      
      const dist = calculateDistance(userLocation.lat, userLocation.lng, instLat, instLng);
      const minFee = inst.batches?.length > 0 
        ? Math.min(...inst.batches.map((b: any) => b.fee_value || 100000)) 
        : 100000;

      return {
        ...inst,
        distance: dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`,
        numericDistance: dist,
        minFee: minFee,
        isMockDistance: !hasValidCoords
      };
    });
  }, [institutes, userLocation]);

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const el = featuredScrollRef.current;
    if (!el || institutes.length === 0) return;

    let animationFrameId: number;
    let lastTime = 0;
    
    // Auto-scroll speed
    const pixelsPerSecond = 45;

    const scroll = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      if (el && !isInteractingRef.current) {
        el.scrollLeft += pixelsPerSecond * deltaTime;
        
        // Loop logic: when we pass the first set of items, loop back smoothly
        const setWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= setWidth * 2) {
          el.scrollLeft -= setWidth;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += setWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Delay start to allow for layout settlement
    const startTimeout = setTimeout(() => {
      // Start in the middle set for pre-populated left/right content
      const setWidth = el.scrollWidth / 3;
      el.scrollLeft = setWidth;
      animationFrameId = requestAnimationFrame(scroll);
    }, 1000);

    const handleInteractionStart = () => {
      isInteractingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };

    const handleInteractionEnd = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        lastTime = 0; // Reset timer on resume
      }, 2000); 
    };

    el.addEventListener('mouseenter', handleInteractionStart);
    el.addEventListener('mouseleave', handleInteractionEnd);
    el.addEventListener('touchstart', handleInteractionStart, { passive: true });
    el.addEventListener('touchend', handleInteractionEnd, { passive: true });
    el.addEventListener('mousedown', handleInteractionStart);
    el.addEventListener('mouseup', handleInteractionEnd);
    el.addEventListener('wheel', handleInteractionStart, { passive: true });

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      el.removeEventListener('mouseenter', handleInteractionStart);
      el.removeEventListener('mouseleave', handleInteractionEnd);
      el.removeEventListener('touchstart', handleInteractionStart);
      el.removeEventListener('touchend', handleInteractionEnd);
      el.removeEventListener('mousedown', handleInteractionStart);
      el.removeEventListener('mouseup', handleInteractionEnd);
      el.removeEventListener('wheel', handleInteractionStart);
    };
  }, [institutes]);

  // Compare states
  const [compareList, setCompareList] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    fetchInstitutes();
    
    // Auto-locate user on mount
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location access denied or unavailable", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
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

  const getLocationText = (inst: any) => {
    if (inst.address) return inst.address;
    if (inst.location && !inst.location.includes('<iframe')) return inst.location;
    return 'Location not specified';
  };

  const filtered = enrichedInstitutes.filter(inst => {
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
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'distance') return (a.numericDistance || 0) - (b.numericDistance || 0);
    if (sortBy === 'fee') return (a.minFee || 100000) - (b.minFee || 100000);
    return 0; // relevance (default order)
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
  };

  const topRatedInstitutes = React.useMemo(() => {
    return [...enrichedInstitutes]
      .filter((inst: any) => inst.rating && inst.rating >= 4.0)
      .sort((a: any, b: any) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      })
      .slice(0, 5);
  }, [enrichedInstitutes]);

  return (
    <main className="w-full pb-32">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-[#0b1120] dark:to-slate-800 pt-32 pb-12 px-4 md:px-8 border-b border-white/20 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Find Top Institutes in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Motihari</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium"
          >
            {institutes.length > 0 ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {institutes.length}+ Verified Institutes Available
              </span>
            ) : (
              'Discover your potential with the best coaching centers today.'
            )}
          </motion.p>
        </div>

        {/* Featured Institutes Carousel */}
        <div className="mt-12 max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex flex-col mb-1.5 mt-2">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                 <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
                 Top Rated in Motihari
               </h3>
               <span className="text-xs text-slate-500 font-normal pl-8">Based on verified student reviews</span>
             </div>
          </div>
          <motion.div 
            ref={featuredScrollRef}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex overflow-x-auto scrollbar-hide gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0"
          >
             {topRatedInstitutes.map((inst, i) => (
               <motion.a 
                 key={`featured-${inst.id}-${i}`}
                 variants={itemVariants}
                 href={`/institute/${inst.id}`}
                 whileHover={{ y: -2 }}
                 className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 shadow-sm relative overflow-hidden group flex flex-row items-center gap-4 p-4 transition-all duration-300"
               >
                 <div className="absolute top-2 right-2 z-20">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-500 opacity-80" />
                 </div>
                 
                 {/* Left (Visual) */}
                 <div className="w-14 h-14 min-w-[56px] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                    {inst.logo ? (
                      <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain p-2 mix-blend-darken dark:mix-blend-screen scale-100 group-hover:scale-110 transition-transform duration-500 ease-out" />
                    ) : (
                       <span className="text-amber-600 dark:text-amber-500 font-bold text-xl uppercase">
                         {inst.name.charAt(0)}
                       </span>
                    )}
                 </div>
                 
                 {/* Middle (Data) */}
                 <div className="flex-1 flex flex-col justify-center overflow-hidden">
                   <h4 className="font-semibold text-slate-900 dark:text-white text-base tracking-tight capitalize pr-2 leading-tight">{formatAcronyms(inst.name)}</h4>
                   
                   <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                     {inst.distance ? (
                       <span className="flex items-center gap-1 font-medium">
                         <Navigation2 className="w-3 h-3 text-blue-500" />
                         {inst.distance} {inst.isMockDistance && '(est.)'}
                       </span>
                     ) : (
                       <span className="flex items-center gap-1">
                         <MapPin className="w-3 h-3 opacity-70" />
                         {formatAcronyms(getLocationText(inst))}
                       </span>
                     )}
                   </div>
                   
                   <div className="flex items-center gap-1 mt-2 min-h-[16px]">
                     {inst.rating ? (
                       <>
                         <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                         <span className="text-xs font-bold text-slate-900 dark:text-white ml-0.5">
                           {inst.rating.toFixed(1)}
                         </span>
                         <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">
                           ({inst.reviewCount || 0} {(inst.reviewCount === 1) ? 'review' : 'reviews'})
                         </span>
                       </>
                     ) : (
                       <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">New</span>
                     )}
                   </div>
                 </div>
                 
                 {/* Right (Action) */}
                 <div className="flex flex-col items-end justify-center shrink-0 relative z-10">
                   <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                     <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-600 transition-colors" />
                   </div>
                 </div>
                 
                 <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom"></div>
               </motion.a>
             ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-20 space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Available Institutes</h3>
        {/* Quick Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex overflow-x-auto scrollbar-hide gap-3 py-2 w-full"
        >
          {['NEET', 'JEE', 'Physics', 'Mathematics', 'Biology', 'Foundation', 'UPSC', 'CBSE'].map(cat => (
             <button
                key={cat}
                onClick={() => setSearch(cat)}
                className="rounded-full px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
             >
                {cat}
             </button>
          ))}
        </motion.div>


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
                onClick={closeFilters} 
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-[300px] max-w-[80vw] bg-white dark:bg-slate-900 z-50 p-6 md:hidden overflow-y-auto shadow-2xl"
              >
                  <FilterContent onClose={closeFilters} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <section className="flex-1 min-w-0 w-full mb-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[13px] mb-5 pb-3 border-b border-slate-200 dark:border-slate-800 px-1"
          >
            <span>{loading ? 'Discovering institutes...' : `Showing ${filtered.length} Institute${filtered.length === 1 ? '' : 's'}`}</span>
            
            {!loading && filtered.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-[13px] font-semibold text-slate-900 dark:text-white focus:ring-0 cursor-pointer p-0 pr-6"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">A to Z</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                  <option value="fee">Lowest Fee</option>
                </select>
              </div>
            )}
          </motion.div>
          
          {loading ? (
            <HomeSkeleton />
          ) : filtered.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                   <Search className="w-12 h-12 text-blue-300 dark:text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Results Found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">We couldn't find any institutes matching your search for "{search}". Try checking your spelling or broadening your filters.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                     onClick={() => { setSearch(''); setSelectedMediums([]); setSelectedBoards([]); setMaxFee(50000); }}
                     className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold transition-transform active:scale-95"
                   >
                     Clear all filters
                   </button>
                   <button 
                     className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                   >
                     <MessageSquarePlus className="w-4 h-4" />
                     Request this Subject
                   </button>
                </div>
             </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid lg:grid-cols-2 gap-4"
            >
              {filtered.map((inst, i) => {
                const isSelectedForCompare = compareList.some(p => p.id === inst.id);
                
                return (
              <motion.a 
                variants={itemVariants}
                whileHover={{ y: -2 }}
                key={inst.id} 
                href={`/institute/${inst.id}`} 
                className={`group flex flex-row items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${isSelectedForCompare ? 'border shadow-sm border-blue-500 shadow-blue-500/10 ring-1 ring-blue-500/20' : 'border border-slate-200 shadow-sm dark:border-slate-800'}`}
              >
                {/* Left (Visual) */}
                <div className="w-14 h-14 min-w-[56px] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                   {inst.logo ? (
                     <motion.img layoutId={`logo-${inst.id}`} src={inst.logo} alt={inst.name} className="w-full h-full object-contain p-2 mix-blend-darken dark:mix-blend-screen scale-100 group-hover:scale-110 transition-transform duration-500 ease-out" />
                   ) : (
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-xl uppercase">
                        {inst.name.charAt(0)}
                      </span>
                   )}
                </div>

                {/* Middle (Data) */}
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight truncate capitalize pr-2">{formatAcronyms(inst.name)}</h3>
                  
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {inst.distance ? (
                       <span className="flex items-center gap-1 font-medium">
                         <Navigation2 className="w-3 h-3 text-blue-500" />
                         {inst.distance} {inst.isMockDistance && '(est.)'}
                       </span>
                    ) : (
                       <span className="flex items-center gap-1">
                         <MapPin className="w-3 h-3 opacity-70" />
                         {formatAcronyms(getLocationText(inst))}
                       </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(new Set(inst.batches?.flatMap((b:any) => b.subject?.split(',').map((s:string) => s.trim()).filter(Boolean)) || [])).slice(0, 3).map((sub: any) => (
                      <span key={sub} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-medium inline-block capitalize truncate max-w-[80px]">
                        {formatAcronyms(sub)}
                      </span>
                    ))}
                    {(!inst.batches || inst.batches.length === 0) && (
                      <span className="text-slate-400 dark:text-slate-500 text-[10px]">No active batches</span>
                    )}
                  </div>
                </div>

                {/* Right (Action) */}
                <div className="flex flex-col items-end justify-center gap-3 shrink-0">
                  <button 
                    onClick={(e) => handleToggleCompare(e, inst)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-bold tracking-tight uppercase ${
                      isSelectedForCompare 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {isSelectedForCompare ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </>
                    )}
                  </button>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </motion.a>
              )})}
            </motion.div>
          )}
        </section>
      </div>
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
    </main>
  );
}
