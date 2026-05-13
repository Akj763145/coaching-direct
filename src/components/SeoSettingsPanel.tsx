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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
            <Layout className="w-5 h-5 text-purple-500" />
            SEO Configuration
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Site Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VidyaNation - Find Your Best Institute"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-slate-200"
              />
              <p className="text-[11px] text-slate-500">Recommended: 50-60 characters</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Meta Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your platform offers..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-slate-200 resize-none"
              />
              <div className="flex justify-between items-center text-[11px]">
                <span className={description.length > 160 ? 'text-red-400' : 'text-slate-500'}>
                  Character Count: {description.length}
                </span>
                <span className="text-slate-500">Recommended: 150-160 characters</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Primary Keywords</label>
              <input 
                type="text" 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="institute, coaching, education, exams"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-slate-200"
              />
              <p className="text-[11px] text-slate-500">Separate keywords with commas</p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-xl border border-emerald-400/20"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Settings saved successfully! Platform metadata updated.</span>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Failed to save settings. Please try again.</span>
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <Search className="w-48 h-48 text-white" />
          </div>

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
            <Globe className="w-5 h-5 text-emerald-500" />
            Live Search Preview
          </h2>

          <div className="space-y-8 relative z-10">
            <p className="text-xs text-slate-500 italic">This is how your site might appear in Google Search results:</p>
            
            {/* Google Result Mimic */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                   <Globe className="w-full h-full text-slate-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-[#81c995] truncate font-medium">https://vidyanation.com</span>
                  <span className="text-[10px] text-slate-500 leading-none">VidyaNation › Home</span>
                </div>
              </div>
              <h3 className="text-[#8ab4f8] text-lg font-normal mb-1 hover:underline cursor-pointer truncate">
                {title || 'Site Title will appear here'}
              </h3>
              <p className="text-[#bdc1c6] text-sm leading-relaxed line-clamp-2">
                {description || 'Your meta description will be displayed here in search results. Make it catchy to improve click-through rates.'}
              </p>
            </div>

            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/50">
              <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">SEO Health Check</h4>
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
            
            <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-purple-400 font-bold">Pro Tip:</span> Ensure your primary keywords are included in both the title and the first 100 characters of your description for optimal indexing.
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
    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-slate-800/50">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className={`text-[10px] font-mono ${isValid ? 'text-emerald-500' : 'text-amber-500'}`}>{value}</span>
    </div>
  );
}
