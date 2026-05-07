import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, CheckCircle, Video, Edit, MapPin, 
  Target, Heart, CheckSquare, Square, ChevronRight,
  BookOpen, Star, LayoutGrid, Layers, FileText, Book,
  Bell, Search, Filter, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MockDemos: any[] = [];

const MockSavedInstitutes: any[] = [];

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'batches' | 'materials' | 'saved' | 'notices'>('overview');
  const [compareList, setCompareList] = React.useState<string[]>([]);
  const [savedInstitutes, setSavedInstitutes] = React.useState(MockSavedInstitutes);

  const [activeBatches] = React.useState([
    { id: 1, name: 'Lakshya Batch 2024', institute: 'Physics Wallah', subject: 'Physics', progress: 65, nextClass: 'Today, 4:00 PM', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400' },
    { id: 2, name: 'NEET Fastrack', institute: 'Aakash Institute', subject: 'Biology', progress: 40, nextClass: 'Tomorrow, 10:00 AM', image: 'https://images.unsplash.com/photo-1532187863486-abf51ad9f69d?w=400' }
  ]);

  const [resources] = React.useState([
    { id: 1, title: 'Class 10 Math Formula Sheet', type: 'PDF', size: '2.4 MB', date: 'Oct 12, 2023' },
    { id: 2, title: 'Science NCERT Solutions', type: 'PDF', size: '15.1 MB', date: 'Oct 10, 2023' },
    { id: 3, title: 'English Grammar Workbook', type: 'DOCX', size: '1.2 MB', date: 'Oct 08, 2023' }
  ]);

  const [notices] = React.useState([
    { id: 1, title: 'Holiday Notice: Diwali', date: 'Oct 30, 2023', description: 'The institute will remain closed on Oct 31st and Nov 1st for Diwali.', institute: 'Physics Wallah' },
    { id: 2, title: 'Mock Test Series Start', date: 'Oct 28, 2023', description: 'Weekly mock tests for CBSE Class 10 will start from this Sunday.', institute: 'Aakash Institute' }
  ]);

  // Review State
  const [reviewingId, setReviewingId] = React.useState<number | null>(null);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState('');
  const [submittedReviews, setSubmittedReviews] = React.useState<Record<number, { rating: number; text: string }>>({});

  const handleOpenReview = (id: number) => {
    setReviewingId(id);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
  };

  const handleSubmitReview = (id: number) => {
    setSubmittedReviews(prev => ({ ...prev, [id]: { rating, text: reviewText } }));
    setReviewingId(null);
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const removeSaved = (id: string) => {
    setSavedInstitutes(prev => prev.filter(i => i !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
      case 'Scheduled': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'Completed': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-[#0b1120] pb-24">
      {/* Hero / Greeting Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back, Ayush!
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  Class 10 (CBSE)
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Motihari
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-3"
            >
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-colors">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'batches', label: 'My Batches', icon: Layers },
              { id: 'materials', label: 'Resources', icon: Book },
              { id: 'notices', label: 'Notices', icon: Bell },
              { id: 'saved', label: 'Shortlist', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${tab.id === 'saved' && activeTab === 'saved' ? 'fill-rose-500 text-rose-500' : ''}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* My Demo Requests */}
                  <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  My Demo Requests
                </h2>
                <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-0.5" />
                </a>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {MockDemos.map((demo) => (
                  <React.Fragment key={demo.id}>
                  <motion.div variants={itemVariants} className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base">{demo.institute}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(demo.status)}`}>
                          {demo.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{demo.course}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {demo.date}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {demo.time}</div>
                      </div>
                    </div>
                    <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2">
                      {demo.status === 'Scheduled' && (
                        <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
                          <Video className="w-4 h-4" /> Join Meeting
                        </button>
                      )}
                      {demo.status === 'Pending' && (
                        <button className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" /> Reschedule
                        </button>
                      )}
                      {demo.status === 'Completed' && !submittedReviews[demo.id] && reviewingId !== demo.id && (
                        <button 
                          onClick={() => handleOpenReview(demo.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" /> Leave a Review
                        </button>
                      )}
                      {demo.status === 'Completed' && submittedReviews[demo.id] && (
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= submittedReviews[demo.id].rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle className="w-3 h-3" /> Thank you!
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Inline Review Component */}
                  {reviewingId === demo.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10"
                    >
                      <div className="max-w-xl">
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                          How was your experience?
                        </label>
                        <div className="flex items-center gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 -ml-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                            >
                              <Star 
                                className={`w-7 h-7 ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                              />
                            </button>
                          ))}
                        </div>
                        
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                          Write your review <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          placeholder="What did you like or dislike?"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none min-h-[100px] mb-4"
                        />
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSubmitReview(demo.id)}
                            disabled={rating === 0}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => setReviewingId(null)}
                            className="px-5 py-2.5 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </React.Fragment>
                ))}
              </div>
            </section>
          </motion.div>
        )}

              {activeTab === 'batches' && (
                <motion.div
                  key="batches"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Batches</h2>
                    <button className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">Find More Batches</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeBatches.map(batch => (
                      <div key={batch.id} className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="aspect-video w-full relative">
                          <img src={batch.image} alt={batch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                            {batch.subject}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{batch.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{batch.institute}</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                          
                          <div className="mt-6 space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500 dark:text-slate-400">Course Progress</span>
                                <span className="text-blue-600">{batch.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${batch.progress}%` }}
                                  className="h-full bg-blue-600 rounded-full"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next Session</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{batch.nextClass}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'materials' && (
                <motion.div
                  key="materials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Resources</h2>
                    <div className="flex items-center gap-2">
                       <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"><Search className="w-4 h-4" /></button>
                       <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"><Filter className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {resources.map(file => (
                      <div key={file.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${file.type === 'PDF' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{file.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-400">
                              <span className="uppercase tracking-widest">{file.type}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span>{file.size}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span>Added {file.date}</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 rounded-2xl transition-all shadow-sm">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notices' && (
                <motion.div
                  key="notices"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notice Board</h2>
                  </div>
                  {notices.map(notice => (
                    <div key={notice.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-blue-500/50 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded-md">{notice.institute}</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">{notice.date}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{notice.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{notice.description}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500">
                           <Bell className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                       Saved Institutes
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedInstitutes.length === 0 ? (
                      <div className="col-span-full bg-white dark:bg-slate-900 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                           <Heart className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your shortlist is empty</h3>
                        <p className="text-slate-500 text-sm mt-1">Explore institutes and heart them to see them here.</p>
                        <Link to="/" className="inline-block mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Start Browsing</Link>
                      </div>
                    ) : (
                      savedInstitutes.map((inst) => (
                        <motion.div 
                          key={inst.id} variants={itemVariants}
                          className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group p-5 transition-all duration-300 hover:shadow-xl"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                               <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain mix-blend-darken dark:mix-blend-screen" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight truncate leading-tight group-hover:text-blue-600 transition-colors">
                                 <Link to={`/institute/${inst.id}`}>{inst.name}</Link>
                               </h4>
                               <div className="flex items-center gap-3 mt-1.5">
                                 <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                   <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
                                   {inst.distance}
                                 </div>
                                 <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                   <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                                   {inst.rating} ({inst.reviewCount})
                                 </div>
                               </div>
                            </div>
                            <button 
                              onClick={() => removeSaved(inst.id)}
                              className="p-2 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:scale-110 transition-all"
                            >
                              <Heart className="w-5 h-5 fill-rose-500" />
                            </button>
                          </div>
                          
                          <div className="mt-6 flex items-center gap-2">
                             <button 
                               onClick={() => toggleCompare(inst.id)}
                               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all ${
                                 compareList.includes(inst.id) 
                                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                   : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                               }`}
                             >
                               {compareList.includes(inst.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                               {compareList.includes(inst.id) ? 'In Compare' : 'Compare'}
                             </button>
                             <Link 
                               to={`/institute/${inst.id}`}
                               className="flex-1 text-center py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                             >
                               View Details
                             </Link>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Learning Preferences
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Target Exam / Board</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">CBSE Boards</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Class focus</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Class 10 (Foundation)</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Max Distance</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">5 km radius</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Preferred Timing</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Evening (4 PM - 8 PM)</div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
                    Update Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </main>
  );
}
