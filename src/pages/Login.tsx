import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        if (data.role === 'MASTER') navigate('/master');
        else if (data.role === 'SUB_ADMIN') navigate('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 bg-apple-gray dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-[400px] w-full bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-apple-border/40 dark:border-slate-800"
      >
        <div className="mb-8 text-center">
          <h2 className="text-[28px] font-semibold text-apple-text dark:text-white tracking-tight mb-2">Admin Portal</h2>
          <p className="text-[15px] text-apple-text-muted dark:text-slate-400">Sign in to manage your institute.</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-6 text-[14px] font-medium border border-red-100 dark:border-red-500/20 text-center"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-apple-text-muted dark:text-slate-300 ml-1">Username</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-apple-gray/50 dark:bg-slate-800 border border-apple-border/50 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all duration-300 text-[15px] dark:text-white"
              value={username} onChange={e => setUsername(e.target.value)} 
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-apple-text-muted dark:text-slate-300 ml-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-apple-gray/50 dark:bg-slate-800 border border-apple-border/50 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all duration-300 text-[15px] dark:text-white"
              value={password} onChange={e => setPassword(e.target.value)} 
              placeholder="Enter your password"
            />
          </div>
          <button 
            disabled={isLoading}
            type="submit" 
            className={`w-full text-white font-medium py-3 rounded-xl transition-colors duration-300 shadow-sm mt-2 flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-apple-blue dark:bg-blue-600 hover:bg-apple-blue-hover dark:hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-apple-border/30 dark:border-slate-800">
          <p className="text-[13px] text-apple-text-muted dark:text-slate-400 text-center leading-relaxed mb-4">
            First time? Master login is <br/><code className="bg-apple-gray dark:bg-slate-800 text-apple-text dark:text-slate-300 font-mono text-[12px] px-2 py-0.5 rounded-md border border-apple-border/40 dark:border-slate-700">admin</code> / <code className="bg-apple-gray dark:bg-slate-800 text-apple-text dark:text-slate-300 font-mono text-[12px] px-2 py-0.5 rounded-md border border-apple-border/40 dark:border-slate-700">admin123</code>
          </p>
          <button 
            type="button"
            onClick={() => navigate('/user/login')}
            className="w-full text-[13px] font-medium text-apple-blue dark:text-blue-400 hover:text-apple-blue-hover dark:hover:text-blue-300 hover:underline py-2 rounded-lg border border-apple-blue/10 dark:border-blue-500/20 bg-apple-blue/5 dark:bg-blue-500/10 transition-all duration-300"
          >
            Looking for Student Login? Sign in with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
