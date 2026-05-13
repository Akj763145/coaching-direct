import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Edit, Star, Sparkles, LayoutDashboard, Flag, LogOut, Grid, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLedger from '../../components/AdminLedger';
import SeoSettingsPanel from '../../components/SeoSettingsPanel';
import AuditLogsPanel from '../../components/AuditLogsPanel';
import { Activity } from 'lucide-react';

export default function MasterDashboard() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [categoryId, setCategoryId] = useState<string | number>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingInstId, setEditingInstId] = useState<number | string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [newCredentials, setNewCredentials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'institutes' | 'featured' | 'categories' | 'ledger' | 'seo' | 'audit'>('institutes');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInstitutes(token);
    fetchCategories(token);
    fetchEnrollments(token);
  }, [navigate]);

  const fetchEnrollments = async (token: string) => {
    try {
      const res = await fetch('/api/master/enrollments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrollments(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInstitutes = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/master/institutes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInstitutes(await res.json());
      } else if (res.status === 401) {
        navigate('/login');
      } else if (res.status === 403) {
        const data = await res.json();
        alert(`Access Denied: ${data.error || 'You do not have permission to view this.'}`);
        navigate('/'); // Go back home instead of login to break loop
      } else {
        const errorData = await res.json();
        console.error('Server error:', errorData.error);
        alert(`Server Error: ${errorData.error || 'Failed to fetch institutes'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (token: string) => {
    try {
      const res = await fetch('/api/master/institute-categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories(await res.json());
      } else if (res.status === 401) {
        navigate('/login');
      } else if (res.status === 403) {
        const data = await res.json();
        console.error('Access Denied for categories:', data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingInstId ? 'PUT' : 'POST';
      const url = editingInstId ? `/api/master/institutes/${editingInstId}` : '/api/master/institutes';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, logo, category_id: categoryId || null })
      });
      const data = await res.json();
      if (res.ok) {
        if (!editingInstId) {
          setNewCredentials(data.credentials);
        }
        setName('');
        setLogo('');
        setCategoryId('');
        setEditingInstId(null);
        fetchInstitutes(token!);
      } else {
        alert(data.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingCategoryId ? 'PUT' : 'POST';
      const url = editingCategoryId ? `/api/master/institute-categories/${editingCategoryId}` : '/api/master/institute-categories';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName('');
        setEditingCategoryId(null);
        fetchCategories(token!);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (inst: any) => {
    setName(inst.name);
    setLogo(inst.logo || '');
    setCategoryId(inst.category_id || '');
    setEditingInstId(inst.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this institute? This will remove all its data.')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/master/institutes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchInstitutes(token!);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleFeatured = async (id: string | number, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic UI update
    setInstitutes(prev => prev.map(inst => 
      inst.id === id ? { ...inst, is_featured: !currentStatus } : inst
    ));

    try {
      const res = await fetch(`/api/master/institutes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_featured: !currentStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      // Revert on error
      setInstitutes(prev => prev.map(inst => 
        inst.id === id ? { ...inst, is_featured: currentStatus } : inst
      ));
      alert('Failed to update featured status. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 md:p-10 space-y-8"
    >
      <div className="flex justify-between items-end pb-6 border-b border-apple-border/30">
        <div>
          <h1 className="text-3xl font-semibold text-apple-text tracking-tight">Master Admin Dashboard</h1>
          <p className="text-apple-text-muted mt-1 text-[15px]">Manage platform tenants (Institutes)</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-apple-gray dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-apple-border/50 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>

      <div className="flex gap-1 bg-apple-gray/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit border border-apple-border/30 mb-2">
        <button 
          onClick={() => setActiveTab('institutes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'institutes' ? 'bg-white dark:bg-slate-700 text-apple-text dark:text-white shadow-sm ring-1 ring-black/5' : 'text-apple-text-muted hover:text-apple-text'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Institute Management
        </button>
        <button 
          onClick={() => setActiveTab('featured')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'featured' ? 'bg-white dark:bg-slate-700 text-apple-text dark:text-white shadow-sm ring-1 ring-black/5' : 'text-apple-text-muted hover:text-apple-text'}`}
        >
          <Star className="w-4 h-4" />
          Featured Placement
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white dark:bg-slate-700 text-apple-text dark:text-white shadow-sm ring-1 ring-black/5' : 'text-apple-text-muted hover:text-apple-text'}`}
        >
          <Grid className="w-4 h-4" />
          Global Categories
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'ledger' ? 'bg-white dark:bg-slate-700 text-apple-text dark:text-white shadow-sm ring-1 ring-black/5' : 'text-apple-text-muted hover:text-apple-text'}`}
        >
          <Sparkles className="w-4 h-4" />
          Platform Ledger
        </button>
        <button 
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'seo' ? 'bg-white dark:bg-slate-700 text-apple-text dark:text-white shadow-sm ring-1 ring-black/5' : 'text-apple-text-muted hover:text-apple-text'}`}
        >
          <Globe className="w-4 h-4" />
          SEO Settings
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-white dark:bg-slate-700 text-apple-text dark:text-white shadow-sm ring-1 ring-black/5' : 'text-apple-text-muted hover:text-apple-text'}`}
        >
          <Activity className="w-4 h-4" />
          Audit Logs
        </button>
      </div>

      {activeTab === 'institutes' ? (
        <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleCreate} 
            className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-apple-border/40"
          >
            <div className="flex items-center justify-between mb-5">
               <h2 className="text-lg font-semibold text-apple-text">{editingInstId ? 'Edit Institute' : 'Onboard New Institute'}</h2>
               {editingInstId && <button onClick={() => { setEditingInstId(null); setName(''); setLogo(''); }} className="text-[11px] font-bold text-apple-text-muted hover:text-apple-text uppercase tracking-wider">Cancel</button>}
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Institute Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Coaching" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Logo URL (optional)</label>
                <input type="text" className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Category</label>
                <select 
                  className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px] appearance-none" 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button 
                disabled={isSubmitting}
                type="submit" 
                className={`w-full text-white font-medium py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-apple-text hover:bg-black'}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingInstId ? 'Saving...' : 'Onboarding...'}
                  </>
                ) : (editingInstId ? 'Save Changes' : 'Create Institute')}
              </button>
            </div>
          </motion.form>

          {newCredentials && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-[#E8F5E9] border border-[#C8E6C9] p-6 md:p-8 rounded-[24px] shadow-sm"
            >
              <h3 className="text-[#2E7D32] font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Institute Created!
              </h3>
              <p className="text-[13px] text-[#2E7D32]/80 mb-4">Save these Sub-Admin credentials. They will only be shown once.</p>
              <div className="bg-white rounded-xl p-4 border border-[#C8E6C9] font-mono text-[13px] space-y-2 shadow-sm">
                <div className="flex justify-between"><span className="text-apple-text-muted">Username:</span> <span className="font-semibold text-apple-text">{newCredentials.username}</span></div>
                <div className="flex justify-between"><span className="text-apple-text-muted">Password:</span> <span className="font-semibold text-apple-text">{newCredentials.password}</span></div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-apple-text mb-4 px-1">Registered Institutes</h2>
            {isLoading ? (
               <div className="grid sm:grid-cols-2 gap-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="bg-white p-5 rounded-[20px] border border-apple-border/40 flex items-center gap-4 animate-pulse">
                     <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
                     <div className="flex-1 space-y-2">
                       <div className="h-4 bg-slate-200 rounded w-3/4" />
                       <div className="h-3 bg-slate-100 rounded w-1/2" />
                     </div>
                   </div>
                 ))}
               </div>
            ) : institutes.length === 0 ? (
              <div className="bg-apple-gray rounded-[24px] border border-apple-border/30 p-10 text-center text-apple-text-muted">No institutes added yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {institutes.map((inst, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    key={inst.id} 
                    className="bg-white p-5 rounded-[20px] border border-apple-border/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {inst.logo ? (
                        <img src={inst.logo} alt="" className="w-14 h-14 rounded-xl object-contain bg-apple-gray p-1 border border-apple-border/30" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-apple-gray border border-apple-border/30 text-apple-blue flex items-center justify-center font-semibold text-2xl shrink-0">
                          {inst.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-apple-text leading-tight truncate">{inst.name}</h3>
                        <p className="text-[13px] text-apple-text-muted mt-1 font-mono truncate">@{inst.username}</p>
                        {inst.category_name && (
                          <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {inst.category_name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleEdit(inst)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        title="Edit Institute"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={deletingId === inst.id} 
                        onClick={() => handleDelete(inst.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-red-200 dark:hover:border-red-800 disabled:opacity-50"
                        title="Delete Institute"
                      >
                        {deletingId === inst.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      ) : activeTab === 'categories' ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCategorySubmit} 
              className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-apple-border/40"
            >
              <h2 className="text-lg font-semibold text-apple-text mb-5">{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Category Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. School, Coaching" />
                </div>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full bg-apple-text text-white font-medium py-3 rounded-xl hover:bg-black transition-all mt-2"
                >
                  {editingCategoryId ? 'Update Category' : 'Create Category'}
                </button>
                {editingCategoryId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingCategoryId(null); setNewCategoryName(''); }}
                    className="w-full text-slate-500 text-sm font-medium py-2"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </motion.form>
          </div>
          <div className="md:col-span-2">
            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-5 rounded-[20px] border border-apple-border/40 flex items-center justify-between group">
                  <span className="font-semibold text-apple-text">{cat.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCategoryId(cat.id); setNewCategoryName(cat.name); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (!confirm('Delete category?')) return;
                        const token = localStorage.getItem('token');
                        await fetch(`/api/master/institute-categories/${cat.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                        fetchCategories(token!);
                      }} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'featured' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-apple-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden"
        >
          <div className="p-6 border-b border-apple-border/30 bg-apple-gray/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-apple-text dark:text-white">Featured Placement Control</h2>
              <p className="text-[13px] text-apple-text-muted">Manage showcase institutes for public pages</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50">
              <Sparkles className="w-3.5 h-3.5 fill-amber-600/10" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Premium Control</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-apple-gray/30 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[13px] font-bold text-apple-text/60 dark:text-slate-400 uppercase tracking-wider w-1/2">Institute Info</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-apple-text/60 dark:text-slate-400 uppercase tracking-wider text-center">Rating</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-apple-text/60 dark:text-slate-400 uppercase tracking-wider text-right">Featured Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border/20 dark:divide-slate-800/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-lg"/><div className="h-4 bg-slate-100 rounded w-32"/></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"/></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-full w-16 ml-auto"/></td>
                    </tr>
                  ))
                ) : institutes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-apple-text-muted italic">No institutes found to manage.</td>
                  </tr>
                ) : (
                  institutes.map((inst) => (
                    <tr key={inst.id} className="hover:bg-apple-gray/20 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl border border-apple-border/30 overflow-hidden bg-apple-gray/50 flex-shrink-0 flex items-center justify-center">
                            {inst.logo ? (
                              <img src={inst.logo} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-xl font-bold text-apple-blue uppercase">{inst.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-apple-text dark:text-white truncate">{inst.name}</div>
                            <div className="text-[12px] text-apple-text-muted">ID: {inst.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 w-fit mx-auto">
                          <Star className={`w-3.5 h-3.5 ${Number(inst.rating) > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{Number(inst.rating || 0).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end items-center gap-3">
                          {inst.is_featured && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-amber-500"
                            >
                              <Sparkles className="w-4 h-4 fill-amber-500/20" />
                            </motion.div>
                          )}
                          <button
                            onClick={() => toggleFeatured(inst.id, inst.is_featured === 1 || inst.is_featured === true)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-apple-blue/20 ${
                              (inst.is_featured === 1 || inst.is_featured === true) ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                                (inst.is_featured === 1 || inst.is_featured === true) ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-apple-gray/20 dark:bg-slate-800/30 border-t border-apple-border/20 text-center">
             <p className="text-[11px] text-apple-text-muted uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
               <Flag className="w-3 h-3" />
               Current total of {institutes.filter(i => i.is_featured).length} featured institutes
             </p>
          </div>
        </motion.div>
      ) : activeTab === 'ledger' ? (
        <AdminLedger enrollments={enrollments} />
      ) : activeTab === 'seo' ? (
        <SeoSettingsPanel />
      ) : activeTab === 'audit' ? (
        <AuditLogsPanel />
      ) : null}
    </motion.div>
  );
}
