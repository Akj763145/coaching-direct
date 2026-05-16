import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit, Star, Sparkles, LayoutDashboard, Flag, LogOut, Grid, Globe, Activity, ShieldCheck, Building2, Plus, Menu, X, Loader2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLedger from '../../components/AdminLedger';
import SeoSettingsPanel from '../../components/SeoSettingsPanel';
import AuditLogsPanel from '../../components/AuditLogsPanel';
import SystemHealthDashboard from '../../components/SystemHealthDashboard';

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
  const [activeTab, setActiveTab] = useState<'institutes' | 'featured' | 'categories' | 'ledger' | 'seo' | 'audit' | 'health'>('institutes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
        navigate('/'); 
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

      if (!res.ok) throw new Error('Failed to update status');
    } catch (error) {
      console.error(error);
      setInstitutes(prev => prev.map(inst => 
        inst.id === id ? { ...inst, is_featured: currentStatus } : inst
      ));
      alert('Failed to update featured status. Please try again.');
    }
  };

  const navItems = [
    { id: 'institutes', label: 'Institutes', icon: LayoutDashboard },
    { id: 'featured', label: 'Featured', icon: Star },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'ledger', label: 'Ledger', icon: Sparkles },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'health', label: 'System Health', icon: ShieldCheck },
  ] as const;

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 w-full overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col z-50 
        transition-transform duration-300 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 h-20 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-bold tracking-tight text-slate-900">Coaching Direct</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none mt-0.5">Console</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
                activeTab === item.id 
                ? 'bg-blue-50/80 text-blue-700 shadow-[0_2px_10px_rgba(59,130,246,0.08)]' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] transition-colors ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
             >
               <Menu size={24} />
             </button>
             <h2 className="text-xl font-bold text-slate-900 tracking-tight">
               {navItems.find(i => i.id === activeTab)?.label}
             </h2>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <ShieldCheck size={16} className="text-blue-600" />
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-500 uppercase tracking-wider">Superadmin</span>
           </div>
        </header>
        
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden bg-white">
          <div className="w-full max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'institutes' ? (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleCreate} 
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-50">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">{editingInstId ? 'Update Institute' : 'New Institute'}</h2>
                    {editingInstId && (
                      <button 
                        type="button" 
                        onClick={() => { setEditingInstId(null); setName(''); setLogo(''); }} 
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institute Name</label>
                      <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-[15px] font-medium placeholder:text-slate-300" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Classes" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institute Logo</label>
                      <div className="relative group cursor-pointer w-20 h-20">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500 overflow-hidden">
                          {isUploadingPhoto ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : logo ? (
                            <img src={logo} alt="Logo" className="w-full h-full object-contain bg-white" />
                          ) : (
                            <div className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            </div>
                          )}
                        </div>
                        <input 
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={isUploadingPhoto}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploadingPhoto(true);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogo(reader.result as string);
                                setIsUploadingPhoto(false);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <div className="relative">
                        <select 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-[15px] font-medium appearance-none cursor-pointer" 
                          value={categoryId} 
                          onChange={e => setCategoryId(e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <Grid size={16} />
                        </div>
                      </div>
                    </div>
                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className={`w-full text-white font-bold py-4 rounded-2xl transition-all mt-4 flex items-center justify-center gap-3 shadow-lg ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 shadow-blue-500/10'}`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {editingInstId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          <span className="tracking-tight">{editingInstId ? 'Save Changes' : 'Create Institute'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>

                {newCredentials && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/20 text-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ShieldCheck size={120} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 relative z-10">
                      Institute Created
                    </h3>
                    <p className="text-white/80 font-medium mb-6 leading-relaxed relative z-10 text-sm">Save these Sub-Admin credentials safely.</p>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-4 relative z-10">
                      <div className="flex justify-between items-center"><span className="text-white/60 text-xs font-bold uppercase tracking-widest">Username</span> <span className="font-bold">{newCredentials.username}</span></div>
                      <div className="flex justify-between items-center"><span className="text-white/60 text-xs font-bold uppercase tracking-widest">Password</span> <span className="font-bold">{newCredentials.password}</span></div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Active Directory</h3>
                   <div className="flex items-center gap-3">
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100">{institutes.length} Units</span>
                   </div>
                </div>
                
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5 animate-pulse shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-50 rounded w-2/3" />
                          <div className="h-3 bg-slate-50 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : institutes.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-slate-300" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">No Institutes Yet</h3>
                     <p className="text-slate-500 max-w-xs mx-auto">Start by onboarding your first institute using the form on the left.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {institutes.map((inst, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={inst.id} 
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.01)] flex items-center justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all hover:border-blue-100 relative"
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center p-2 group-hover:bg-white transition-colors">
                            {inst.logo ? (
                              <img src={inst.logo} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-xl font-black text-slate-300 group-hover:text-blue-200">{inst.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 leading-tight truncate text-[15px]">{inst.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">@{inst.username}</p>
                               {(inst.is_featured === 1 || inst.is_featured === true) && <Star size={10} className="fill-blue-500 text-blue-500" />}
                            </div>
                            {inst.category_name && (
                              <span className="inline-block mt-2 text-[9px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                {inst.category_name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 items-end ml-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(inst); }} 
                            className="w-10 h-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all flex items-center justify-center border border-transparent hover:border-blue-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            disabled={deletingId === inst.id} 
                            onClick={(e) => { e.stopPropagation(); handleDelete(inst.id); }} 
                            className="w-10 h-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center border border-transparent hover:border-red-100 disabled:opacity-50"
                          >
                            {deletingId === inst.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'categories' ? (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleCategorySubmit} 
                  className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-50 flex items-center justify-between">
                    {editingCategoryId ? 'Update Category' : 'New Category'}
                    {editingCategoryId && <X size={18} className="text-slate-400 cursor-pointer" onClick={() => { setEditingCategoryId(null); setNewCategoryName(''); }} />}
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                      <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-[15px] font-medium placeholder:text-slate-300" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Test Prep" />
                    </div>
                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                      {editingCategoryId ? 'Update' : 'Create Category'}
                    </button>
                  </div>
                </motion.form>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Taxonomy</h3>
                   <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase border border-blue-100">{categories.length} Entries</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => (
                    <motion.div 
                      layout
                      key={cat.id} 
                      className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group shadow-sm hover:border-blue-100 transition-all"
                    >
                      <span className="font-bold text-slate-900 text-sm tracking-tight">{cat.name}</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <button onClick={() => { setEditingCategoryId(cat.id); setNewCategoryName(cat.name); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (!confirm('Delete category?')) return;
                            const token = localStorage.getItem('token');
                            await fetch(`/api/master/institute-categories/${cat.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                            fetchCategories(token!);
                          }} 
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'featured' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Showcase Selection</h2>
                  <p className="text-sm text-slate-500 mt-1">Pin premium institutes to the platform hero section</p>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 shadow-sm">
                  <Sparkles size={16} className="fill-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Featured Only</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <table className="hidden md:table w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Platform Rating</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-50 rounded-2xl"/><div className="h-4 bg-slate-50 rounded w-40"/></div></td>
                          <td className="px-8 py-6"><div className="h-5 bg-slate-50 rounded w-20 mx-auto"/></td>
                          <td className="px-8 py-6"><div className="h-10 bg-slate-50 rounded-full w-16 ml-auto"/></td>
                        </tr>
                      ))
                    ) : institutes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">No providers available for selection.</td>
                      </tr>
                    ) : (
                      institutes.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50/30 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl border border-slate-100 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-2 shadow-sm transition-transform group-hover:scale-105">
                                {inst.logo ? (
                                  <img src={inst.logo} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-lg font-black text-slate-200">{inst.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-[15px] truncate">{inst.name}</div>
                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: CD-{inst.id}</div>
                                {inst.category_name && (
                                  <span className="inline-block mt-1 text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                                    {inst.category_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 w-fit mx-auto shadow-inner">
                              <Star size={12} className={`${Number(inst.rating) > 0 ? 'fill-blue-500 text-blue-500' : 'text-slate-300'}`} />
                              <span className="text-sm font-bold text-slate-900">{Number(inst.rating || 0).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-end items-center gap-4">
                              <button
                                onClick={() => toggleFeatured(inst.id, inst.is_featured === 1 || inst.is_featured === true)}
                                className={`group relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ${
                                  (inst.is_featured === 1 || inst.is_featured === true) 
                                  ? 'bg-blue-600 shadow-lg shadow-blue-500/20' 
                                  : 'bg-slate-100 border border-slate-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-all duration-300 ${
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

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-6 animate-pulse flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl" />
                         <div className="flex-1 space-y-2">
                           <div className="h-3 bg-slate-50 rounded w-1/2" />
                           <div className="h-2 bg-slate-50 rounded w-1/4" />
                         </div>
                      </div>
                    ))
                  ) : institutes.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium italic text-sm">No providers available.</div>
                  ) : (
                    institutes.map((inst) => (
                      <div key={inst.id} className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex-shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                            {inst.logo ? (
                              <img src={inst.logo} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-sm font-black text-slate-300">{inst.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                             <div className="font-bold text-slate-900 text-sm truncate">{inst.name}</div>
                             <div className="flex items-center gap-2 mt-0.5">
                                <Star size={10} className="fill-blue-500 text-blue-500" />
                                <span className="text-[10px] font-bold text-slate-500">{Number(inst.rating || 0).toFixed(1)}</span>
                             </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleFeatured(inst.id, inst.is_featured === 1 || inst.is_featured === true)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none flex-shrink-0 ${
                            (inst.is_featured === 1 || inst.is_featured === true) 
                            ? 'bg-blue-600' 
                            : 'bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-300 ${
                              (inst.is_featured === 1 || inst.is_featured === true) ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                   {institutes.filter(i => i.is_featured).length} Active Featured Nodes
                 </p>
              </div>
            </motion.div>
          ) : activeTab === 'ledger' ? (
            <AdminLedger enrollments={enrollments} />
          ) : activeTab === 'seo' ? (
            <SeoSettingsPanel />
          ) : activeTab === 'audit' ? (
            <AuditLogsPanel />
          ) : activeTab === 'health' ? (
            <SystemHealthDashboard />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
