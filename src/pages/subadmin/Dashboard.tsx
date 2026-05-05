import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubAdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'batches'>('profile');
  const navigate = useNavigate();

  // Batch Form
  const [batchForm, setBatchForm] = useState({
    teacher_name: '', teacher_image: '', subject: '', batch_name: '', 
    batch_timing: '', batch_duration: '', start_date: '', fee_structure: ''
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
      setBatchForm({ teacher_name: '', teacher_image: '', subject: '', batch_name: '', batch_timing: '', batch_duration: '', start_date: '', fee_structure: '' });
      fetchData(token!);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/institute/batches/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData(token!);
  };

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{profile.name} - Dashboard</h1>
          <p className="text-slate-500">Manage your institute profile and active batches</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-8 space-x-8">
        <button className={`pb-4 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setActiveTab('profile')}>
          Institute Profile
        </button>
        <button className={`pb-4 font-medium text-sm transition-colors ${activeTab === 'batches' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setActiveTab('batches')}>
          Manage Batches
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institute Name</label>
              <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
              <input type="text" value={profile.logo || ''} onChange={e => setProfile({...profile, logo: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
              <textarea value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location (Google Maps Embed/URL)</label>
              <input type="text" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input type="text" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Demo Video (YouTube URL)</label>
              <input type="text" value={profile.demo_video_url || ''} onChange={e => setProfile({...profile, demo_video_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://www.youtube.com/watch?v=..." />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">Save Profile</button>
        </form>
      )}

      {activeTab === 'batches' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Batch</h2>
              <form onSubmit={handleAddBatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Batch Name</label>
                  <input required type="text" value={batchForm.batch_name} onChange={e => setBatchForm({...batchForm, batch_name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Target JEE 2027" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Subject</label>
                  <input required type="text" value={batchForm.subject} onChange={e => setBatchForm({...batchForm, subject: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Physics" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Teacher Name</label>
                  <input required type="text" value={batchForm.teacher_name} onChange={e => setBatchForm({...batchForm, teacher_name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Teacher Image URL</label>
                  <input type="text" value={batchForm.teacher_image} onChange={e => setBatchForm({...batchForm, teacher_image: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Start Date</label>
                    <input type="date" value={batchForm.start_date} onChange={e => setBatchForm({...batchForm, start_date: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Duration</label>
                    <input type="text" value={batchForm.duration} onChange={e => setBatchForm({...batchForm, batch_duration: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="6 Months" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Timing</label>
                    <input type="text" value={batchForm.batch_timing} onChange={e => setBatchForm({...batchForm, batch_timing: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="4 PM - 6 PM" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Fee</label>
                    <input type="text" value={batchForm.fee_structure} onChange={e => setBatchForm({...batchForm, fee_structure: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="$500/mo" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg hover:bg-slate-800">Create Batch</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {batches.map(batch => (
              <div key={batch.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 relative">
                <button onClick={() => handleDeleteBatch(batch.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 text-sm font-medium">Delete</button>
                <div className="w-16 h-16 shrink-0 rounded-full bg-slate-100 overflow-hidden">
                  {batch.teacher_image ? <img src={batch.teacher_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">{batch.teacher_name.charAt(0)}</div>}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{batch.batch_name}</h3>
                  <div className="text-sm font-medium text-indigo-600 mb-3">{batch.subject} • {batch.teacher_name}</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                    <div><span className="text-slate-400">Timing:</span> {batch.batch_timing}</div>
                    <div><span className="text-slate-400">Duration:</span> {batch.batch_duration}</div>
                    <div><span className="text-slate-400">Start:</span> {batch.start_date}</div>
                    <div><span className="text-slate-400">Fee:</span> {batch.fee_structure}</div>
                  </div>
                </div>
              </div>
            ))}
            {batches.length === 0 && <div className="text-slate-500 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">No batches created yet. Add one from the sidebar.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
