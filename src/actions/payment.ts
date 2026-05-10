export async function createRazorpayOrder(amount: number, batchId: string) {
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, batchId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create Razorpay order');
  }

  return response.json();
}
