import React, { useEffect, useState, useRef, useDeferredValue } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Code, Star, CreditCard, Clock, Calendar, Navigation, SlidersHorizontal, X, CheckSquare, Square, Map as MapIcon, Sparkles, MessageSquarePlus, Navigation2, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HomeSkeleton } from '../components/Skeleton';
import { supabase } from '../lib/supabase';
import { instituteStore } from '../lib/store';

interface Batch {
  id: string;
  batch_name: string;
  subject: string;
  fee_value?: number;
  medium?: string;
  fee_structure?: string;
}

interface Institute {
  id: string;
  name: string;
  logo?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  location?: string;
  rating?: number;
  total_reviews?: number;
  batches?: Batch[];
  isActive?: boolean;
}

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

// Simple in-memory cache to speed up navigation back to home
let cachedInstitutes: Institute[] | null = null;

interface FilterProps {
  onClose?: () => void;
  selectedMediums: string[];
  setSelectedMediums: (val: string[]) => void;
  selectedBoards: string[];
  setSelectedBoards: (val: string[]) => void;
  maxFee: number;
  setMaxFee: (val: number) => void;
}

const FeeSlider = React.memo(({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalValue(val);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(val);
    }, 5);
  };

  return (
    <div className="select-none">
      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 mb-4 flex justify-between items-center text-left">
        <span>Max Monthly Fee</span>
        <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">₹{localValue.toLocaleString()}</span>
      </h4>
      <div className="relative h-6 flex items-center group">
        <input 
          type="range" 
          min="500" max="50000" step="500"
          value={localValue}
          onChange={handleChange}
          className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300 dark:hover:bg-slate-700"
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-widest">
        <span>₹500</span>
        <span>₹50,000+</span>
      </div>
    </div>
  );
});

