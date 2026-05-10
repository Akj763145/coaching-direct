import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

// We'll also store favorites in local storage as a fallback
export function useFavorites() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<{institute_id?: string, batch_id?: string, type: 'INSTITUTE' | 'BATCH'}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setFavorites(data);
      } else {
        console.error('Error fetching favorites:', error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFavoriteInstitite = (id: string) => {
    return favorites.some(f => f.type === 'INSTITUTE' && f.institute_id === id);
  };

  const isFavoriteBatch = (id: string) => {
    return favorites.some(f => f.type === 'BATCH' && f.batch_id === id);
  };

  const toggleFavoriteInstitute = async (id: string) => {
    if (!user) {
      // Must be logged in
      return false;
    }

    const isFav = isFavoriteInstitite(id);
    
    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(f => !(f.type === 'INSTITUTE' && f.institute_id === id)));
      await supabase.from('favorites').delete().match({ user_id: user.id, institute_id: id, type: 'INSTITUTE' });
    } else {
      setFavorites(prev => [...prev, { institute_id: id, type: 'INSTITUTE' }]);
      await supabase.from('favorites').insert({ user_id: user.id, institute_id: id, type: 'INSTITUTE' });
    }
    return true;
  };

  const toggleFavoriteBatch = async (id: string) => {
    if (!user) {
      return false;
    }

    const isFav = isFavoriteBatch(id);
    
    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(f => !(f.type === 'BATCH' && f.batch_id === id)));
      await supabase.from('favorites').delete().match({ user_id: user.id, batch_id: id, type: 'BATCH' });
    } else {
      setFavorites(prev => [...prev, { batch_id: id, type: 'BATCH' }]);
      await supabase.from('favorites').insert({ user_id: user.id, batch_id: id, type: 'BATCH' });
    }
    return true;
  };

  return {
    favorites,
    loading,
    isFavoriteInstitite,
    isFavoriteBatch,
    toggleFavoriteInstitute,
    toggleFavoriteBatch
  };
}
