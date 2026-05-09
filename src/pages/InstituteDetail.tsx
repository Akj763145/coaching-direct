import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Map, Calendar, Clock, IndianRupee, User, BookOpen, X, Star, Bell, Download, ChevronRight, Monitor, Users, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailSkeleton } from '../components/Skeleton';
import { supabase } from '../lib/supabase';

import { InstituteReviewsTab } from '../components/InstituteReviewsTab';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
    formatted = '₹ ' + formatted;
  }
  formatted = formatted.replace(/₹\s*(\d)/g, '₹$1');
  formatted = formatted.replace(/\/?\s*(month|year|hr|hour|day|class)/gi, ' / $1');
  formatted = formatted.replace(/\/ \//g, '/');
  return formatAcronyms(formatted.replace(/\b\w/g, c => c.toUpperCase()));
};

const TeacherAvatar = ({ src, name }: { src?: string, name?: string }) => {
  const [error, setError] = useState(false);
  const initials = (name || '?').substring(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
      {src && !error ? (
        <img src={src} alt={name || 'Teacher'} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        initials
      )}
    </div>
  );
};

const MOCK_REVIEWS = [
  { id: 1, name: "Rahul Verma", rating: 5, text: "Excellent faculty and great study material. Really helped me improve my score!" },
  { id: 2, name: "Sneha Sharma", rating: 4, text: "Good institute overall. The test series is very tough but relevant." },
  { id: 3, name: "Aman Gupta", rating: 5, text: "The doubt clearing sessions are amazing. Teachers are very supportive." }
];

