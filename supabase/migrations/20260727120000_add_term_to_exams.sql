-- Midterm and final exams for the same course/year/semester are distinct documents;
-- track which term an exam belongs to so uploads no longer collide with each other.
ALTER TABLE exams
  ADD COLUMN term TEXT NOT NULL DEFAULT 'mid' CHECK (term IN ('mid', 'final'));
