export enum CourseYear {
  FRESHMAN = 'freshman',
  SOPHOMORE = 'sophomore',
  JUNIOR = 'junior',
  SENIOR = 'senior',
}

export enum ProfileRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum ExamTerm {
  MID = 'mid',
  FINAL = 'final',
}

export interface College {
  id: string;
  name: string;
}

export interface Major {
  id: string;
  name: string;
  code: string;
  colleges?: College | College[];
}

export interface Course {
  id: string;
  name: string;
  category: CourseYear;
  course_type: 'required' | 'elective';
  majors?: { code: string } | { code: string }[];
}

export interface Exam {
  id: string;
  course_id: string;
  year: number;
  semester: string;
  term: ExamTerm;
  name: string;
  file_key: string;
  uploader_id: string;
  created_at: string;
}

export type Profile = {
  id: string;
  username: string;
  role: ProfileRole;
};
