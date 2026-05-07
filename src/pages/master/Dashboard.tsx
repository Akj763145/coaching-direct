import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Edit } from 'lucide-react';

export default function MasterDashboard() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [editingInstId, setEditingInstId] = useState<number | string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [newCredentials, setNewCredentials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInstitutes(token);
  }, [navigate]);

  const fetchInstitutes = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/master/institutes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInstitutes(await res.json());
      } else {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
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
        body: JSON.stringify({ name, logo })
      });
      const data = await res.json();
      if (res.ok) {
        if (!editingInstId) {
          setNewCredentials(data.credentials);
        }
        setName('');
        setLogo('');
        setEditingInstId(null);
        fetchInstitutes(token!);
      } else {
        alert(data.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (inst: any) => {
    setName(inst.name);
    setLogo(inst.logo || '');
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
        <button onClick={handleLogout} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-apple-gray dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-apple-border/50">Log out</button>
      </div>

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
    </motion.div>
  );
}
