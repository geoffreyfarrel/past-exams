-- professor_name is no longer collected or displayed; drop it
ALTER TABLE exams DROP COLUMN IF EXISTS professor_name;