export default function InstituteDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [institute, setInstitute] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const activeTab = searchParams.get('tab') || 'profile';

  const setActiveTab = (tabId: string) => {
    setSearchParams(prev => {
      prev.set('tab', tabId);
      return prev;
    }, { replace: true });
  };

  useEffect(() => {
    fetchInstitute();
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/public/reviews?institute_id=${id}`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const isIframe = (str: string) => str?.startsWith('<iframe') || str?.includes('iframe');
  
  const getMapUrl = (location: string) => {
    if (!location) return null;
    const trimmed = location.trim();
    if (isIframe(trimmed)) {
      const srcMatch = trimmed.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : null;
    }
    if (trimmed.startsWith('http')) return trimmed;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
  };

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <DetailSkeleton />
    </div>
  );
  if (!institute) return <div className="p-12 text-center text-slate-500 font-medium">Institute not found</div>;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-4xl mx-auto flex flex-col min-h-screen pt-4 md:pt-6 pb-32"
    >
      <div className="px-4 pb-4 flex items-center gap-3 shrink-0">
        <Link 
          to="/" 
          className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white capitalize truncate">{formatAcronyms(institute.name)}</span>
        </div>
      </div>

      <div className="px-4 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden text-center pb-8 transition-all">
          <div className="h-28 sm:h-32 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/80"></div>
          
          <div className="flex justify-center -mt-10 sm:-mt-12 relative z-10">
            {institute.logo ? (
              <motion.img src={institute.logo} alt={institute.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white dark:bg-slate-800" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-3xl capitalize z-10">
                {institute.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="px-6 relative z-10 mt-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight capitalize">{formatAcronyms(institute.name)}</h1>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(institute.rating || 0) ? 'fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500' : 'fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-800'}`} 
                  />
                ))}
              </div>
              {institute.total_reviews > 0 ? (
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {Number(institute.rating || 0).toFixed(1)} <span className="text-slate-400 font-medium">({institute.total_reviews} reviews)</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">No reviews yet</span>
              )}
            </div>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 capitalize max-w-md mx-auto line-clamp-1">
              {formatAcronyms(institute.address || institute.location || '')}
            </p>
            <div className="flex justify-center gap-3 sm:gap-4 mt-6">
              {institute.phone && (
                <div className="flex flex-col items-center gap-1">
                  <a href={`tel:${institute.phone}`} className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Phone className="w-5 h-5"/>
                  </a>
                  <span className="text-[10px] md:text-xs text-slate-500 font-medium">Call</span>
                </div>
              )}
              {institute.email && (
                <div className="flex flex-col items-center gap-1">
                  <a href={`mailto:${institute.email}`} className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Mail className="w-5 h-5"/>
                  </a>
                  <span className="text-[10px] md:text-xs text-slate-500 font-medium">Email</span>
                </div>
              )}
              {institute.website && (
                <div className="flex flex-col items-center gap-1">
                  <a href={getFullUrl(institute.website)} target="_blank" rel="noreferrer" className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Globe className="w-5 h-5"/>
                  </a>
                  <span className="text-[10px] md:text-xs text-slate-500 font-medium">Website</span>
                </div>
              )}
              {(institute.address || institute.location) && (
                <div className="flex flex-col items-center gap-1">
                  <a 
                    href={getMapUrl(institute.location || institute.address) || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    title={institute.address || institute.location} 
                    className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-5 h-5"/>
                  </a>
                  <span className="text-[10px] md:text-xs text-slate-500 font-medium">Location</span>
                </div>
              )}
              {institute.whatsapp_number && (
                <div className="flex flex-col items-center gap-1">
                  <a
                    href={`https://wa.me/${String(institute.whatsapp_number).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${institute.name}, I found your profile on Coaching Direct.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-green-600 dark:text-green-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                  <span className="text-[10px] md:text-xs text-slate-500 font-medium">Chat</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[60px] z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md px-4 mt-4 py-2 border-b border-slate-100 dark:border-white/5">
        <div className="flex overflow-x-auto scrollbar-hide gap-6 justify-start md:justify-center items-center">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'batches', label: 'Batches' },
            { id: 'resources', label: 'Resources' },
            { id: 'docs', label: 'Notice Board' },
            { id: 'reviews', label: 'Reviews' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap text-sm font-semibold transition-colors pb-1.5 border-b-2 ${activeTab === tab.id ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 flex-1 items-start flex flex-col gap-3">
        <section className={`${activeTab === 'profile' ? 'block' : 'hidden'} w-full space-y-3`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-900 px-5 py-4 mb-3 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-base">About Institute</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {institute.description || `Welcome to ${institute.name}. We provide high quality coaching for competitive exams and academic excellence. Join us to achieve your educational goals with expert guidance and proven methodologies.`}
            </p>
          </div>

          {(institute.phone || institute.email || institute.whatsapp_number) && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 px-5 py-4 mb-3 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-base">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {institute.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{institute.phone}</p>
                    </div>
                  </div>
                )}
                {institute.whatsapp_number && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-green-500 shadow-sm shrink-0">
                      <WhatsAppIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WhatsApp</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{institute.whatsapp_number}</p>
                    </div>
                  </div>
                )}
                {institute.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{institute.email}</p>
                    </div>
                  </div>
                )}
                {institute.website && (
                  <a 
                    href={getFullUrl(institute.website)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 shadow-sm shrink-0 transition-colors">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Website</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{institute.website}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 px-5 py-4 mb-3 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-base">Meet Our Faculty</h3>
            <div className="flex overflow-x-auto gap-6 pb-2 scrollbar-hide">
              {institute.faculty && institute.faculty.length > 0 ? (
                institute.faculty.map((teacher: any) => (
                  <div key={teacher.id} className="flex flex-col items-center min-w-[100px] group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-105">
                      {teacher.image_url ? (
                        <img 
                          src={teacher.image_url} 
                          alt={teacher.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-400">
                          {teacher.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold mt-2 text-center text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {teacher.name}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-500 text-center whitespace-nowrap mt-0.5 font-medium">
                      {teacher.subject}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-sm text-slate-500 italic">No faculty details provided yet.</div>
              )}
            </div>
          </div>
        </section>

        <section className={`${activeTab === 'batches' ? 'block' : 'hidden'} w-full`}>
          {institute.categories && institute.categories.length > 0 && (
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                All Batches
              </button>
              {institute.categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {institute.batches && institute.batches.length > 0 ? (
              institute.batches
                .filter((batch: any) => selectedCategory === 'all' || String(batch.category_id) === String(selectedCategory))
                .map((batch: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                key={batch.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white capitalize truncate">
                      {formatAcronyms(batch.batch_name)}
                    </h3>
                    {batch.category_id && institute.categories && (
                      <span 
                        className="px-2 py-0.5 rounded-md text-white text-[9px] font-bold uppercase tracking-wider w-fit"
                        style={{ backgroundColor: institute.categories.find((c: any) => c.id === batch.category_id)?.color || '#3b82f6' }}
                      >
                        {institute.categories.find((c: any) => c.id === batch.category_id)?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {batch.status === 'running' 
                      ? <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Running</span>
                      : <span className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Inactive</span>
                    }
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100/50 dark:border-white/5">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0">
                      <Clock className="w-2.5 h-2.5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-slate-400 font-medium leading-none mb-0.5">Time</p>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold truncate">{batch.batch_timing || 'TBA'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100/50 dark:border-white/5">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0">
                      <Monitor className="w-2.5 h-2.5 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-slate-400 font-medium leading-none mb-0.5">Mode</p>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">{batch.mode || 'Offline'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100/50 dark:border-white/5 col-span-1">
                    <div className="flex items-center justify-between mb-1 px-0.5">
                      <div className="flex items-center gap-1">
                        <Users className="w-2 h-2 text-slate-400" />
                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{batch.available_seats || 0} Slots</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                        {Math.round(((batch.total_seats - (batch.available_seats || 0)) / (batch.total_seats || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round(((batch.total_seats - (batch.available_seats || 0)) / (batch.total_seats || 1)) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <Link 
                    to={`/batch/${batch.id}`}
                    className="flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Enroll Now
                  </Link>
                </div>
              </motion.div>
            ))) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-white/5 text-center text-slate-500 shadow-sm">
                No active batches right now.
              </div>
            )}
            {institute.batches && institute.batches.length > 0 && institute.batches.filter((batch: any) => selectedCategory === 'all' || String(batch.category_id) === String(selectedCategory)).length === 0 && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-white/5 text-center text-slate-500 shadow-sm">
                No batches found in this category.
              </div>
            )}
          </div>
        </section>

        <section className={`${activeTab === 'reviews' ? 'block' : 'hidden'} w-full`}>
          <InstituteReviewsTab 
            instituteId={id!}
            instituteName={institute.name}
            reviews={reviews}
            avgRating={institute.rating || 0}
            totalReviews={institute.total_reviews || 0}
            onReviewAdded={() => {
              fetchReviews();
              fetchInstitute();
            }}
          />
        </section>

        <section className={`${activeTab === 'docs' ? 'block' : 'hidden'} w-full space-y-6`}>
          {/* Notice Board - Timeline View */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Notice Board
            </h3>
            
            <div className="relative space-y-8 pl-4">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800"></div>
              
              {institute.notices && institute.notices.length > 0 ? institute.notices.map((update: any, i: number) => (
                <motion.div 
                  key={update.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex gap-6"
                >
                  {/* Timeline Node */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 border-2 ${
                    update.type === 'alert' 
                    ? 'bg-amber-50 border-amber-100 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20' 
                    : 'bg-blue-50 border-blue-100 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
                      {update.date}
                    </span>
                    <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
                      {update.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {update.description}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="py-10 text-center text-slate-400 text-sm">No recent updates on the notice board.</div>
              )}
            </div>
          </div>
        </section>

        <section className={`${activeTab === 'resources' ? 'block' : 'hidden'} w-full`}>
          {/* Resource Center - Grid View */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Resource Center
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institute.documents && institute.documents.length > 0 ? institute.documents.map((doc: any, i: number) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center p-3 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all group cursor-pointer"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/10 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      {doc.format} • {doc.size}
                    </span>
                  </div>
                  
                  <div className="p-2 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100">
                    <Download className="w-4 h-4" />
                  </div>
                </motion.div>
              )) : (
                <div className="md:col-span-2 py-10 text-center text-slate-400 text-sm">No study materials available yet.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
