import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function RealtimeNotifications() {
  useEffect(() => {
    // Only subscribe to realtime updates if Supabase is actually configured.
    // If we're not using Supabase, then supabase.channel won't do anything meaningful.
    if (!supabase) return;

    try {
      const channel = supabase
        .channel('public:enrollments')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'enrollments' },
          (payload) => {
            console.log('New enrollment received!', payload);
            toast.success('🎉 New sale! A student just enrolled.', {
              duration: 8000,
              style: {
                border: '2px solid #10b981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              }
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Failed to subscribe to realtime enrollments:', err);
    }
  }, []);

  return null;
}
