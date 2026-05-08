import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, MapPin, Download, Save, Grid, FileText, Eye, CheckSquare, Bookmark, Users, Bell, BookOpen, AlertCircle, Star, Calendar, Edit, Phone, Globe, Mail, MessageSquare, Flag, Reply } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function SubAdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'batches' | 'notices' | 'faculty' | 'resources' | 'reviews'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const navigate = useNavigate();

  // Category Form
  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#3b82f6' });
  const [editingCategoryId, setEditingCategoryId] = useState<number | string | null>(null);

  // Faculty Form
  const [facultyForm, setFacultyForm] = useState({ name: '', subject: '', image_url: '', qualifications: '', bio: '', experience: '' });
  const [editingFacultyId, setEditingFacultyId] = useState<number | string | null>(null);

  // Batch Form - Advanced Builder
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<number | string | null>(null);
  const [batchForm, setBatchForm] = useState({
    batch_name: '', subject: '', category_id: '' as string | number, medium: 'English', board_target: 'CBSE',
    batch_timing: '', batch_duration: '', start_date: '', fee_structure: '', 
    status: 'running', mode: 'Offline', total_seats: 50, available_seats: 50,
    syllabus_pdf: '', teacher_name: '', teacher_image: '', teacher_bio: '', 
    curriculum: [{ title: '', content: '' }],
    faculty_ids: [] as (number | string)[]
  });

  const resetBatchForm = () => {
    setBatchForm({ 
      batch_name: '', subject: '', category_id: '', medium: 'English', board_target: 'CBSE',
      batch_timing: '', batch_duration: '', start_date: '', fee_structure: '', 
      status: 'running', mode: 'Offline', total_seats: 50, available_seats: 50,
      syllabus_pdf: '', teacher_name: '', teacher_image: '', teacher_bio: '', 
      curriculum: [{ title: '', content: '' }],
      faculty_ids: []
    });
    setEditingBatchId(null);
  };

  const handleEditBatch = async (batch: any) => {
    // We need to fetch the full batch details (including faculty_ids and parsed curriculum)
    // to ensure the form is correctly populated
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/public/batches/${batch.id}`);
    if (res.ok) {
      const fullBatch = await res.json();
      setBatchForm({
        batch_name: fullBatch.batch_name || '',
        subject: fullBatch.subject || '',
        category_id: fullBatch.category_id || '',
        medium: fullBatch.medium || 'English',
        board_target: fullBatch.board_target || 'CBSE',
        batch_timing: fullBatch.batch_timing || '',
        batch_duration: fullBatch.batch_duration || '',
        start_date: fullBatch.start_date || '',
        fee_structure: fullBatch.fee_structure || '',
        status: fullBatch.status || 'running',
        mode: fullBatch.mode || 'Offline',
        total_seats: fullBatch.total_seats || 50,
        available_seats: fullBatch.available_seats || 50,
        syllabus_pdf: fullBatch.syllabus_pdf || '',
        teacher_name: fullBatch.teacher_name || '',
        teacher_image: fullBatch.teacher_image || '',
        teacher_bio: fullBatch.teacher_bio || '',
        curriculum: fullBatch.syllabus || [{ title: '', content: '' }],
        faculty_ids: (fullBatch.teachers || []).map((t: any) => t.id)
      });
      setEditingBatchId(batch.id);
      setShowBatchForm(true);
    }
  };

  // Notice Form
  const [noticeForm, setNoticeForm] = useState({ title: '', date: '', description: '', type: 'announcement' });
  const [editingNoticeId, setEditingNoticeId] = useState<number | string | null>(null);

  // Document Form
  const [docForm, setDocForm] = useState({ title: '', size: '', format: 'PDF', url: '' });
  const [editingDocId, setEditingDocId] = useState<number | string | null>(null);

  // Review Form
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    try {
      const pRes = await fetch('/api/institute/profile', { headers: { 'Authorization': `Bearer ${token}` }});
      if (pRes.ok) setProfile(await pRes.json());
      else { navigate('/login'); return; }

      const bRes = await fetch('/api/institute/batches', { headers: { 'Authorization': `Bearer ${token}` }});
      if (bRes.ok) setBatches(await bRes.json());

      const nRes = await fetch('/api/institute/notices', { headers: { 'Authorization': `Bearer ${token}` }});
      if (nRes.ok) setNotices(await nRes.json());

      const dRes = await fetch('/api/institute/documents', { headers: { 'Authorization': `Bearer ${token}` }});
      if (dRes.ok) setDocuments(await dRes.json());

      const fRes = await fetch('/api/institute/faculty', { headers: { 'Authorization': `Bearer ${token}` }});
      if (fRes.ok) setFaculty(await fRes.json());

      const cRes = await fetch('/api/institute/categories', { headers: { 'Authorization': `Bearer ${token}` }});
      if (cRes.ok) setCategories(await cRes.json());

      const rRes = await fetch('/api/institute/reviews', { headers: { 'Authorization': `Bearer ${token}` }});
      if (rRes.ok) setReviews(await rRes.json());
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/institute/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      alert('Profile updated successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBatch = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingBatchId ? 'PUT' : 'POST';
      const url = editingBatchId ? `/api/institute/batches/${editingBatchId}` : '/api/institute/batches';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(batchForm)
      });
      if (res.ok) {
        resetBatchForm();
        setShowBatchForm(false);
        fetchData(token!);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if(!window.confirm('Are you sure you want to delete this batch?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institute/batches/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      fetchData(token!);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateBatch = async (id: number, updates: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/institute/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      fetchData(token!);
    }
  };

  const handleAddNotice = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingNoticeId ? 'PUT' : 'POST';
      const url = editingNoticeId ? `/api/institute/notices/${editingNoticeId}` : '/api/institute/notices';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(noticeForm)
      });
      if (res.ok) {
        setNoticeForm({ title: '', date: '', description: '', type: 'announcement' });
        setEditingNoticeId(null);
        fetchData(token!);
        alert(editingNoticeId ? 'Notice updated!' : 'Notice published!');
      } else {
        const errData = await res.json();
        alert(`Failed: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNotice = (notice: any) => {
    setNoticeForm({
      title: notice.title || '',
      date: notice.date || '',
      description: notice.description || '',
      type: notice.type || 'announcement'
    });
    setEditingNoticeId(notice.id);
  };

  const handleAddDocument = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingDocId ? 'PUT' : 'POST';
      const url = editingDocId ? `/api/institute/documents/${editingDocId}` : '/api/institute/documents';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(docForm)
      });
      if (res.ok) {
        setDocForm({ title: '', size: '', format: 'PDF', url: '' });
        setEditingDocId(null);
        fetchData(token!);
        alert(editingDocId ? 'Resource updated!' : 'Resource added!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDocument = (doc: any) => {
    setDocForm({
      title: doc.title || '',
      size: doc.size || '',
      format: doc.format || 'PDF',
      url: doc.url || ''
    });
    setEditingDocId(doc.id);
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('Delete this resource?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institute/documents/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      fetchData(token!);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!window.confirm('Delete this notice?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/institute/notices/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) {
        fetchData(token!);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddFaculty = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingFacultyId ? 'PUT' : 'POST';
      const url = editingFacultyId ? `/api/institute/faculty/${editingFacultyId}` : '/api/institute/faculty';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(facultyForm)
      });
      if (res.ok) {
        setFacultyForm({ name: '', subject: '', image_url: '', qualifications: '', bio: '', experience: '' });
        setEditingFacultyId(null);
        fetchData(token!);
        alert(editingFacultyId ? 'Faculty updated!' : 'Faculty profile saved!');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFaculty = (member: any) => {
    setFacultyForm({
      name: member.name || '',
      subject: member.subject || '',
      image_url: member.image_url || '',
      qualifications: member.qualifications || '',
      bio: member.bio || '',
      experience: member.experience || ''
    });
    setEditingFacultyId(member.id);
  };

  const handleDeleteFaculty = async (id: number) => {
    if (!window.confirm('Delete this faculty member?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institute/faculty/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      fetchData(token!);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingCategoryId ? 'PUT' : 'POST';
      const url = editingCategoryId ? `/api/institute/categories/${editingCategoryId}` : '/api/institute/categories';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setCategoryForm({ name: '', color: '#3b82f6' });
        setEditingCategoryId(null);
        fetchData(token!);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (cat: any) => {
    setCategoryForm({ name: cat.name, color: cat.color || '#3b82f6' });
    setEditingCategoryId(cat.id);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institute/categories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      fetchData(token!);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReplyReview = async (id: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/institute/reviews/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reply_text: replyText })
      });
      if (res.ok) {
        setReplyText('');
        setReplyingToId(null);
        fetchData(token!);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlagReview = async (id: string, currentlyFlagged: boolean) => {
    if (!window.confirm(currentlyFlagged ? 'Unflag this review?' : 'Flag this review as inappropriate?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/institute/reviews/${id}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_flagged: !currentlyFlagged })
      });
      if (res.ok) {
        fetchData(token!);
      }
    } finally {
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
        />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Waking up workspace...</h2>
        <p className="text-slate-500 mt-1">Please wait while we sync your institute data.</p>
      </div>
    );
  }

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
            { id: 'categories', label: 'Categories', icon: CheckSquare },
            { id: 'faculty', label: 'Faculty', icon: Users },
            { id: 'batches', label: 'Batch Builder', icon: FileText },
            { id: 'notices', label: 'Board', icon: Bell },
            { id: 'resources', label: 'Resources', icon: BookOpen },
            { id: 'reviews', label: 'Reviews', icon: Star }
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Support Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Verified WhatsApp Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <input type="text" value={profile.whatsapp_number || ''} onChange={e => setProfile({...profile, whatsapp_number: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white" placeholder="+91 9876543210" />
                    </div>
                  </div>
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
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">About / Description</label>
                  <textarea 
                    value={profile.description || ''} 
                    onChange={e => setProfile({...profile, description: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow dark:text-white min-h-[100px]" 
                    placeholder="Tell us about your institute..."
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-colors shadow-sm ml-auto ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <form onSubmit={handleAddCategory} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 sticky top-24">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category Name</label>
                    <input required type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="e.g. Medical" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Color Theme</label>
                    <div className="flex gap-2">
                       <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="w-10 h-10 border-none bg-transparent cursor-pointer" />
                       <input type="text" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none dark:text-white" />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editingCategoryId ? 'Update Category' : 'Create Category'}
                  </button>
                  {editingCategoryId && (
                    <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: '', color: '#3b82f6' }); }} className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 uppercase py-1">Cancel</button>
                  )}
                </form>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Categories</h2>
                    <p className="text-xs text-slate-500">Manage your coaching streams and subjects.</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{categories.length} Total</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: cat.color || '#3b82f6' }}>
                          {cat.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{cat.color || '#3b82f6'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button disabled={deletingId === cat.id} onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800">
                          {deletingId === cat.id ? <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="sm:col-span-2 py-12 text-center bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                       <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                       <p className="text-slate-500 font-medium">No categories started yet.</p>
                       <p className="text-[11px] text-slate-400">Define categories like JEE, NEET, or UPSC to organize batches.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {!showBatchForm ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Batches</h2>
                  <button onClick={() => { resetBatchForm(); setShowBatchForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Create Advanced Batch
                  </button>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {isLoading && batches.length === 0 ? (
                    [1,2,3,4].map(i => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse flex flex-col gap-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                          <div className="flex-1 space-y-2">
                             <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                             <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-8 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                           <div className="h-8 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                        </div>
                        <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                      </div>
                    ))
                  ) : batches.map(batch => (
                    <div key={batch.id} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm relative group flex flex-col h-full">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={() => handleEditBatch(batch)} 
                          className="p-2 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all active:scale-95 shadow-sm border border-blue-100 dark:border-blue-800"
                          title="Edit Batch"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          disabled={deletingId === batch.id} 
                          onClick={() => handleDeleteBatch(batch.id)} 
                          className="p-2 text-red-600 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 rounded-xl transition-all active:scale-95 shadow-sm border border-red-100 dark:border-red-800 disabled:opacity-50"
                          title="Delete Batch"
                        >
                          {deletingId === batch.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="flex gap-4 items-start mb-6 pr-24">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border flex-shrink-0">
                          {batch.teacher_image ? <img src={batch.teacher_image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-500">{batch.teacher_name?.charAt(0)}</div>}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                            {batch.batch_name}
                            <button 
                              onClick={() => handleUpdateBatch(batch.id, { status: batch.status === 'running' ? 'not_running' : 'running' })}
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full transition-transform active:scale-95 ${batch.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                            >
                              {batch.status}
                            </button>
                            {batch.category_id && (
                              <span 
                                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: categories.find(c => String(c.id) === String(batch.category_id))?.color || '#3b82f6' }}
                              >
                                {categories.find(c => String(c.id) === String(batch.category_id))?.name || 'Category'}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">By {batch.teacher_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6 flex-grow">
                        <div className="flex flex-col"><span className="text-slate-400 text-xs uppercase font-semibold">Subject / Target</span><span className="text-slate-800 dark:text-slate-200 font-medium">{batch.subject} • {batch.board_target}</span></div>
                        <div className="flex flex-col"><span className="text-slate-400 text-xs uppercase font-semibold">Medium</span><span className="text-slate-800 dark:text-slate-200 font-medium">{batch.medium}</span></div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs uppercase font-semibold">Timing / Seats</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{batch.batch_timing} • {batch.available_seats}/{batch.total_seats} Left</span>
                            <div className="flex gap-1 ml-1">
                              <button 
                                disabled={deletingId === batch.id}
                                onClick={() => handleUpdateBatch(batch.id, { available_seats: Math.max(0, batch.available_seats - 1) })}
                                className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                              >
                                -
                              </button>
                              <button 
                                disabled={deletingId === batch.id}
                                onClick={() => handleUpdateBatch(batch.id, { available_seats: Math.min(batch.total_seats, batch.available_seats + 1) })}
                                className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
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
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingBatchId ? 'Edit Batch Configuration' : 'Add New Batch'}
                  </h2>
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
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                          <input required type="text" value={batchForm.subject} onChange={e => setBatchForm({...batchForm, subject: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" placeholder="e.g. Physics" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stream Category</label>
                          <select value={batchForm.category_id} onChange={e => setBatchForm({...batchForm, category_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white">
                            <option value="">No Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Fee Structure</label>
                          <input required type="text" value={batchForm.fee_structure} onChange={e => setBatchForm({...batchForm, fee_structure: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white font-mono" placeholder="₹45000" />
                        </div>
                      </div>
                    </div>

                    {/* Faculty Team Selection */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 inline-block px-3 py-1 rounded-full">Assign Faculty Team</h3>
                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 mb-4">Select the teachers who will be teaching this batch. You can add more teachers in the "Faculty" tab.</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {faculty.map(f => (
                            <label key={f.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${batchForm.faculty_ids.includes(f.id) ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-200'}`}>
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={batchForm.faculty_ids.includes(f.id)}
                                onChange={e => {
                                  const ids = e.target.checked 
                                    ? [...batchForm.faculty_ids, f.id]
                                    : batchForm.faculty_ids.filter(id => id !== f.id);
                                  setBatchForm({...batchForm, faculty_ids: ids});
                                }}
                              />
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                  {f.image_url ? <img src={f.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">{f.name.charAt(0)}</div>}
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{f.name}</div>
                                  <div className="text-[10px] text-slate-500 font-medium truncate">{f.subject}</div>
                                </div>
                              </div>
                            </label>
                          ))}
                          {faculty.length === 0 && (
                            <div className="col-span-2 text-center py-6 text-slate-500 text-xs italic">
                              No faculty found. Add faculty members first to assign them to batches.
                            </div>
                          )}
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

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Batch Mode</label>
                        <select value={batchForm.mode} onChange={e => setBatchForm({...batchForm, mode: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none cursor-pointer dark:text-white">
                          <option value="Offline">Offline</option>
                          <option value="Online">Online</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Current Status</label>
                        <select value={batchForm.status} onChange={e => setBatchForm({...batchForm, status: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none cursor-pointer dark:text-white font-bold">
                          <option value="running">Running (Active Admissions)</option>
                          <option value="not_running">Inactive (No Admissions)</option>
                        </select>
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

                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className={`w-full py-4 text-white rounded-2xl font-bold transition-all shadow-md flex justify-center items-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                    >
                       {isSubmitting ? (
                         <>
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           Processing...
                         </>
                       ) : (editingBatchId ? 'Save Changes' : 'Publish To Live Website')}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Notice Board Management */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <form onSubmit={handleAddNotice} className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Bell className="w-5 h-5 text-blue-500" />
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingNoticeId ? 'Edit Notice' : 'Post Live Notice'}</h3>
                    </div>
                    {editingNoticeId && <button type="button" onClick={() => { setEditingNoticeId(null); setNoticeForm({ title: '', date: '', description: '', type: 'announcement' }); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Cancel</button>}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Notice Title</label>
                      <input required type="text" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="e.g. New Batch Starting" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Display Date</label>
                        <input required type="text" value={noticeForm.date} onChange={e => setNoticeForm({...noticeForm, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="Oct 24 or 24-10-24" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Notice Type</label>
                        <select value={noticeForm.type} onChange={e => setNoticeForm({...noticeForm, type: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white">
                          <option value="announcement">Announcement</option>
                          <option value="holiday">Holiday Notice</option>
                          <option value="event">Upcoming Event</option>
                          <option value="alert">Critical Alert</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Detailed Context</label>
                      <textarea required value={noticeForm.description} onChange={e => setNoticeForm({...noticeForm, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" rows={3} placeholder="Tell students more details..."></textarea>
                    </div>
                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className={`w-full py-3 text-white rounded-xl font-semibold shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (editingNoticeId ? 'Save Changes' : 'Publish To Board')}
                    </button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2 ml-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Notices ({notices.length})</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Sub-Admin Only View</p>
                </div>
                <div className="space-y-3">
                  {isLoading && notices.length === 0 ? (
                     [1,2,3].map(i => (
                       <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 animate-pulse">
                         <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                         <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                         </div>
                       </div>
                     ))
                  ) : notices.map((n) => (
                    <div key={n.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          n.type === 'holiday' ? 'bg-orange-50 text-orange-500' :
                          n.type === 'event' ? 'bg-purple-50 text-purple-500' :
                          n.type === 'alert' ? 'bg-red-50 text-red-500' :
                          'bg-blue-50 text-blue-500'
                        }`}>
                          {n.type === 'holiday' ? <Calendar className="w-5 h-5" /> : 
                           n.type === 'event' ? <Star className="w-5 h-5" /> : 
                           n.type === 'alert' ? <AlertCircle className="w-5 h-5" /> :
                           <Bell className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{n.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">{n.date}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                             <span className="text-[9px] uppercase font-black text-blue-500 opacity-60 tracking-wider">
                               {n.type}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button 
                          onClick={() => handleEditNotice(n)} 
                          className="p-2 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all active:scale-95 border border-blue-100 dark:border-blue-800"
                          title="Edit Notice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          disabled={deletingId === n.id} 
                          onClick={() => handleDeleteNotice(n.id)} 
                          className="p-2 text-red-600 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 rounded-xl transition-all active:scale-95 border border-red-100 dark:border-red-800 disabled:opacity-50"
                          title="Delete Notice"
                        >
                          {deletingId === n.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {notices.length === 0 && <p className="text-slate-500 text-sm mt-8 border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center rounded-[40px]">No active notices found. Keep students updated about new batches or holidays.</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Resource Center Management */}
            <div className="grid lg:grid-cols-3 gap-8 pb-10">
              <div className="lg:col-span-1">
                <form onSubmit={handleAddDocument} className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingDocId ? 'Edit Material' : 'Add Study Material'}</h3>
                    </div>
                    {editingDocId && <button type="button" onClick={() => { setEditingDocId(null); setDocForm({ title: '', size: '', format: 'PDF', url: '' }); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Cancel</button>}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Document Title</label>
                      <input required type="text" value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="Physics Notes - Ch 1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Size (e.g. 1.2 MB)</label>
                        <input type="text" value={docForm.size} onChange={e => setDocForm({...docForm, size: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="2.5 MB" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Format</label>
                        <select value={docForm.format} onChange={e => setDocForm({...docForm, format: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white">
                          <option value="PDF">PDF Document</option>
                          <option value="DOCX">Word Doc</option>
                          <option value="ZIP">ZIP Archive</option>
                          <option value="Video">Video Link</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Resource URL / Link</label>
                      <input required type="text" value={docForm.url} onChange={e => setDocForm({...docForm, url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="https://drive.google.com/..." />
                    </div>
                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className={`w-full py-3 text-white rounded-xl font-semibold shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (editingDocId ? 'Save Changes' : 'Add Resource')}
                    </button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 ml-1">Study Materials ({documents.length})</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                   {documents.map((doc) => (
                     <div key={doc.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                       <div className="flex items-center gap-3 min-w-0">
                         <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                           <FileText className="w-5 h-5" />
                         </div>
                         <div className="min-w-0">
                           <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{doc.title}</h4>
                           <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{doc.format} • {doc.size}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button 
                            onClick={() => handleEditDocument(doc)} 
                            className="p-2 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all active:scale-95 border border-blue-100 dark:border-blue-800"
                            title="Edit Material"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 rounded-xl transition-all active:scale-95 border border-indigo-100 dark:border-indigo-800"
                            title="View Material"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button 
                            disabled={deletingId === doc.id} 
                            onClick={() => handleDeleteDocument(doc.id)} 
                            className="p-2 text-red-600 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 rounded-xl transition-all active:scale-95 border border-red-100 dark:border-red-800 disabled:opacity-50"
                            title="Delete Material"
                          >
                            {deletingId === doc.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                       </div>
                     </div>
                   ))}
                   {documents.length === 0 && <div className="sm:col-span-2 py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px]">
                      <h3 className="text-slate-500 text-sm">No resources added yet.</h3>
                   </div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <form onSubmit={handleAddFaculty} className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingFacultyId ? 'Edit Faculty' : 'Add Faculty Member'}</h3>
                  {editingFacultyId && <button type="button" onClick={() => { setEditingFacultyId(null); setFacultyForm({ name: '', subject: '', image_url: '', qualifications: '', bio: '', experience: '' }); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Cancel</button>}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Full Name</label>
                    <input required type="text" value={facultyForm.name} onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="Prof. John Doe" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Subject / Department</label>
                    <input required type="text" value={facultyForm.subject} onChange={e => setFacultyForm({...facultyForm, subject: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="Physics HOD" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Image URL (Optional)</label>
                    <input type="text" value={facultyForm.image_url} onChange={e => setFacultyForm({...facultyForm, image_url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Exp (e.g. 10+ Yrs)</label>
                      <input type="text" value={facultyForm.experience} onChange={e => setFacultyForm({...facultyForm, experience: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="10+ Yrs" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Qualifications</label>
                      <input type="text" value={facultyForm.qualifications} onChange={e => setFacultyForm({...facultyForm, qualifications: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" placeholder="M.Tech, IIT" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Bio / Teacher Quote</label>
                    <textarea value={facultyForm.bio} onChange={e => setFacultyForm({...facultyForm, bio: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white" rows={2} placeholder="Briefly describe teaching expertise..."></textarea>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className={`w-full py-3 text-white rounded-xl font-semibold shadow-sm transition flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving Profile...
                      </>
                    ) : (editingFacultyId ? 'Save Changes' : 'Save Teacher Profile')}
                  </button>
                </div>
              </form>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 ml-1">Current Faculty ({faculty.length})</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {isLoading && faculty.length === 0 ? (
                   [1,2,3,4].map(i => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 animate-pulse">
                       <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                       <div className="flex-1 space-y-2">
                         <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                         <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                       </div>
                     </div>
                   ))
                ) : faculty.map((member) => (
                  <div key={member.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        {member.image_url ? <img src={member.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{member.name.charAt(0)}</div>}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{member.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.subject}</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button 
                        onClick={() => handleEditFaculty(member)} 
                        className="p-2 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all active:scale-95 border border-blue-100 dark:border-blue-800"
                        title="Edit Faculty"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={deletingId === member.id} 
                        onClick={() => handleDeleteFaculty(member.id)} 
                        className="p-2 text-red-600 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 rounded-xl transition-all active:scale-95 border border-red-100 dark:border-red-800 disabled:opacity-50"
                        title="Delete Faculty"
                      >
                        {deletingId === member.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {faculty.length === 0 && <p className="text-slate-500 text-sm mt-8 border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center rounded-[24px]">No faculty members added. Add your top educators to build trust with students.</p>}
            </div>
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reputation Management</h2>
                <p className="text-slate-500 dark:text-slate-400">Monitor student feedback and respond to reviews.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Average Rating</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white leading-none mt-0.5">{Number(profile.rating || 0).toFixed(1)}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Total Reviews</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white leading-none mt-0.5">{reviews.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No reviews yet</h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">Share your institute link with students to start collecting valuable feedback and building your reputation.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <motion.div 
                    layout
                    key={review.id} 
                    className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border transition-all ${review.is_flagged ? 'border-red-200 dark:border-red-900/30 bg-red-50/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'}`}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {review.student_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{review.student_name || 'Anonymous Student'}</h4>
                              <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()} • {review.batch_id || 'General Review'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                          {review.review_text}
                        </p>

                        {review.reply_text && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institute Response</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{review.reply_text}"</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {!review.reply_text && (
                            <button 
                              onClick={() => setReplyingToId(replyingToId === review.id ? null : review.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {replyingToId === review.id ? 'Cancel' : 'Reply'}
                            </button>
                          )}
                          <button 
                            onClick={() => handleFlagReview(review.id, review.is_flagged)}
                            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${review.is_flagged ? 'text-red-700 bg-red-100 dark:bg-red-900/40' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                          >
                            <Flag className="w-4 h-4" />
                            {review.is_flagged ? 'Flagged' : 'Flag as Inappropriate'}
                          </button>
                        </div>

                        <AnimatePresence>
                          {replyingToId === review.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4"
                            >
                              <div className="space-y-3">
                                <textarea 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a professional response to the student..."
                                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white h-24 resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => setReplyingToId(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    disabled={isSubmitting || !replyText.trim()}
                                    onClick={() => handleReplyReview(review.id)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                  >
                                    {isSubmitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    Post Reply
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


