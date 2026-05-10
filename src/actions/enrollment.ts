export async function verifyAndEnroll(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, student_id: string, batch_id: string, amount: number) {
  const response = await fetch('/api/verify-enrollment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
