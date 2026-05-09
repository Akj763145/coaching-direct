import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Edit, MapPin, 
  Target, Heart, CheckSquare, Square, ChevronRight,
  BookOpen, Star, LayoutGrid, Layers, FileText, Book,
  Bell, Search, Filter, Download, LogOut, Loader2,
  X, Phone, Check, ArrowRight, User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

const MockSavedInstitutes: any[] = [];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut: userSignOut } = useUser();
  const [isSignOutLoading, setIsSignOutLoading] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    full_name: '',
    age: '',
    education_level: 'highschool',
    phone_number: ''
  });

  React.useEffect(() => {
    if (profile) {
      setEditFormData({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        education_level: profile.education_level || 'highschool',
        phone_number: profile.phone_number || ''
      });
    }
  }, [profile]);
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

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await userSignOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        full_name: editFormData.full_name,
        age: parseInt(editFormData.age),
        education_level: editFormData.education_level,
        phone_number: editFormData.phone_number,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const removeSaved = (id: string) => {
    setSavedInstitutes(prev => prev.filter(i => i !== id));
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
                Welcome back, {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Ayush'}!
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  {profile?.education_level 
                    ? profile.education_level === 'highschool' ? 'High School' 
                    : profile.education_level === 'undergraduate' ? 'Under Graduate' 
                    : 'Post Graduate'
                    : user?.user_metadata?.class || 'Class 10 (CBSE)'}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user?.user_metadata?.city || 'Motihari'}
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap gap-3"
            >
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button 
                onClick={handleSignOut}
                disabled={isSignOutLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 shadow-sm transition-all disabled:opacity-50"
              >
                {isSignOutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Sign Out
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

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                  Keep your information up to date to get the best recommendations.
                </p>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. Ayush Kumar"
                        value={editFormData.full_name}
                        onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="number"
                          placeholder="16"
                          value={editFormData.age}
                          onChange={e => setEditFormData({ ...editFormData, age: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="tel"
                          placeholder="10 digit number"
                          value={editFormData.phone_number}
                          onChange={e => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Current Class</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'highschool', label: 'High School' },
                        { id: 'undergraduate', label: 'Under Graduate' },
                        { id: 'postgraduate', label: 'Post Graduate' }
                      ].map(level => (
                        <label
                          key={level.id}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            editFormData.education_level === level.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="education"
                            value={level.id}
                            checked={editFormData.education_level === level.id}
                            onChange={e => setEditFormData({ ...editFormData, education_level: e.target.value })}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            editFormData.education_level === level.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}>
                            {editFormData.education_level === level.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-semibold text-sm">{level.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Update Profile
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  {/* Insights / Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                        <Layers className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Enrolled Batches</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">2</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                        <Book className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Study Materials</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">15</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/40 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                        <Heart className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Shortlisted</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{savedInstitutes.length}</p>
                    </div>
                  </div>
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
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Full Name</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{profile?.full_name || user?.user_metadata?.full_name || 'Not Set'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Education Level</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile?.education_level 
                      ? profile.education_level === 'highschool' ? 'High School' 
                      : profile.education_level === 'undergraduate' ? 'Under Graduate' 
                      : 'Post Graduate'
                      : 'Not Set'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Age</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{profile?.age || 'Not Set'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone Number</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{profile?.phone_number || 'Not Set'}</div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
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
