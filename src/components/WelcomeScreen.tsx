import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  isLoading?: boolean;
}

export default function WelcomeScreen({ isLoading }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Check if we've already shown the welcome screen in this session
    const hasShown = sessionStorage.getItem('welcome_shown');
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    // Sequence: 1. Show content, 2. Wait minimum time
    const contentTimer = setTimeout(() => setShowContent(true), 100);
    const minTimeTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(minTimeTimer);
    };
  }, []);

  useEffect(() => {
    // Hide ONLY when:
    // 1. Min animation time has passed (2.5s)
    // 2. App loading is done (if provided)
    // 3. Welcome screen is currently visible
    if (minTimeElapsed && !isLoading && isVisible) {
      setIsVisible(false);
      sessionStorage.setItem('welcome_shown', 'true');
    }
  }, [minTimeElapsed, isLoading, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={showContent ? { scale: 1, opacity: 1 } : {}}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 mb-8 relative group"
            >
              <div className="absolute inset-0 bg-white/20 rounded-[32px] animate-pulse group-hover:scale-110 transition-transform" />
              <GraduationCap className="w-12 h-12 md:w-16 md:h-16 relative z-10" />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-blue-500/20 rounded-[40px]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-indigo-500/10 rounded-[48px]"
              />
            </motion.div>

            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: 100 }}
                animate={showContent ? { y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3"
              >
                CoachingDirect
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-blue-500 animate-pulse" />
              </motion.h1>
            </div>

            <div className="overflow-hidden">
              <motion.p
                initial={{ y: 50 }}
                animate={showContent ? { y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl tracking-tight"
              >
                Your Future, Our Guidance.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={showContent ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-12 flex items-center gap-2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                  />
                ))}
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-2">
                Discovering Excellence
              </span>
            </motion.div>
          </div>

          {/* Bottom Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="absolute bottom-12 left-0 right-0 flex justify-center"
          >
            <div className="px-6 py-2 rounded-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Developed by <span className="text-blue-600 dark:text-blue-400">AYUSH</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
