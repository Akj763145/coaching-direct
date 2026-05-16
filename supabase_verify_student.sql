-- Create an RPC to safely verify student by payment_id
CREATE OR REPLACE FUNCTION public.verify_student_by_payment(p_payment_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'id', e.id,
    'payment_id', e.payment_id,
    'created_at', e.created_at,
    'status', e.status,
    'student_name', e.student_name,
    'student_photo_url', e.student_photo_url,
    'batch', json_build_object(
      'id', b.id,
      'name', b.name,
      'subject', b.subject,
      'standard', b.standard,
      'schedule_days', b.schedule_days,
      'start_time', b.start_time,
      'end_time', b.end_time,
      'teacher', json_build_object(
        'full_name', p.full_name
      ),
      'institute', json_build_object(
        'id', i.id,
        'name', i.name,
        'logo_url', i.logo_url,
        'address', i.address
      )
    )
  ) INTO v_result
  FROM public.enrollments e
  LEFT JOIN public.batches b ON e.batch_id = b.id
  LEFT JOIN public.institutes i ON b.institute_id = i.id
  LEFT JOIN public.profiles p ON b.teacher_id = p.id
  WHERE e.payment_id = p_payment_id;

  RETURN v_result;
END;
$$;

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION public.verify_student_by_payment(text) TO anon, authenticated;
