export async function createRazorpayOrder(amount: number, batchId: string, couponCode?: string, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount, batchId, couponCode }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create Razorpay order');
  }

  return response.json();
}
