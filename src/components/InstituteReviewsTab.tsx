import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  student_id: string;
  student_name?: string;
  rating: number;
  review_text: string;
  batch_name?: string;
  created_at: string;
}

interface InstituteReviewsTabProps {
  instituteId: string;
  instituteName: string;
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
  onReviewAdded: () => void;
}

export const InstituteReviewsTab: React.FC<InstituteReviewsTabProps> = ({
  instituteId,
  instituteName,
  reviews,
  avgRating,
  totalReviews,
  onReviewAdded
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const handleSubmitReview = async () => {
    if (!newReview.text.trim()) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const studentId = session?.user?.id || 'anonymous';
      const studentName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous Student';

      const res = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institute_id: instituteId,
          student_id: studentId,
          student_name: studentName,
          rating: newReview.rating,
          review_text: newReview.text
        })
      });

      const data = await res.json();

      if (res.ok) {
        setNewReview({ rating: 5, text: '' });
        setShowReviewForm(false);
        onReviewAdded();
      } else if (res.status === 501) {
        toast.error('Reviews are currently only supported with a backend configuration.');
      } else {
        toast.error(`Error: ${data.error || 'Failed to submit review'}.`);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit review. Connectivity issue.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Rating Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        {/* Left Aspect: The Big Number */}
        <div className="flex flex-col items-center justify-center text-center md:border-r md:border-slate-100 dark:md:border-white/5 md:pr-12 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
              {Number(avgRating || 0).toFixed(1)}
            </span>
            <Star className="w-8 h-8 md:w-10 md:h-10 fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Based on {totalReviews} reviews
          </p>
          <div className="flex gap-0.5 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500' : 'fill-slate-100 text-slate-100 dark:fill-slate-800 dark:text-slate-800'}`} 
              />
            ))}
          </div>
        </div>

        {/* Right Aspect: Distribution Bars */}
        <div className="flex-1 w-full space-y-2.5">
          {distribution.map((item) => (
            <div key={item.star} className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12 flex items-center gap-1">
                {item.star} <Star className="w-3 h-3 fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600" />
              </span>
              <div className="flex-1 h-2 bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 w-8 text-right">
                {Math.round(item.percentage)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Toggle */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Experience</h3>
          <p className="text-xs text-slate-500">Helping students pick the right institute.</p>
        </div>
        <button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className={`text-xs font-bold px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-sm ${
            showReviewForm 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg hover:shadow-slate-500/20'
          }`}
        >
          {showReviewForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/20 dark:border-blue-500/30 p-6 shadow-xl shadow-blue-500/5 mb-4">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Rate your experience:</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNewReview({ ...newReview, rating: num })}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        newReview.rating >= num 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${newReview.rating >= num ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                placeholder={`Tell us what you loved about ${instituteName}...`}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[140px] transition-all resize-none shadow-inner"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !newReview.text.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl text-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : 'Publish Review'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {reviews.length > 0 ? reviews.map((review, i) => (
          <motion.div 
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {/* Minimalist circular avatar with initials */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-sm border border-white dark:border-slate-800 shadow-sm shrink-0">
                  {getInitials(review.student_name)}
                </div>
                <div className="flex flex-col pt-0.5">
                  <h4 className="font-bold text-[15px] text-slate-900 dark:text-white capitalize leading-none mb-1.5 flex items-center gap-2">
                    {review.student_name || 'Verified Student'}
                    {review.batch_name && (
                      <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                        Verified Batch Member
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Star 
                          key={num} 
                          className={`w-3 h-3 ${num <= review.rating ? 'fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500' : 'fill-slate-100 text-slate-100 dark:fill-slate-800 dark:text-slate-800'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {review.batch_name && (
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                  Reviewed Batch: {review.batch_name}
                </span>
              </div>
            )}

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              "{review.review_text}"
            </p>
          </motion.div>
        )) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-slate-200 dark:text-slate-700" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-1">No reviews yet</h4>
            <p className="text-sm text-slate-500">Be the first to share your learning experience with this coaching center.</p>
          </div>
        )}
      </div>
    </div>
  );
};
