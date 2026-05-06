import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar, Navigation, SlidersHorizontal, X, CheckSquare, Square, LayoutList, Map as MapIcon, Sparkles, MessageSquarePlus, Navigation2 } from 'lucide-react';
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
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! Ready to find the perfect batch?';
    if (hour < 18) return 'Good Afternoon! Discover your potential today.';
    return 'Good Evening! Planning for a bright tomorrow?';
  };

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

  // Update distances when userLocation is available
  useEffect(() => {
    if (userLocation && institutes.length > 0) {
      setInstitutes(prev => prev.map(inst => {
        // Stable mock coordinates for data consistency if not in DB
        const instLat = inst.latitude || 26.6575 + (Math.sin(inst.id.length) * 0.02);
        const instLng = inst.longitude || 84.8989 + (Math.cos(inst.id.length) * 0.02);
        
        const dist = calculateDistance(userLocation.lat, userLocation.lng, instLat, instLng);
        return {
          ...inst,
          latitude: instLat,
          longitude: instLng,
          distance: dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`
        };
      }));
    }
  }, [userLocation]);

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

  return (
    <main className="w-full pb-32">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-[#0b1120] dark:to-slate-800 pt-32 pb-28 px-4 md:px-8 border-b border-white/20 dark:border-slate-800/50">
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
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            {getGreeting()}
          </motion.p>
        </div>

        {/* Featured Institutes Carousel */}
        <div className="mt-20 max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
               <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
               Top Rated in Motihari
             </h3>
             <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">SPONSORED</span>
          </div>
          <div 
            ref={featuredScrollRef}
            className="flex overflow-x-auto scrollbar-hide gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0"
          >
             {[...institutes.slice(0, 4), ...institutes.slice(0, 4), ...institutes.slice(0, 4)].map((inst, i) => (
               <motion.a 
                 key={`featured-${inst.id}-${i}`}
                 href={`/institute/${inst.id}`}
                 whileHover={{ y: -8, scale: 1.02 }}
                 className="min-w-[280px] md:min-w-[380px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 shadow-xl shadow-amber-500/5 relative overflow-hidden group"
               >
                 <div className="absolute top-4 right-4 z-20">
                   <div className="bg-amber-500 text-white p-2 rounded-xl shadow-lg shadow-amber-500/40">
                     <Star className="w-4 h-4 fill-white" />
                   </div>
                 </div>
                 
                 <div className="h-32 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {inst.logo ? (
                      <img src={inst.logo} alt={inst.name} className="h-full object-contain relative z-10 mix-blend-darken dark:mix-blend-screen transition-all group-hover:scale-110 duration-700 ease-out" />
                    ) : (
                      <span className="text-5xl font-black text-amber-600/20 dark:text-amber-500/20 absolute inset-0 flex items-center justify-center select-none group-hover:scale-150 transition-transform duration-1000">{inst.name.charAt(0)}</span>
                    )}
                 </div>
                 
                 <div className="p-6">
                   <div className="flex items-center gap-1 mb-2">
                     {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                     <span className="text-xs font-bold text-amber-600 ml-1">4.9</span>
                   </div>
                   <h4 className="font-bold text-slate-900 dark:text-white text-xl line-clamp-1 tracking-tight capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{formatAcronyms(inst.name)}</h4>
                   {inst.distance && (
                     <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                       <Navigation2 className="w-3 h-3 fill-blue-600/20" />
                       <span>{inst.distance} away</span>
                     </div>
                   )}
                   <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                       <MapPin className="w-4 h-4 text-blue-500" />
                     </div>
                     <span className="truncate font-medium">{getLocationText(inst)}</span>
                   </div>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
               </motion.a>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-20 space-y-6">
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
        <section className="flex-1 min-w-0 w-full mb-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[13px] mb-5 pb-3 border-b border-slate-200 dark:border-slate-800 px-1"
          >
            <span>{loading ? 'Discovering institutes...' : `Showing ${filtered.length} Institute${filtered.length === 1 ? '' : 's'}`}</span>
          </motion.div>
          
          {loading ? (
            <HomeSkeleton />
          ) : viewMode === 'map' ? (
             <div className="h-[600px] w-full bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-300 dark:border-slate-700 overflow-hidden relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14309.846549308118!2d84.89886751761614!3d26.6575196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399335ef00000001%3A0xe54e60fc82669e7d!2sMotihari%2C%20Bihar!5e0!3m2!1sen!2sin!4v1714981718000!5m2!1sen!2sin" 
                  className="w-full h-full border-0 grayscale dark:invert-[0.9] dark:hue-rotate-180" 
                  loading="lazy"
                ></iframe>
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-[240px]">
                   <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Map View (BETA)</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Pins for all institutes are automatically generated based on their proximity to Motihari center.</p>
                </div>
             </div>
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
              className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filtered.map((inst, i) => {
                const isSelectedForCompare = compareList.some(p => p.id === inst.id);
                
                return (
              <motion.a 
                variants={itemVariants}
                whileHover={{ y: -4 }}
                key={inst.id} 
                href={`/institute/${inst.id}`} 
                className={`group flex flex-col border shadow-sm rounded-xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer min-h-[44px] ${isSelectedForCompare ? 'border-blue-500 ring-1 ring-blue-500 shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'}`}
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
            </motion.div>
          )}
        </section>
      </div>
    </div>

      {/* View Mode Toggle FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl shadow-blue-500/20 font-bold border border-slate-700 dark:border-slate-200"
        >
          {viewMode === 'list' ? (
            <>
              <MapIcon className="w-5 h-5" />
              <span>Show Map</span>
            </>
          ) : (
            <>
              <LayoutList className="w-5 h-5" />
              <span>Show List</span>
            </>
          )}
        </motion.button>
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
