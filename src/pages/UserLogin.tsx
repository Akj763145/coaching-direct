import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, User, Globe, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UserLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in via Supabase
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('user_token', session.access_token);
        localStorage.setItem('user_role', 'USER');
        navigate('/');
      }
    };
    checkUser();

    // Listen for auth state changes (especially after OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('user_token', session.access_token);
        localStorage.setItem('user_role', 'USER');
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin.includes('localhost') 
            ? 'https://ais-dev-kumbynxsgsmd2ffqhsuzrf-653632020489.asia-southeast1.run.app'
            : window.location.origin
        }
      });

      if (error) throw error;
      
      // Note: The page will redirect to Google's login consent screen
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to Google. Please check your configuration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4 py-12 bg-apple-gray">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-apple-border/50 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-apple-blue/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 shadow-apple-blue/20"
              >
                <GraduationCap className="w-9 h-9" />
              </motion.div>
              <h1 className="text-3xl font-bold text-apple-text tracking-tight mb-2">Welcome Back</h1>
              <p className="text-[15px] text-apple-text-muted text-center max-w-[280px]">
                Sign in to your student account to discover and track coaching institutes.
              </p>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                disabled={isLoading || isSuccess}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGoogleLogin}
                className={`w-full flex items-center justify-center gap-3 border font-medium py-3.5 rounded-2xl transition-all duration-300 shadow-sm ${
                  isSuccess 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-apple-border hover:bg-apple-gray/50 text-apple-text'
                } disabled:opacity-80 disabled:cursor-not-allowed`}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Authenticated</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                      <span>Continue with Google</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-apple-border/60"></div>
                </div>
                <div className="relative flex justify-center text-[13px] uppercase tracking-wider font-semibold">
                  <span className="bg-white px-4 text-apple-text-muted/60">Coming Soon</span>
                </div>
              </div>

              <div className="space-y-3 opacity-50 pointer-events-none">
                <div className="flex items-center gap-3 bg-apple-gray/20 border border-transparent p-4 rounded-2xl">
                  <Globe className="w-5 h-5 text-apple-text-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Apple ID</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <div className="bg-apple-blue/5 p-4 rounded-2xl border border-apple-blue/10">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-apple-blue" />
                  </div>
                  <p className="text-[13px] text-apple-text leading-relaxed">
                    By continuing, you agree to Coacher's <span className="font-semibold cursor-pointer hover:underline">Terms of Service</span> and <span className="font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[13px] font-medium text-apple-blue hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  Are you an institute admin? <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-apple-text-muted">
          Don't have an account? <span className="text-apple-blue font-semibold hover:underline cursor-pointer">Sign up</span>
        </p>
      </motion.div>
    </div>
  );
}
