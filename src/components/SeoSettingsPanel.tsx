import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Layout, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchSeoSettings, updateSeoSettings } from '../actions/seo';

export default function SeoSettingsPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchSeoSettings();
      setTitle(data.title || '');
      setDescription(data.description || '');
      setKeywords(data.keywords || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('idle');
    try {
      await updateSeoSettings(title, description, keywords);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column: Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Layout className="w-5 h-5 text-purple-600" />
            SEO Configuration
          </h2>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Site Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VidyaNation - Find Your Best Institute"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none text-slate-900 text-sm font-medium"
              />
              <p className="text-[11px] text-slate-500">Recommended: 50-60 characters</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your platform offers..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none text-slate-900 text-sm font-medium resize-none"
              />
              <div className="flex justify-between items-center text-[11px]">
                <span className={description.length > 160 ? 'text-red-500 font-bold' : 'text-slate-500'}>
                  Character Count: {description.length}
                </span>
                <span className="text-slate-500">Recommended: 150-160 characters</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Keywords</label>
              <input 
                type="text" 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="institute, coaching, education, exams"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none text-slate-900 text-sm font-medium"
              />
              <p className="text-[11px] text-slate-500">Separate keywords with commas</p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 mt-4"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium">Settings saved successfully! Platform metadata updated.</span>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200 mt-4"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span className="text-sm font-medium">Failed to save settings. Please try again.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Live Preview */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
            <Search className="w-48 h-48 text-slate-900" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            Live Search Preview
          </h2>

          <div className="space-y-8 relative z-10">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">This is how your site might appear in Google Search results</p>
            
            {/* Google Result Mimic - Light Theme */}
            <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
                   <Globe className="w-full h-full text-slate-600" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-slate-800 truncate font-medium">VidyaNation</span>
                  <span className="text-[10px] text-slate-500 leading-none">https://vidyanation.com</span>
                </div>
              </div>
              <h3 className="text-[#1a0dab] text-lg font-normal mb-1 hover:underline cursor-pointer truncate">
                {title || 'Site Title will appear here'}
              </h3>
              <p className="text-[#4d5156] text-sm leading-relaxed line-clamp-2">
                {description || 'Your meta description will be displayed here in search results. Make it catchy to improve click-through rates.'}
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">SEO Health Check</h4>
              <div className="space-y-3">
                <HealthIndicator 
                  label="Title Length" 
                  isValid={title.length >= 30 && title.length <= 60} 
                  value={`${title.length}/60`}
                />
                <HealthIndicator 
                  label="Description Length" 
                  isValid={description.length >= 120 && description.length <= 160} 
                  value={`${description.length}/160`}
                />
                <HealthIndicator 
                  label="Keywords density" 
                  isValid={keywords.split(',').filter(k => k.trim()).length >= 3} 
                  value={`${keywords.split(',').filter(k => k.trim()).length} tags`}
                />
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-[11px] text-purple-800 leading-relaxed font-medium">
                <span className="text-purple-600 font-bold uppercase tracking-wider text-[10px] mr-1 border-b border-purple-300 pb-0.5">Pro Tip</span> Ensure your primary keywords are included in both the title and the first 100 characters of your description for optimal indexing.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HealthIndicator({ label, isValid, value }: { label: string, isValid: boolean, value: string }) {
  return (
    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{value}</span>
    </div>
  );
}
