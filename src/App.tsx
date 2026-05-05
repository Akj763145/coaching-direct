import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GraduationCap, LogIn, User, Sun, Moon } from 'lucide-react';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Home from './pages/Home';
import InstituteDetail from './pages/InstituteDetail';
import BatchDetail from './pages/BatchDetail';
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full px-3 pt-3 md:px-8 md:pt-6 pointer-events-none">
      <header className="max-w-7xl mx-auto bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2.5 px-4 md:py-3 md:px-6 rounded-[20px] md:rounded-[24px] flex items-center justify-between pointer-events-auto transition-all duration-300">
        <a href="/" className="text-lg md:text-xl font-bold tracking-tight text-apple-text dark:text-white flex items-center gap-2 md:gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-apple-blue rounded-[9px] md:rounded-[10px] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          Coacher
        </a>
        <nav className="flex items-center gap-3 md:gap-6">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <a href="/" className="text-sm font-medium text-apple-text-muted dark:text-slate-400 hover:text-apple-text dark:hover:text-white transition-colors hidden md:block">Explore</a>
          
          {user ? (
            <div className="flex items-center gap-2 bg-apple-gray dark:bg-slate-800 text-apple-text dark:text-slate-200 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all duration-300">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              <span className="sm:hidden">Account</span>
            </div>
          ) : (
            <a 
              href="/user/login" 
              className="flex items-center gap-2 bg-apple-text dark:bg-blue-600 text-white dark:text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-apple-text/90 dark:hover:bg-blue-700 transition-all duration-300 shadow-sm shadow-apple-text/10 dark:shadow-blue-900/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </a>
          )}
        </nav>
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
