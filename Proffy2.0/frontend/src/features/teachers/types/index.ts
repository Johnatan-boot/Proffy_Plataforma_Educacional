export interface TeacherAvailability {
  id: string;
  weekDay: number;
  from: string;
  to: string;
}

export interface Teacher {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  whatsapp: string;
  bio: string;
  subject: string;
  subjectId?: string;
  subjects?: { id: string; name: string }[];
  cost: number;
  availabilities?: TeacherAvailability[];
}

export interface TeacherSearchParams {
  subject: string;
  weekday: string;
  time: string;
}
