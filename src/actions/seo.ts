
export async function fetchSeoSettings() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/master/seo-settings', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch SEO settings');
  }
  return res.json();
}

export async function updateSeoSettings(title: string, description: string, keywords: string) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/master/seo-settings', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, keywords })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update SEO settings');
  }
  return res.json();
}
