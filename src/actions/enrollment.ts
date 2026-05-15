export async function verifyAndEnroll(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, student_id: string, batch_id: string, amount: number, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/verify-enrollment', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_id,
      batch_id,
      amount
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to verify payment');
  }

  return response.json();
}
