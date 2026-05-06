import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Clock, CheckCircle, Video, Edit, MapPin, 
  Target, Heart, CheckSquare, Square, ChevronRight,
  BookOpen, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MockDemos = [
  {
    id: 1,
    institute: 'Future Will Academy',
    course: 'Science Foundation',
    date: 'May 12, 2026',
    time: '10:00 AM',
    status: 'Pending',
  },
  {
    id: 2,
    institute: 'Rajesh Classes',
    course: 'Math Mastery',
    date: 'May 10, 2026',
    time: '04:00 PM',
    status: 'Scheduled',
  },
  {
    id: 3,
    institute: 'Aim Institute',
    course: 'Chemistry Basics',
    date: 'May 01, 2026',
    time: '02:00 PM',
    status: 'Completed',
  }
];

const MockSavedInstitutes = [
  {
    id: 'fwa-1',
    name: 'Future Will Academy',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=FW&backgroundColor=0ea5e9',
    distance: '2.5 km',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'sg-2',
    name: 'Saraswati Gyan Mandir',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SG&backgroundColor=f59e0b',
    distance: '3.1 km',
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: 'vk-3',
    name: 'Vidya Kendra',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=VK&backgroundColor=10b981',
    distance: '1.8 km',
    rating: 4.9,
    reviewCount: 204,
  }
];

export default function Dashboard() {
  const [compareList, setCompareList] = React.useState<string[]>([]);
  const [savedInstitutes, setSavedInstitutes] = React.useState(MockSavedInstitutes);

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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
          >
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-colors">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* My Demo Requests */}
            <motion.section 
              initial="hidden" animate="show" variants={containerVariants}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
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
            </motion.section>

            {/* Saved Institutes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Saved Institutes
                </h2>
              </div>
              <motion.div 
                initial="hidden" animate="show" variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {savedInstitutes.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                    <p className="text-slate-500 text-sm">No saved institutes yet.</p>
                  </div>
                ) : (
                  savedInstitutes.map((inst) => (
                    <motion.div 
                      key={inst.id} variants={itemVariants}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-row items-center gap-3 p-3 transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                         <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain mix-blend-darken dark:mix-blend-screen scale-100 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                         <h4 className="font-semibold text-slate-900 dark:text-white text-[15px] tracking-tight truncate pr-2 leading-tight">
                           <Link to={`/institute/${inst.id}`} className="hover:text-blue-600 transition-colors">{inst.name}</Link>
                         </h4>
                         <div className="flex items-center gap-2 mt-1">
                           <div className="flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                             <MapPin className="w-3 h-3 mr-0.5" />
                             {inst.distance}
                           </div>
                           <div className="flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                             <Star className="w-3 h-3 mr-0.5 text-amber-500 fill-amber-500" />
                             {inst.rating} ({inst.reviewCount})
                           </div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button 
                          onClick={() => removeSaved(inst.id)}
                          className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors"
                          title="Remove from Shortlist"
                        >
                          <Heart className="w-4 h-4 fill-rose-500" />
                        </button>
                        <button 
                          onClick={() => toggleCompare(inst.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${
                            compareList.includes(inst.id) 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {compareList.includes(inst.id) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{compareList.includes(inst.id) ? 'Added' : 'Compare'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </section>
            
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
