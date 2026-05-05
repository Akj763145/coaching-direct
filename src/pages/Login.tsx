import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 bg-apple-gray">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-[400px] w-full bg-white p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-apple-border/40"
      >
        <div className="mb-8 text-center">
          <h2 className="text-[28px] font-semibold text-apple-text tracking-tight mb-2">Admin Portal</h2>
          <p className="text-[15px] text-apple-text-muted">Sign in to manage your institute.</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-6 text-[14px] font-medium border border-red-100 text-center"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Username</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all duration-300 text-[15px]"
              value={username} onChange={e => setUsername(e.target.value)} 
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all duration-300 text-[15px]"
              value={password} onChange={e => setPassword(e.target.value)} 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="w-full bg-apple-blue text-white font-medium py-3 rounded-xl hover:bg-apple-blue-hover transition-colors duration-300 shadow-sm mt-2">
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-apple-border/30">
          <p className="text-[13px] text-apple-text-muted text-center leading-relaxed">
            First time? Master login is <br/><code className="bg-apple-gray text-apple-text font-mono text-[12px] px-2 py-0.5 rounded-md border border-apple-border/40">admin</code> / <code className="bg-apple-gray text-apple-text font-mono text-[12px] px-2 py-0.5 rounded-md border border-apple-border/40">admin123</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
