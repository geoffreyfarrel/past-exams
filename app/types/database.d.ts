export interface College {
  id: string;
  name: string;
}

export interface Major {
  id: string;
  name: string;
  code: string;
  colleges: College | College[];
}

enum CourseYear {
  FRESHMAN = 'freshman',
  SOPHOMORE = 'sophomore',
  JUNIOR = 'junior',
  SENIOR = 'senior',
}

export interface Course {
  id: string;
  name: string;
  category: CourseYear;
  course_type: 'required' | 'elective';
}

export interface Exam {
  id: string;
  course_id: string;
  uploader: string;
  name: string;
  year: number;
  file_key: string;
  file_type: string;
  year: number;
  semester: string;
}
