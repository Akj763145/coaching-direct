import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // We found a session! Tell the opening window.
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', session }, window.location.origin);
          window.close();
        } else {
          // Fallback if not in a popup
          window.location.href = '/';
        }
      } else if (error) {
        console.error('Auth callback error:', error);
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: error.message }, window.location.origin);
          window.close();
        } else {
          window.location.href = '/user/login?error=' + encodeURIComponent(error.message);
        }
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <h2 className="text-xl font-bold dark:text-white">Completing sign in...</h2>
        <p className="text-slate-500 dark:text-slate-400">This window will close automatically.</p>
      </div>
    </div>
  );
}
