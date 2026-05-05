import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, GraduationCap, ArrowLeft } from 'lucide-react';

export default function UserAuth() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token } = event.data;
        localStorage.setItem('token', token);
        navigate('/');
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, 'google_login_popup', 'width=500,height=600');
      } else {
        setError(data.error || 'Failed to initialize Google login');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-apple-blue/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-apple-blue/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[400px] w-full bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-16 h-16 bg-apple-blue rounded-[20px] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,113,227,0.3)] mb-6 cursor-pointer"
          >
             <GraduationCap className="w-8 h-8" />
          </motion.div>
          
          <h1 className="text-[28px] font-semibold text-apple-text tracking-tight mb-2">Welcome to Coacher</h1>
          <p className="text-apple-text-muted text-[15px] leading-relaxed">
            Sign in to your account to explore batches and follow your favorite institutes.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-apple-red/5 border border-apple-red/20 rounded-2xl text-apple-red text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full group flex items-center justify-center gap-3 bg-white border border-apple-border/50 text-apple-text font-semibold py-4 rounded-2xl hover:bg-apple-gray transition-all duration-300 shadow-sm active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-10 pt-8 border-t border-apple-border/30">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 text-apple-text-muted hover:text-apple-text text-[13px] font-medium w-full transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
