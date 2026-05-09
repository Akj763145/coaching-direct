import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Calendar, BookOpen, Phone, Check, 
  ArrowRight, X, Sparkles, Target, Star,
  Search, Bookmark, MessageSquare
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

interface OnboardingManagerProps {
  user: any;
  onComplete: () => void;
}

export default function OnboardingManager({ onComplete }: OnboardingManagerProps) {
  const { user, profile, loading: userLoading, updateProfile } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    age: '',
    education_level: 'highschool',
    phone_number: ''
  });

  useEffect(() => {
    if (userLoading) return;
    
    if (!profile || !profile.onboarding_completed) {
      setShowForm(true);
    } else if (!profile.tour_completed) {
      setShowTour(true);
    } else {
      onComplete();
    }
    setLoading(false);
  }, [userLoading, profile, onComplete]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        age: parseInt(formData.age),
        education_level: formData.education_level,
        phone_number: formData.phone_number,
        onboarding_completed: true
      });
      
      setShowForm(false);
      setShowTour(true);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteTour = async () => {
    try {
      await updateProfile({ tour_completed: true });
      
      setShowTour(false);
      onComplete();
    } catch (err) {
      console.error('Error updating tour status:', err);
      // Still complete it locally
      setShowTour(false);
      onComplete();
    }
  };

  const tourSteps = [
    {
      title: "Discover Best Institutes",
      description: "Search and filter through hundreds of top-rated coaching institutes near you.",
      icon: <Search className="w-8 h-8 text-blue-500" />,
      highlight: "search-bar"
    },
    {
      title: "Save for Later",
      description: "Bookmark institutes and batches you're interested in to compare them later.",
      icon: <Bookmark className="w-8 h-8 text-purple-500" />,
      highlight: "save-btn"
    },
    {
      title: "Smart Batches",
      description: "Check schedules, teacher ratings, and fee structures all in one place.",
      icon: <Target className="w-8 h-8 text-orange-500" />,
      highlight: "batch-list"
    },
    {
      title: "Verified Reviews",
      description: "Read honest feedback from real students to make the right choice.",
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      highlight: "review-section"
    }
  ];

  if (loading || (!showForm && !showTour)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            key="onboarding-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Sparkles className="w-24 h-24 text-blue-500" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Profile</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                We'll use this to personalize your journey and suggest the best institutes for your goals.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ayush Kumar"
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
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
                        value={formData.age}
                        onChange={e => setFormData({ ...formData, age: e.target.value })}
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
                        value={formData.phone_number}
                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
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
                          formData.education_level === level.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="education"
                          value={level.id}
                          checked={formData.education_level === level.id}
                          onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.education_level === level.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}>
                          {formData.education_level === level.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="font-semibold text-sm">{level.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {saving ? 'Saving Details...' : 'Save & Start Tour'}
                  {!saving && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {showTour && (
          <motion.div
            key="app-tour"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-10 shadow-2xl relative text-center"
          >
            <button 
              onClick={handleCompleteTour}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              key={tourStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-slate-100 dark:ring-slate-700">
                {tourSteps[tourStep].icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {tourSteps[tourStep].title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 leading-relaxed">
                {tourSteps[tourStep].description}
              </p>
            </motion.div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === tourStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCompleteTour}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Skip
                </button>
                <button 
                  onClick={() => {
                    if (tourStep < tourSteps.length - 1) {
                      setTourStep(tourStep + 1);
                    } else {
                      handleCompleteTour();
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {tourStep < tourSteps.length - 1 ? 'Next' : 'Get Started'}
                  {tourStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
