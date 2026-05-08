CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester TEXT NOT NULL,
  professor_name TEXT NOT NULL,
  file_key TEXT NOT NULL UNIQUE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Exams are viewable by everyone"
  ON exams FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can upload exams"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to update their own exams
CREATE POLICY "Users can update their own exams"
  ON exams FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to delete their own exams
CREATE POLICY "Users can delete their own exams"
  ON exams FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);
