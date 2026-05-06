import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, MessageCircle, MapPin, Download, Save, Grid, FileText, Users, Eye, CheckSquare, Bookmark, Check, X } from 'lucide-react';

export default function SubAdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'batches' | 'notices' | 'leads'>('profile');
  const navigate = useNavigate();

  // Batch Form - Advanced Builder
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batch_name: '', subject: '', medium: 'English', board_target: 'CBSE',
    batch_timing: '', batch_duration: '', start_date: '', fee_structure: '', 
    status: 'running', total_seats: 50, available_seats: 50,
    syllabus_pdf: '', teacher_name: '', teacher_image: '', teacher_bio: '', 
    curriculum: [{ title: '', content: '' }]
  });

  // Notice Form
  const [noticeForm, setNoticeForm] = useState({ title: '', date: '', message: '' });

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

    const nRes = await fetch('/api/institute/notices', { headers: { 'Authorization': `Bearer ${token}` }});
    if (nRes.ok) setNotices(await nRes.json());

    const lRes = await fetch('/api/institute/leads', { headers: { 'Authorization': `Bearer ${token}` }});
    if (lRes.ok) setLeads(await lRes.json());
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/api/institute/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(profile)
    });
    alert('Profile updated successfully');
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
      setBatchForm({ 
        batch_name: '', subject: '', medium: 'English', board_target: 'CBSE',
        batch_timing: '', batch_duration: '', start_date: '', fee_structure: '', 
        status: 'running', total_seats: 50, available_seats: 50,
        syllabus_pdf: '', teacher_name: '', teacher_image: '', teacher_bio: '', 
        curriculum: [{ title: '', content: '' }] 
      });
      setShowBatchForm(false);
      fetchData(token!);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if(!window.confirm('Are you sure you want to delete this batch?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/institute/batches/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData(token!);
  };

  const handleAddNotice = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/institute/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(noticeForm)
    });
    if (res.ok) {
      setNoticeForm({ title: '', date: '', message: '' });
      fetchData(token!);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/institute/notices/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData(token!);
  };

  const handleStatusChange = async (id: string, status: string) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
    const token = localStorage.getItem('token');
    await fetch(`/api/institute/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{profile.name} Workspace</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sub-Admin Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Log out
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto no-scrollbar gap-2 pb-0">
          {[
            { id: 'profile', label: 'Profile Settings', icon: Grid },
            { id: 'batches', label: 'Advanced Batch Builder', icon: FileText },
            { id: 'notices', label: 'Notice Board', icon: Bookmark },
            { id: 'leads', label: 'Demo Requests', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Institute Profile Settings</h2>
                <p className="text-sm text-slate-500">Update your core details, branding, and contact information.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Institute Name</label>
                  <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brand Logo URL</label>
                  <input type="text" value={profile.logo || ''} onChange={e => setProfile({...profile, logo: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" placeholder="https://..." />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Address</label>
                  <textarea value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" rows={2}></textarea>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Verified WhatsApp Number</label>
                  <input type="text" value={profile.whatsapp_number || ''} onChange={e => setProfile({...profile, whatsapp_number: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Location (Maps URL or Address)
                    </label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          if ("geolocation" in navigator) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                              setProfile({
                                ...profile,
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude
                              });
                              alert("Location detected! Don't forget to click 'Save Profile' below.");
                            }, (err) => {
                              alert("Could not detect location. Please ensure location permissions are granted.");
                            });
                          }
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors"
                      >
                        Auto-detect Here
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const loc = profile.location || '';
                          const extracted = (function(str: string) {
                            if (!str) return null;
                            // More robust patterns handling integer and decimal variants
                            const patterns = [
                              /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
                              /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
                              /\/search\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
                              /\/place\/[^/]+\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
                              /(-?\d+(?:\.\d+)?)\s*[,]\s*(-?\d+(?:\.\d+)?)/
                            ];
                            for (const p of patterns) {
                              const m = str.match(p);
                              if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
                            }
                            return null;
                          })(loc);

                          if (extracted) {
                            setProfile({
                              ...profile, 
                              latitude: extracted.lat, 
                              longitude: extracted.lng 
                            });
                            alert("Coordinates parsed successfully! Please click 'Save Profile' to apply changes.");
                          } else {
                            alert("Could not parse coordinates. Try pasting a full Google Maps URL or enter Decimal Degrees (e.g. 26.65, 84.89)");
                          }
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md transition-colors"
                      >
                        Parse from URL
                      </button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={profile.location || ''} 
                    onChange={e => setProfile({...profile, location: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" 
                    placeholder="Paste Google Maps URL here (e.g. from Share button)" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Hint: Copy the full URL from your browser or the Google Maps app's "Share" button, then click "Parse from URL" above.</p>
                </div>

                {/* Explicit Coordinate Fields */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Map Coordinates</span>
                    {(profile.latitude && profile.longitude) && (
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                      <input step="any" type="number" value={profile.latitude || ''} onChange={e => setProfile({...profile, latitude: parseFloat(e.target.value)})} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="26.6575" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                      <input step="any" type="number" value={profile.longitude || ''} onChange={e => setProfile({...profile, longitude: parseFloat(e.target.value)})} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="84.8989" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Support Email</label>
                  <input type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website URL</label>
                  <input type="text" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Feature Video (YouTube URL)</label>
                  <input type="text" value={profile.demo_video_url || ''} onChange={e => setProfile({...profile, demo_video_url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm ml-auto">
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {!showBatchForm ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Batches</h2>
                  <button onClick={() => setShowBatchForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Create Advanced Batch
                  </button>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {batches.map(batch => (
                    <div key={batch.id} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm relative group flex flex-col h-full">
                      <button onClick={() => handleDeleteBatch(batch.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="flex gap-4 items-start mb-6 pr-8">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border flex-shrink-0">
                          {batch.teacher_image ? <img src={batch.teacher_image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-500">{batch.teacher_name?.charAt(0)}</div>}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                            {batch.batch_name}
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${batch.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{batch.status}</span>
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">By {batch.teacher_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6 flex-grow">
                        <div className="flex flex-col"><span className="text-slate-400 text-xs uppercase font-semibold">Subject / Target</span><span className="text-slate-800 dark:text-slate-200 font-medium">{batch.subject} • {batch.board_target}</span></div>
                        <div className="flex flex-col"><span className="text-slate-400 text-xs uppercase font-semibold">Medium</span><span className="text-slate-800 dark:text-slate-200 font-medium">{batch.medium}</span></div>
                        <div className="flex flex-col"><span className="text-slate-400 text-xs uppercase font-semibold">Timing / Seats</span><span className="text-slate-800 dark:text-slate-200 font-medium">{batch.batch_timing} • {batch.available_seats}/{batch.total_seats} Left</span></div>
                        <div className="flex flex-col"><span className="text-slate-400 text-xs uppercase font-semibold">Total Fee</span><span className="text-slate-800 dark:text-slate-200 font-medium font-mono">₹{batch.fee_structure}</span></div>
                      </div>

                      <a href={`/batch/${batch.id}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl transition-colors">
                        <Eye className="w-4 h-4" /> View Live Page
                      </a>
                    </div>
                  ))}
                  {batches.length === 0 && (
                    <div className="lg:col-span-2 py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px]">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No batches found</h3>
                      <p className="text-slate-500">Create your first comprehensive batch to start getting leads.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddBatch} className="bg-white dark:bg-slate-900 rounded-[20px] p-6 md:p-8 shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-200 dark:border-slate-800 mb-20 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Add New Batch</h2>
                  <button type="button" onClick={() => setShowBatchForm(false)} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white">Cancel</button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Left Column - Core Config */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 inline-block px-3 py-1 rounded-full">Core Details</h3>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch Name Title</label>
                          <input required type="text" value={batchForm.batch_name} onChange={e => setBatchForm({...batchForm, batch_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="e.g. Target NEET 2026 - Alpha Batch" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject Focus</label>
                          <input required type="text" value={batchForm.subject} onChange={e => setBatchForm({...batchForm, subject: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="Physics, Chemistry" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Fee Structure</label>
                          <input required type="text" value={batchForm.fee_structure} onChange={e => setBatchForm({...batchForm, fee_structure: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white font-mono" placeholder="₹45000" />
                        </div>
                      </div>
                    </div>

                    {/* Instructor Profile */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 inline-block px-3 py-1 rounded-full">Assign Teacher</h3>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instructor Name</label>
                          <input required type="text" value={batchForm.teacher_name} onChange={e => setBatchForm({...batchForm, teacher_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Avatar URL</label>
                          <input type="text" value={batchForm.teacher_image} onChange={e => setBatchForm({...batchForm, teacher_image: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teacher Bio / Qualifications</label>
                          <textarea value={batchForm.teacher_bio} onChange={e => setBatchForm({...batchForm, teacher_bio: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" rows={2}></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Curriculum Builder */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Curriculum Modules</h3>
                        <button type="button" onClick={() => setBatchForm({...batchForm, curriculum: [...batchForm.curriculum, { title: '', content: '' }]})} className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          <Plus className="w-3 h-3" /> Add Module
                        </button>
                      </div>
                      <div className="space-y-4">
                        {batchForm.curriculum.map((mod, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex-1 space-y-3">
                              <input type="text" placeholder={`Module ${idx+1} Title`} value={mod.title} onChange={e => {
                                const newC = [...batchForm.curriculum]; newC[idx].title = e.target.value; setBatchForm({...batchForm, curriculum: newC});
                              }} className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:border-blue-500 dark:text-white" />
                              <textarea placeholder="Topics covered..." value={mod.content} onChange={e => {
                                const newC = [...batchForm.curriculum]; newC[idx].content = e.target.value; setBatchForm({...batchForm, curriculum: newC});
                              }} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-300" rows={2}></textarea>
                            </div>
                            <button type="button" onClick={() => {
                              const newC = [...batchForm.curriculum]; newC.splice(idx, 1); setBatchForm({...batchForm, curriculum: newC});
                            }} className="mt-2 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column - Scarcity & Filters */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Smart Filters & Schedule</h3>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Board / Target Exam</label>
                        <select value={batchForm.board_target} onChange={e => setBatchForm({...batchForm, board_target: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none cursor-pointer dark:text-white">
                          <option value="CBSE">CBSE Board</option>
                          <option value="State Board">State Board</option>
                          <option value="ICSE">ICSE Board</option>
                          <option value="NEET">NEET Target</option>
                          <option value="JEE">JEE Main & Adv</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Teaching Medium</label>
                        <select value={batchForm.medium} onChange={e => setBatchForm({...batchForm, medium: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none cursor-pointer dark:text-white">
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Bilingual">Bilingual (Hinglish)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Timing</label>
                        <input type="text" value={batchForm.batch_timing} onChange={e => setBatchForm({...batchForm, batch_timing: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white" placeholder="4 PM - 6 PM (MWF)" />
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2">Scarcity Engine</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-orange-800 dark:text-orange-300">Total Seats</label>
                          <input type="number" value={batchForm.total_seats} onChange={e => setBatchForm({...batchForm, total_seats: Number(e.target.value)})} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-800/50 rounded-xl text-sm outline-none font-mono dark:text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-orange-800 dark:text-orange-300">Available</label>
                          <input type="number" value={batchForm.available_seats} onChange={e => setBatchForm({...batchForm, available_seats: Number(e.target.value)})} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-800/50 rounded-xl text-sm outline-none font-mono text-orange-600 dark:text-orange-400 font-bold" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2">
                       Publish To Live Website
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <form onSubmit={handleAddNotice} className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Post Live Notice</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Notice Title</label>
                    <input required type="text" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="Holiday Announcement" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Date / Scope</label>
                    <input required type="text" value={noticeForm.date} onChange={e => setNoticeForm({...noticeForm, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="Today • Important" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Message Content</label>
                    <textarea required value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" rows={3} placeholder="Write message here..."></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition">Publish Notice</button>
                </div>
              </form>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 ml-1">Active Updates ({notices.length})</h3>
              {notices.map((n) => (
                <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-start group shadow-sm">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1 mb-2 bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-0.5 rounded-full">{n.date}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{n.message}</p>
                  </div>
                  <button onClick={() => handleDeleteNotice(n.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {notices.length === 0 && <p className="text-slate-500 text-sm mt-8 border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center rounded-[24px]">No active notices. Post something to inform your students via the live noticeboard.</p>}
            </div>
          </motion.div>
        )}

        {/* Leads & Demo Requests Tab */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Demo Leads Manager</h2>
               <p className="text-sm text-slate-500">Student requests who clicked "Book Free Demo" on your pages.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold hidden md:table-header-group border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4">Target Batch & Time</th>
                    <th className="px-6 py-4">Status & Action</th>
                    <th className="px-6 py-4 text-right">Quick Connect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leads.map(lead => {
                    const message = encodeURIComponent(`Hi ${lead.student_name}, this is a confirmation for your demo class for the ${lead.target_batch} batch on ${lead.request_date} at ${lead.request_time}. Please confirm if you will be able to join!`);
                    const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${message}`;

                    return (
                      <tr key={lead.id} className="flex flex-col md:table-row py-4 md:py-0 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex flex-col justify-center">
                           <span className="text-base font-bold">{lead.student_name}</span>
                           <span className="text-slate-500 font-mono text-xs mt-1 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded w-max">{lead.phone}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                           <div className="flex flex-col">
                             <span className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{lead.target_batch}</span>
                             <span className="text-xs text-slate-500 flex items-center gap-1.5">
                               <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{lead.request_date}</span>
                               <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">{lead.request_time}</span>
                             </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          {lead.status === 'Pending' ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-100 text-amber-700 border-amber-200 border px-3 py-1 rounded-full text-xs font-bold mr-2">
                                🟡 Pending
                              </span>
                              <button 
                                onClick={() => handleStatusChange(lead.id, 'Scheduled')}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm"
                                title="Approve & Schedule"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(lead.id, 'Rejected')}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                title="Reject Request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                              lead.status === 'Scheduled' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}>
                              {lead.status === 'Scheduled' ? '🟢 Scheduled' : '⚫ Rejected'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 md:text-right align-middle">
                           <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-4 py-2 rounded-xl transition-all font-semibold text-xs border border-[#25D366]/20 shadow-sm">
                              <MessageCircle className="w-4 h-4" /> Chat
                           </a>
                        </td>
                      </tr>
                    );
                  })}
                  {leads.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          No demo requests yet. Keep marketing!
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


