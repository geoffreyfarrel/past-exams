-- Promote the connected account to admin so it can upload exams
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'geoffreyfarrel67@gmail.com');

-- Only admins may insert/update/delete exams; everyone can still read them
DROP POLICY IF EXISTS "Authenticated users can upload exams" ON exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON exams;

CREATE POLICY "Admins can upload exams"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update exams"
  ON exams FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete exams"
  ON exams FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
