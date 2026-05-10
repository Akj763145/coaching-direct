import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createRazorpayOrder } from '../actions/payment';
import { verifyAndEnroll } from '../actions/enrollment';
import { supabase } from '../lib/supabase';

interface EnrollmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batchDetails: {
    id: string;
    name: string;
    price: number | null;
    faculty?: string;
  } | null;
}

export default function EnrollmentDrawer({ isOpen, onClose, batchDetails }: EnrollmentDrawerProps) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [couponMessage, setCouponMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth and Profile states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Profile Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [educationLevel, setEducationLevel] = useState('High School');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state when opening
      setCouponCode('');
      setDiscountAmount(0);
      setCouponStatus('idle');
      setCouponMessage('');
      checkAuth();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  async function checkAuth() {
    setIsLoadingAuth(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('phone_number, education_level')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.phone_number && profile?.education_level) {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
          if (profile?.phone_number) setPhoneNumber(profile.phone_number);
          if (profile?.education_level) setEducationLevel(profile.education_level);
        }
      } else {
        setIsAuthenticated(false);
        setIsProfileComplete(false);
      }
    } catch (err) {
      console.error('Error checking auth state:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(`Sign in error: ${error.message}`);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !educationLevel.trim()) return;

    setIsSavingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const { error } = await supabase.from('student_profiles').upsert({
        id: session.user.id,
        phone_number: phoneNumber,
        education_level: educationLevel,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setIsProfileComplete(true);
    } catch (error: any) {
      alert(`Failed to save profile: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!batchDetails) return null;

  const basePrice = batchDetails.price || 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponStatus('loading');
    setCouponMessage('');
    
    // Simulate API call
    setTimeout(() => {
      const validCodes: Record<string, { type: 'percentage' | 'flat', value: number }> = {
        'DIWALI20': { type: 'percentage', value: 20 },
        'FLAT500': { type: 'flat', value: 500 }
      };

      const code = validCodes[couponCode.trim().toUpperCase()];
      
      if (code) {
         let calcDiscount = 0;
         if (code.type === 'percentage') {
           calcDiscount = (basePrice * code.value) / 100;
         } else {
           calcDiscount = code.value;
         }
         
         calcDiscount = Math.min(calcDiscount, basePrice);
         
         setDiscountAmount(calcDiscount);
         setCouponStatus('success');
         setCouponMessage(`₹${calcDiscount.toLocaleString('en-IN')} saved!`);
      } else {
         setDiscountAmount(0);
         setCouponStatus('error');
         setCouponMessage('Invalid or expired code');
      }
    }, 600);
  };

  const handlePayment = async () => {
    if (!batchDetails) return;
    
    if (finalPrice <= 0) {
      alert('Enrolled successfully! (Amount was ₹0)');
      onClose();
      return;
    }

    setIsProcessing(true);
    
    try {
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your connection.');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const order = await createRazorpayOrder(finalPrice, batchDetails.id);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key_id',
        amount: order.amount,
        currency: "INR",
        name: "Coaching Direct",
        description: `Enrollment for ${batchDetails.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            if (!userId) throw new Error('Not authenticated');
            await verifyAndEnroll(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              userId,
              batchDetails.id,
              finalPrice
            );
            alert('Payment Successful! Welcome to the batch.');
            onClose();
            navigate('/dashboard');
          } catch(err: any) {
            console.error(err);
            alert(`Payment verification failed: ${err.message}`);
          }
        },
        prefill: {
          name: session?.user?.user_metadata?.full_name || "Student Name",
          email: session?.user?.email || "student@example.com",
          contact: phoneNumber || "9999999999"
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed', response.error);
        alert('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      alert(`Failed to initiate payment: ${error.message || 'Please try again'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ y: '100%', scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mb-4 sm:hidden" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Enrollment Summary</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 -mx-6 px-6 pb-20 custom-scrollbar">
                
                {isLoadingAuth ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-neutral-500 font-medium">Checking authorization...</p>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                      <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Sign in to Enroll</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-[280px]">
                      You need to be logged in to your account to enroll in {batchDetails.name}.
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="w-full relative flex items-center justify-center gap-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 font-bold py-3.5 px-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-750 active:scale-[0.98] transition-all shadow-sm"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-5 h-5" />
                      Continue with Google
                    </button>
                  </div>
                ) : !isProfileComplete ? (
                  <div className="py-4">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Almost there!</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                      We need a few more details to complete your profile before you can enroll.
                    </p>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+91"
                          className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white font-medium"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                          Class Level
                        </label>
                        <select
                          required
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white font-medium appearance-none cursor-pointer"
                        >
                          <option value="High School">High School</option>
                          <option value="Under Grad">Under Grad</option>
                          <option value="Post Grad">Post Grad</option>
                        </select>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSavingProfile || !phoneNumber.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-75 disabled:active:scale-100"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          'Save & Continue'
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight border-b border-neutral-100 dark:border-neutral-800 pb-4">
                      {batchDetails.name}
                    </h3>

                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700/50 mb-6 transition-all">
                      <div className="flex items-center justify-between font-medium text-neutral-600 dark:text-neutral-300 mb-3">
                        <span>Course Fee</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">₹{basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <AnimatePresence>
                        {discountAmount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="flex items-center justify-between font-medium text-emerald-600 dark:text-emerald-400 overflow-hidden"
                          >
                            <span>Discount</span>
                            <span className="font-semibold">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-between font-bold text-neutral-900 dark:text-white text-lg transition-all">
                        <span>Total Amount</span>
                        <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <form onSubmit={handleApplyCoupon} className="mb-6">
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        Have a coupon code?
                      </label>
                      <div className={`relative group flex items-center border rounded-xl overflow-hidden transition-all ${
                        couponStatus === 'success' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                        couponStatus === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-500/10' :
                        'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
                      }`}>
                        <Tag className={`absolute left-4 w-4 h-4 transition-colors ${
                          couponStatus === 'success' ? 'text-emerald-500' :
                          couponStatus === 'error' ? 'text-red-500' :
                          'text-neutral-400 group-focus-within:text-blue-500'
                        }`} />
                        <input
                          type="text"
                          placeholder="Enter code here"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponStatus !== 'idle') {
                              setCouponStatus('idle');
                              setCouponMessage('');
                            }
                          }}
                          className="w-full pl-11 pr-24 py-3.5 bg-transparent outline-none transition-all dark:text-white font-medium uppercase placeholder:normal-case"
                        />
                        <button
                          type="submit"
                          disabled={!couponCode.trim() || couponStatus === 'loading'}
                          className={`absolute right-2 px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
                            couponStatus === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30' :
                            couponStatus === 'error' ? 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30' :
                            'bg-neutral-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-800'
                          }`}
                        >
                          {couponStatus === 'loading' ? 'Applying...' : couponStatus === 'success' ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                      <AnimatePresence>
                        {couponMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className={`text-sm mt-2 font-medium ${
                              couponStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {couponMessage}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </>
                )}
              </div>

              {!isLoadingAuth && isAuthenticated && isProfileComplete && (
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto bg-white dark:bg-neutral-900 absolute bottom-0 left-0 right-0 p-6 sm:static sm:p-0 sm:border-0 sm:bg-transparent">
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-6 sm:mt-0 disabled:opacity-75 disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Securely connecting...</span>
                      </>
                    ) : (
                      `Proceed to Pay ₹${finalPrice.toLocaleString('en-IN')}`
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>🔒 Safe & Secure Payments</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
