export type Role = 'student' | 'curator';

export type Course = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  courseIds: string[];
  groupId: string;
};

export type Task = {
  id: string;
  type: 'rating' | 'additional';
  createdBy: 'methodist' | 'curator' | 'student';
  title: string;
  description?: string;
  attachments: Attachment[];
  requireFileOnSubmit: boolean;
  allDay: boolean;
  dueAt: string; // ISO
  publishDate?: string;
  courseId: string;
  groupId: string;
  participants: 'all' | string[];
  lessonTag?: string;
};

export type EventItem = {
  id: string;
  createdBy: 'curator' | 'student';
  title: string;
  description?: string;
  location?: string;
  startAt: string; // ISO
  endAt?: string;
  allDay: boolean;
  courseId: string;
  groupId: string;
  participants: 'all' | string[];
};

export type Attachment = { id: string; name: string; sizeMb: number; kind: 'pdf' | 'image' | 'other' };

export type Submission = {
  taskId: string;
  studentId: string;
  files: Attachment[];
  comment?: string;
  submittedAt?: string;
  done: boolean;
};

export type DailyPlan = {
  date: string; // YYYY-MM-DD
  groupId: string;
  curatorText?: string;
  image?: string;
};
