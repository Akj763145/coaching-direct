import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Login from './pages/Login';
import Home from './pages/Home';
import InstituteDetail from './pages/InstituteDetail';
import MasterDashboard from './pages/master/Dashboard';
import SubAdminDashboard from './pages/subadmin/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-apple-gray text-apple-text font-sans flex flex-col selection:bg-apple-blue/20">
        <div className="sticky top-0 z-50 w-full px-4 pt-4 md:px-8 md:pt-6 pointer-events-none">
          <header className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-3 px-6 rounded-[24px] flex items-center justify-between pointer-events-auto transition-all duration-300">
            <a href="/" className="text-xl font-bold tracking-tight text-apple-text flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-apple-blue rounded-[10px] flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              Coacher
            </a>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-apple-text-muted hover:text-apple-text transition-colors hidden sm:block">Explore</a>
              <a href="/login" className="text-sm font-semibold text-apple-blue hover:text-apple-blue-hover transition-colors px-5 py-2.5 bg-apple-blue/5 rounded-full">Admin Portal</a>
            </nav>
          </header>
        </div>
        
        <main className="flex-1 mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/institute/:id" element={<InstituteDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/master/*" element={<MasterDashboard />} />
            <Route path="/admin/*" element={<SubAdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
