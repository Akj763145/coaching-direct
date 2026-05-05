import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Login from './pages/Login';
import Home from './pages/Home';
import InstituteDetail from './pages/InstituteDetail';
import MasterDashboard from './pages/master/Dashboard';
import SubAdminDashboard from './pages/subadmin/Dashboard';
import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-apple-gray text-apple-text font-sans flex flex-col selection:bg-apple-blue/20 relative">
        <div className="sticky top-0 z-50 w-full px-3 pt-3 md:px-8 md:pt-6 pointer-events-none">
          <header className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-2.5 px-4 md:py-3 md:px-6 rounded-[20px] md:rounded-[24px] flex items-center justify-between pointer-events-auto transition-all duration-300">
            <a href="/" className="text-lg md:text-xl font-bold tracking-tight text-apple-text flex items-center gap-2 md:gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-apple-blue rounded-[9px] md:rounded-[10px] flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              Coacher
            </a>
            <nav className="flex items-center gap-3 md:gap-6">
              <a href="/" className="text-sm font-medium text-apple-text-muted hover:text-apple-text transition-colors hidden md:block">Explore</a>
            </nav>
          </header>
        </div>
        
        <main className="flex-1 mt-1 md:mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/institute/:id" element={<InstituteDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/master/*" element={<MasterDashboard />} />
            <Route path="/admin/*" element={<SubAdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Chatbot />
      </div>
    </BrowserRouter>
  );
}
