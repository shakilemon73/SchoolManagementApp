import { Student, Teacher, Class, Attendance, Grade } from "./schema";

export type StudentWithDetails = Student & {
  class: Class;
};

export type TeacherWithDetails = Teacher & {
  classes: Class[];
};

export type ClassWithDetails = Class & {
  teacher: Teacher;
  students: Student[];
};

export type AttendanceWithDetails = Attendance & {
  student: Student;
  class: Class;
};

export type GradeWithDetails = Grade & {
  student: Student;
  class: Class;
};