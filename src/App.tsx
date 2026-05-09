import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, User, Sun, Moon, Search, X, SlidersHorizontal, ArrowLeft, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Home from './pages/Home';
import InstituteDetail from './pages/InstituteDetail';
import BatchDetail from './pages/BatchDetail';
import Dashboard from './pages/Dashboard';
import MasterDashboard from './pages/master/Dashboard';
import SubAdminDashboard from './pages/subadmin/Dashboard';
import Chatbot from './components/Chatbot';
import OnboardingManager from './components/OnboardingManager';
import WelcomeScreen from './components/WelcomeScreen';
import { UserProvider, useUser } from './contexts/UserContext';
import { supabase } from './lib/supabase';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

function Navigation({ user, handleSignOut }: { user: any; handleSignOut: () => void }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('search') || '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(val)}`);
    } else {
      setSearchParams(prev => {
        if (val) prev.set('search', val);
        else prev.delete('search');
        return prev;
      }, { replace: true });
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="fixed top-2 md:top-4 left-0 right-0 z-50 px-3 md:px-8 pointer-events-none">
      <header className="max-w-7xl mx-auto pointer-events-auto">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800/40 rounded-2xl md:rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-3 md:px-5 py-2 md:py-2.5 flex items-center justify-between gap-3 md:gap-4 transition-all duration-300">
          <AnimatePresence mode="wait">
            {!(isSearchOpen || searchQuery) ? (
              <motion.a 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                href="/" 
                className="flex items-center gap-2 md:gap-2.5 hover:opacity-80 transition-opacity shrink-0 group min-w-0"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-base md:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">Coaching Direct</span>
              </motion.a>
            ) : (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchParams(prev => { prev.delete('search'); return prev; });
                }}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex-1 flex items-center justify-end gap-1.5 md:gap-3 overflow-hidden">
            {/* Search Bar */}
            <div className={`flex items-center transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-slate-100/50 dark:bg-slate-800/40 rounded-xl md:rounded-2xl px-2.5 md:px-4 py-1.5 md:py-2 ${isSearchOpen || searchQuery ? 'flex-1 max-w-xl ring-2 ring-blue-500/10' : 'w-10 overflow-hidden'}`}>
              <button 
                onClick={toggleSearch}
                className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Search"
              >
                <Search className={`w-5 h-5 transition-transform duration-300 ${isSearchOpen ? 'scale-90' : 'scale-100'}`} />
              </button>
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Find your future academy..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`bg-transparent border-none focus:ring-0 text-[15px] dark:text-white placeholder-slate-400 w-full ml-2 transition-opacity duration-300 ${isSearchOpen || searchQuery ? 'opacity-100' : 'opacity-0'}`}
              />
              {(isSearchOpen || searchQuery) && (
                <button 
                  onClick={() => {
                    setSearchParams(prev => { prev.delete('search'); return prev; });
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <nav className="flex items-center gap-1 md:gap-1.5 shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all rounded-xl md:rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
              
              {user ? (
                <div className="flex items-center gap-1.5 md:gap-3">
                  <a href={user.role === 'MASTER' ? '/master' : user.role === 'SUB_ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 hover:opacity-90 transition-all group shrink-0 ml-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[15px] font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform border-2 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span>{(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-none">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{user.role || 'User'}</span>
                    </div>
                  </a>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-xl md:rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5 transition-transform hover:scale-110" />
                  </button>
                </div>
              ) : (
                <a 
                  href="/user/login" 
                  className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  title="Sign In / Guest"
                >
                  <User className="w-5 h-5" />
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}

function GlobalFooter() {
  return (
    <footer className="w-full py-8 md:py-12 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
          
          <div className="mt-4 md:mt-0 flex shrink-0">
            <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/[0.08] to-purple-500/[0.08] dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-500/10 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-semibold tracking-wide shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]">
              <span className="opacity-70 text-xs uppercase tracking-widest font-bold">Developed by</span>
              AYUSH
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-left text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Coaching Direct. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { user, profile, loading, signOut } = useUser();
  const [theme, setTheme] = useState('light');
  const [onboardingPending, setOnboardingPending] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (isDark ? 'dark' : 'light');
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (user && profile && !profile.onboarding_completed) {
      setOnboardingPending(true);
    } else if (user && profile && !profile.tour_completed) {
      setOnboardingPending(true);
    } else {
      setOnboardingPending(false);
    }
  }, [user, profile]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <WelcomeScreen isLoading={loading} />
        <ScrollToTop />
        <div className="min-h-screen bg-apple-gray dark:bg-slate-950 text-apple-text dark:text-slate-300 font-sans flex flex-col selection:bg-apple-blue/20 dark:selection:bg-blue-500/30 relative transition-colors duration-300">
          <Navigation user={user} handleSignOut={signOut} />
          
          <AnimatePresence>
            {user && onboardingPending && (
              <OnboardingManager 
                user={user} 
                onComplete={() => setOnboardingPending(false)} 
              />
            )}
          </AnimatePresence>

          <main className="flex-1 pt-20 md:pt-24 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/institute/:id" element={<InstituteDetail />} />
              <Route path="/batch/:id" element={<BatchDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/master/*" element={<MasterDashboard />} />
              <Route path="/admin/*" element={<SubAdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <GlobalFooter />
          <Chatbot />
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
