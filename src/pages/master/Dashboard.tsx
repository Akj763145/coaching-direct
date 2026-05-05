import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MasterDashboard() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [newCredentials, setNewCredentials] = useState<any>(null);
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
    const res = await fetch('/api/master/institutes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setInstitutes(await res.json());
    } else {
      navigate('/login');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/master/institutes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, logo })
    });
    const data = await res.json();
    if (res.ok) {
      setNewCredentials(data.credentials);
      setName('');
      setLogo('');
      fetchInstitutes(token!);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Master Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage platform tenants (Institutes)</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Onboard New Institute</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Institute Name</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 outline-none" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg hover:bg-slate-800 transition">Create Institute</button>
            </div>
          </form>

          {newCredentials && (
            <div className="mt-6 bg-green-50 border border-green-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-green-800 font-bold mb-2">Institute Created!</h3>
              <p className="text-sm text-green-700 mb-4">Save these Sub-Admin credentials. They will only be shown once.</p>
              <div className="bg-white rounded-lg p-3 border border-green-200 font-mono text-sm space-y-1">
                <div><span className="text-slate-400">Username:</span> {newCredentials.username}</div>
                <div><span className="text-slate-400">Password:</span> {newCredentials.password}</div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Registered Institutes</h2>
          {institutes.length === 0 ? (
            <p className="text-slate-500">No institutes added yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {institutes.map(inst => (
                <div key={inst.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                  {inst.logo ? (
                    <img src={inst.logo} alt="" className="w-12 h-12 rounded object-cover bg-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
                      {inst.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{inst.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono">@{inst.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
