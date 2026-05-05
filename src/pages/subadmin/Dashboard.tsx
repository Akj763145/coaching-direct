import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function SubAdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'batches'>('profile');
  const navigate = useNavigate();

  // Batch Form
  const [batchForm, setBatchForm] = useState({
    teacher_name: '', teacher_image: '', subject: '', batch_name: '', 
    batch_timing: '', batch_duration: '', start_date: '', fee_structure: '', status: 'running'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token: string) => {
    const pRes = await fetch('/api/institute/profile', { headers: { 'Authorization': `Bearer ${token}` }});
    if (pRes.ok) setProfile(await pRes.json());
    else { navigate('/login'); return; }

    const bRes = await fetch('/api/institute/batches', { headers: { 'Authorization': `Bearer ${token}` }});
    if (bRes.ok) setBatches(await bRes.json());
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/api/institute/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(profile)
    });
    alert('Profile updated');
  };

  const handleAddBatch = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/institute/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(batchForm)
    });
    if (res.ok) {
      setBatchForm({ teacher_name: '', teacher_image: '', subject: '', batch_name: '', batch_timing: '', batch_duration: '', start_date: '', fee_structure: '', status: 'running' });
      fetchData(token!);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/institute/batches/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData(token!);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 md:p-10"
    >
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pb-6 border-b border-apple-border/30 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-apple-text tracking-tight">{profile.name} - Dashboard</h1>
          <p className="text-apple-text-muted mt-1 text-[15px]">Manage your institute profile and active batches</p>
        </div>
        <button onClick={handleLogout} className="text-[13px] font-medium text-apple-text-muted hover:text-apple-text transition-colors">Log out</button>
      </div>

      <div className="flex mb-8 space-x-6 relative overflow-x-auto no-scrollbar pb-1">
        <button className={`pb-3 font-medium text-[15px] transition-colors relative whitespace-nowrap ${activeTab === 'profile' ? 'text-apple-text' : 'text-apple-text-muted hover:text-apple-text'}`} onClick={() => setActiveTab('profile')}>
          Institute Profile
          {activeTab === 'profile' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-text rounded-t-full" />}
        </button>
        <button className={`pb-3 font-medium text-[15px] transition-colors relative whitespace-nowrap ${activeTab === 'batches' ? 'text-apple-text' : 'text-apple-text-muted hover:text-apple-text'}`} onClick={() => setActiveTab('batches')}>
          Manage Batches
          {activeTab === 'batches' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-text rounded-t-full" />}
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-apple-border/30 -z-10" />
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-3xl bg-white p-8 rounded-[24px] border border-apple-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Institute Name</label>
                <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Logo URL</label>
                <input type="text" value={profile.logo || ''} onChange={e => setProfile({...profile, logo: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Full Address</label>
                <textarea value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" rows={3}></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Location (Google Maps Embed/URL)</label>
                <input type="text" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Phone</label>
                <input type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Email</label>
                <input type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Website</label>
                <input type="text" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[13px] font-medium text-apple-text-muted ml-1">Demo Video (YouTube URL)</label>
                <input type="text" value={profile.demo_video_url || ''} onChange={e => setProfile({...profile, demo_video_url: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[15px]" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-apple-blue text-white rounded-xl font-medium hover:bg-apple-blue-hover transition-colors shadow-sm">Save Profile</button>
          </form>
        </motion.div>
      )}

      {activeTab === 'batches' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-7 rounded-[24px] border border-apple-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-24">
              <h2 className="text-lg font-semibold text-apple-text mb-5 tracking-tight">Add New Batch</h2>
              <form onSubmit={handleAddBatch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Batch Name</label>
                  <input required type="text" value={batchForm.batch_name} onChange={e => setBatchForm({...batchForm, batch_name: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" placeholder="e.g. Target JEE 2027" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Subject</label>
                  <input required type="text" value={batchForm.subject} onChange={e => setBatchForm({...batchForm, subject: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" placeholder="Physics" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Teacher Name</label>
                  <input required type="text" value={batchForm.teacher_name} onChange={e => setBatchForm({...batchForm, teacher_name: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Teacher Image URL</label>
                  <input type="text" value={batchForm.teacher_image} onChange={e => setBatchForm({...batchForm, teacher_image: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Start Date</label>
                    <input type="date" value={batchForm.start_date} onChange={e => setBatchForm({...batchForm, start_date: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Duration</label>
                    <input type="text" value={batchForm.batch_duration} onChange={e => setBatchForm({...batchForm, batch_duration: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" placeholder="6 Months" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Timing</label>
                    <input type="text" value={batchForm.batch_timing} onChange={e => setBatchForm({...batchForm, batch_timing: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" placeholder="4 PM - 6 PM" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Fee</label>
                    <input type="text" value={batchForm.fee_structure} onChange={e => setBatchForm({...batchForm, fee_structure: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px]" placeholder="$500/mo" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-apple-text-muted uppercase tracking-wider ml-1">Enrollment/Course Status</label>
                  <select value={batchForm.status || 'running'} onChange={e => setBatchForm({...batchForm, status: e.target.value})} className="w-full px-4 py-2.5 bg-apple-gray/50 border border-apple-border/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all text-[14px] appearance-none">
                    <option value="running">Running</option>
                    <option value="not_running">Not Running</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-apple-text text-white font-medium py-3 rounded-xl hover:bg-black transition-colors mt-2">Create Batch</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {batches.map((batch, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={batch.id} 
                className="bg-white p-6 rounded-[24px] border border-apple-border/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-5 relative hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow"
              >
                <button onClick={() => handleDeleteBatch(batch.id)} className="absolute top-4 right-5 text-apple-text-muted hover:text-red-500 text-[13px] font-medium transition-colors">Delete</button>
                <div className="w-16 h-16 shrink-0 rounded-full bg-apple-gray border border-apple-border/30 overflow-hidden">
                  {batch.teacher_image ? <img src={batch.teacher_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-apple-text-muted font-medium text-xl">{batch.teacher_name.charAt(0)}</div>}
                </div>
                <div>
                  <h3 className="font-semibold text-[18px] text-apple-text">
                    {batch.batch_name}
                    {batch.status === 'running' 
                      ? <span className="ml-3 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-block align-middle">Running</span>
                      : batch.status === 'not_running' 
                      ? <span className="ml-3 text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full inline-block align-middle">Not Running</span>
                      : null
                    }
                  </h3>
                  <div className="text-[13px] font-medium text-apple-blue mb-3 bg-apple-blue/5 border border-apple-blue/10 rounded-md px-2 py-0.5 inline-block mt-1">{batch.subject} • {batch.teacher_name}</div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px] text-apple-text pt-2">
                    <div className="flex gap-2"><span className="text-apple-text-muted font-medium">Timing:</span> <span>{batch.batch_timing || '-'}</span></div>
                    <div className="flex gap-2"><span className="text-apple-text-muted font-medium">Duration:</span> <span>{batch.batch_duration || '-'}</span></div>
                    <div className="flex gap-2"><span className="text-apple-text-muted font-medium">Start:</span> <span>{batch.start_date || '-'}</span></div>
                    <div className="flex gap-2"><span className="text-apple-text-muted font-medium">Fee:</span> <span>{batch.fee_structure || '-'}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
            {batches.length === 0 && <div className="text-apple-text-muted text-center py-12 border border-dashed border-apple-border/50 rounded-[24px] bg-apple-gray/50 text-[15px]">No batches created yet. Add one from the sidebar.</div>}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
