import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, User, Sun, Moon, Search, X, SlidersHorizontal } from 'lucide-react';
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
import { supabase } from './lib/supabase';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

function Navigation() {
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
      <header className="max-w-7xl mx-auto pointer-events-auto">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl shadow-2xl shadow-blue-500/10 px-4 py-2.5 flex items-center justify-between gap-4">
          <AnimatePresence mode="wait">
            {!(isSearchOpen || searchQuery) && (
              <motion.a 
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                href="/" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 overflow-hidden whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Coacher</span>
              </motion.a>
            )}
          </AnimatePresence>

          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4 overflow-hidden">
            {/* Search Bar */}
            <div className={`flex items-center transition-all duration-300 ease-in-out bg-slate-100 dark:bg-slate-800/50 rounded-xl px-3 py-1.5 ${isSearchOpen || searchQuery ? 'flex-1 max-w-md' : 'w-10 overflow-hidden'}`}>
              <button 
                onClick={toggleSearch}
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`bg-transparent border-none focus:ring-0 text-sm dark:text-white placeholder-slate-400 w-full ml-2 transition-opacity duration-300 ${isSearchOpen || searchQuery ? 'opacity-100' : 'opacity-0'}`}
              />
              {(isSearchOpen || searchQuery) && (
                <button 
                  onClick={() => {
                    setSearchParams(prev => { prev.delete('search'); return prev; });
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <nav className="flex items-center gap-1 md:gap-2 shrink-0">
              {location.pathname === '/' && (
                <button
                  onClick={() => {
                    setSearchParams(prev => {
                      if (prev.get('filters') === 'open') prev.delete('filters');
                      else prev.set('filters', 'open');
                      return prev;
                    }, { replace: true });
                  }}
                  className={`p-2 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${searchParams.get('filters') === 'open' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                  aria-label="Filter"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {user ? (
                <a href="/dashboard" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                </a>
              ) : (
                <a 
                  href="/user/login" 
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm"
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
          &copy; {new Date().getFullYear()} Coacher Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (isDark ? 'dark' : 'light');
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

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
        <div className="min-h-screen bg-apple-gray dark:bg-slate-950 text-apple-text dark:text-slate-300 font-sans flex flex-col selection:bg-apple-blue/20 dark:selection:bg-blue-500/30 relative transition-colors duration-300">
          <Navigation />
          
          <main className="flex-1 mt-1 md:mt-4 w-full">
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