const FilterContent = React.memo(({ 
  onClose, 
  selectedMediums, 
  setSelectedMediums, 
  selectedBoards, 
  setSelectedBoards, 
  maxFee, 
  setMaxFee 
}: FilterProps) => (
  <div className="space-y-8 text-left">
    {onClose && (
      <div className="flex items-center justify-between md:hidden -mt-2 -mx-2 p-2">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Filters</h3>
        <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
      </div>
    )}

    <div>
      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 mb-4">Medium of Instruction</h4>
      <div className="space-y-3">
        {MEDIUMS.map(m => (
          <label key={m} className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 transition-colors"
              checked={selectedMediums.includes(m)}
              onChange={(e) => {
                if(e.target.checked) setSelectedMediums([...selectedMediums, m]);
                else setSelectedMediums(selectedMediums.filter(x => x !== m));
              }}
            />
            <span className="text-sm text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-medium">{m}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-200 mb-4">Board / Examination</h4>
      <div className="space-y-3">
        {BOARDS.map(b => (
          <label key={b} className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 transition-colors"
              checked={selectedBoards.includes(b)}
              onChange={(e) => {
                if(e.target.checked) setSelectedBoards([...selectedBoards, b]);
                else setSelectedBoards(selectedBoards.filter(x => x !== b));
              }}
            />
            <span className="text-sm text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-medium">{b}</span>
          </label>
        ))}
      </div>
    </div>

    <FeeSlider value={maxFee} onChange={setMaxFee} />
  </div>
));

export default function Home() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
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
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | null>(null);
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

  const featuredInstitutes = React.useMemo(() => {
    const base = [...enrichedInstitutes]
      .filter((inst: any) => {
        // Handle boolean, number (SQLite), or string representations
        const isFeatured = inst.is_featured;
        return isFeatured === true || isFeatured === 1 || isFeatured === 'true' || isFeatured === '1';
      });
      
    // Triple the array for infinite smooth loop
    if (base.length > 0) {
      return [...base, ...base, ...base];
    }
    return base;
  }, [enrichedInstitutes]);

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const el = featuredScrollRef.current;
    if (!el || featuredInstitutes.length === 0) return;

    let animationFrameId: number;
    let lastTime = 0;
    
    // Smooth auto-scroll speed (pixels per second)
    const pixelsPerSecond = 50;

    const scroll = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      if (el && !isInteractingRef.current) {
        el.scrollLeft += pixelsPerSecond * deltaTime;
        
        // The infinite loop math: 3 sets of data
        const singleSetWidth = el.scrollWidth / 3;
        
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Initial offset to the middle set for seamless looping in both directions
    const startTimeout = setTimeout(() => {
      if (el && el.scrollWidth > 0) {
        el.scrollLeft = el.scrollWidth / 3;
        animationFrameId = requestAnimationFrame(scroll);
      }
    }, 500);

    const handleInteractionStart = () => { isInteractingRef.current = true; };
    const handleInteractionEnd = () => { isInteractingRef.current = false; };

    el.addEventListener('mouseenter', handleInteractionStart);
    el.addEventListener('mouseleave', handleInteractionEnd);
    el.addEventListener('touchstart', handleInteractionStart, { passive: true });
    el.addEventListener('touchend', handleInteractionEnd, { passive: true });
    el.addEventListener('mousedown', handleInteractionStart);
    el.addEventListener('mouseup', handleInteractionEnd);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener('mouseenter', handleInteractionStart);
      el.removeEventListener('mouseleave', handleInteractionEnd);
      el.removeEventListener('touchstart', handleInteractionStart);
      el.removeEventListener('touchend', handleInteractionEnd);
      el.removeEventListener('mousedown', handleInteractionStart);
      el.removeEventListener('mouseup', handleInteractionEnd);
    };
  }, [featuredInstitutes.length]);

  // Compare states
  const [compareList, setCompareList] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    // Listen to store updates
    const unsubscribe = instituteStore.subscribe((data) => {
      if (data) {
        setInstitutes(data);
        setLoading(false);
      }
    });

    fetchInstitutes();
    fetchPublicCategories();
    
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
    if (cachedInstitutes) {
      setInstitutes(cachedInstitutes);
      setLoading(false);
      // Still fetch in background to refresh if needed
      refreshInstitutes();
      return;
    }
    
    setLoading(true);
    setError(null);
    await refreshInstitutes();
  };

  const refreshInstitutes = async () => {
    try {
      // Fetch leaderboard (Top 10 by review count and rating as requested)
      const { data: leaderboardData } = await supabase
        .from('institutes')
        .select(`
          id, name, logo, rating, total_reviews, address, location, is_featured
        `)
        .order('total_reviews', { ascending: false })
        .order('rating', { ascending: false })
        .limit(10);

      if (leaderboardData) {
        // De-duplicate just in case there's something weird in the data/view
        const uniqueLeaderboard = Array.from(new Map(leaderboardData.map(item => [item.id, item])).values());
        setLeaderboard(uniqueLeaderboard);
      }

      const { data, error: supaError } = await supabase
        .from('institutes')
        .select(`
          id, name, logo, latitude, longitude, address, location, rating, total_reviews, is_featured, category_id,
          batches:batches(*),
          categories:categories(*),
          institute_categories:institute_categories(name)
        `)
        .order('name', { ascending: true });

      if (supaError) {
        throw new Error(supaError.message);
      }

      if (data) {
        // Enrich data with mock properties for filtering if they don't exist
        const enriched = data.map((inst: any) => ({
          ...inst,
          category_name: inst.institute_categories?.name,
          batches: inst.batches?.map((b: any) => ({
            ...b,
            medium: b.medium || MEDIUMS[Math.floor(Math.random() * MEDIUMS.length)],
            fee_value: parseInt(b.fee_structure?.replace(/\D/g, '') || Math.floor(Math.random() * 8000 + 1000).toString())
          })) || []
        }));
        setInstitutes(enriched as Institute[]);
        cachedInstitutes = enriched as Institute[];
        instituteStore.setData(enriched as Institute[]);
      }
    } catch (err: any) {
      console.error(err);
      if (!cachedInstitutes) {
        setError("Unable to load institutes right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicCategories = async () => {
    try {
      const res = await fetch('/api/public/institute-categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLocationText = (inst: any) => {
    if (inst.address) return inst.address;
    if (inst.location && !inst.location.includes('<iframe')) return inst.location;
    return 'Location not specified';
  };

  const deferredMaxFee = useDeferredValue(maxFee);

  const filtered = React.useMemo(() => {
    return enrichedInstitutes.filter(inst => {
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

      if (deferredMaxFee < 50000) {
        const hasAffordableBatch = inst.batches?.some((b: any) => (b.fee_value || 5000) <= deferredMaxFee);
        if (!hasAffordableBatch && inst.batches && inst.batches.length > 0) return false;
      }

      if (selectedCategoryId) {
        if (inst.category_id != selectedCategoryId) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'distance') return (a.numericDistance || 0) - (b.numericDistance || 0);
      if (sortBy === 'fee') return (a.minFee || 100000) - (b.minFee || 100000);
      return 0; // relevance (default order)
    });
  }, [enrichedInstitutes, search, selectedMediums, selectedBoards, selectedCategoryId, deferredMaxFee, sortBy]);

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsNavigating(true);
    navigate(`/institute/${id}`);
  };

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
      {/* Navigation Loading Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative w-20 h-20">
              {/* Spinner */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-full h-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 dark:border-t-blue-500 rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </div>
            <p className="mt-6 text-slate-900 dark:text-white font-bold tracking-tight text-lg">Entering Institute Profile</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Getting everything ready for you...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-[#0b1120] dark:to-slate-800 pt-20 pb-8 px-4 md:px-8 border-b border-white/20 dark:border-slate-800/50">
        
        {/* Featured Institutes Carousel - Moved to Top */}
        {featuredInstitutes.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 mb-4 ml-1 w-fit px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800/50 shadow-xs">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-blue-600/10" />
                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] text-blue-700 dark:text-blue-300">
                  Our Top Institutes
                </h4>
              </div>
            </div>
              <motion.div 
                ref={featuredScrollRef}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex overflow-x-auto scrollbar-hide gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 cursor-grab active:cursor-grabbing"
              >
                 {featuredInstitutes.map((inst, i) => (
                   <motion.div
                     key={`featured-${inst.id}-${i}`}
                     variants={itemVariants}
                     whileHover={{ y: -2 }}
                   >
                    <Link 
                      to={`/institute/${inst.id}`}
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleCardClick(e, inst.id)}
                      className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 shadow-sm relative overflow-hidden group flex flex-row items-center gap-4 p-4 transition-all duration-300 cursor-pointer"
                    >
                      {inst.is_featured && (
                        <div className="absolute top-0 right-0 z-30">
                          <div className="bg-blue-600 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 fill-white/20" />
                            Featured
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 z-20">
                        {!inst.is_featured && <Star className="w-4 h-4 fill-amber-400 text-amber-500 opacity-80" />}
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
                                {Number(inst.rating || 0).toFixed(1)}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">
                                ({inst.total_reviews || 0} {(inst.total_reviews === 1) ? 'review' : 'reviews'})
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">New</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right (Action Indicator) */}
                      <div className="flex flex-col items-end justify-center shrink-0 relative z-10">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                           <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-600 transition-colors" />
                         </div>
                      </div>
                      
                      <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom"></div>
                    </Link>
                   </motion.div>
                 ))}
              </motion.div>
          </div>
        )}

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
      </div>

      {/* Top 10 Leaderboard Section */}
      {leaderboard.length > 0 && (
        <div className="mt-8 max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <Sparkles className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                Top Ranked Institutes
              </h3>
              <p className="text-xs text-slate-500 font-normal pl-8">The top 10 highest-rated coaching centers in the city.</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-5 pb-8 scrollbar-hide snap-x snap-mandatory">
            {leaderboard.map((inst, index) => {
              const rank = index + 1;
              const rankColors = {
                1: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-amber-500/40 border-amber-200",
                2: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-slate-400/40 border-slate-100",
                3: "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-orange-400/40 border-orange-200",
                default: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              };

              const currentRankColor = rankColors[rank as keyof typeof rankColors] || rankColors.default;

              return (
                <motion.div
                  key={`leaderboard-${inst.id}-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link 
                    to={`/institute/${inst.id}`}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleCardClick(e, inst.id)}
                    className="min-w-[260px] md:min-w-[300px] snap-start bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 p-5 group flex flex-col relative overflow-hidden"
                  >
                    {/* Rank Badge */}
                    <div className={`absolute top-0 left-0 px-4 py-1.5 rounded-br-2xl font-black text-sm border-b border-r ${currentRankColor} z-10 flex items-center gap-1.5`}>
                      <span className="opacity-70 text-[10px]">RANK</span>
                      <span>#{rank}</span>
                    </div>

                    <div className="flex items-start gap-4 mt-8">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
                        {inst.logo ? (
                          <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain mix-blend-darken dark:mix-blend-screen" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 uppercase">{inst.name.charAt(0)}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col h-16 justify-center">
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 tracking-tight capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {formatAcronyms(inst.name)}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{Number(inst.rating || 0).toFixed(1)}</span>
                          <div className="flex mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(inst.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-800'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Rating</span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{inst.total_reviews || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reviews</span>
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-20 space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Available Institutes</h3>
            <div className="md:hidden">
                <button
                  onClick={() => {
                    setSearchParams(prev => {
                      if (prev.get('filters') === 'open') prev.delete('filters');
                      else prev.set('filters', 'open');
                      return prev;
                    }, { replace: true });
                  }}
                  className={`flex items-center gap-2 p-2 px-3 transition-all rounded-xl border ${searchParams.get('filters') === 'open' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800' : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Filters</span>
                </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${!selectedCategoryId ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700'}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
               <SlidersHorizontal className="w-5 h-5" />
               <h3 className="font-semibold text-lg">Filters</h3>
             </div>
             <FilterContent 
                selectedMediums={selectedMediums}
                setSelectedMediums={setSelectedMediums}
                selectedBoards={selectedBoards}
                setSelectedBoards={setSelectedBoards}
                maxFee={maxFee}
                setMaxFee={setMaxFee}
             />
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
                  <FilterContent 
                    onClose={closeFilters}
                    selectedMediums={selectedMediums}
                    setSelectedMediums={setSelectedMediums}
                    selectedBoards={selectedBoards}
                    setSelectedBoards={setSelectedBoards}
                    maxFee={maxFee}
                    setMaxFee={setMaxFee}
                  />
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
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => {
                    setSearchParams(prev => {
                      if (prev.get('filters') === 'open') prev.delete('filters');
                      else prev.set('filters', 'open');
                      return prev;
                    }, { replace: true });
                  }}
                  className={`flex md:hidden items-center gap-2 p-2 px-3 transition-all rounded-xl border ${searchParams.get('filters') === 'open' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800' : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  aria-label="Filter"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
                </button>

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
              </div>
            )}
          </motion.div>
          
          {loading ? (
            <HomeSkeleton />
          ) : error ? (
             <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Data</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
                <button onClick={fetchInstitutes} className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                  Try Again
                </button>
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
              className="grid lg:grid-cols-2 gap-4"
            >
              {filtered.map((inst, i) => {
                const isSelectedForCompare = compareList.some(p => p.id === inst.id);
                
                return (
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  key={inst.id}
                >
                  <Link 
                    to={`/institute/${inst.id}`} 
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleCardClick(e, inst.id)}
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
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight line-clamp-2 capitalize pr-2">{formatAcronyms(inst.name)}</h3>
                  
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
                    {inst.category_name && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800/50">
                        {inst.category_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right (Action) */}
                <div className="flex flex-col items-end justify-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 mb-1">
                    {inst.total_reviews > 0 ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500" />
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{Number(inst.rating || 0).toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">New</span>
                    )}
                  </div>
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
                  </Link>
                </motion.div>
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
                      <Link to={`/institute/${inst.id}`} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View Profile</Link>
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
