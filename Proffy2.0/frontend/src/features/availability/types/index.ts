export interface Availability {
  id: string;
  teacherId: string;
  weekDay: number;
  from: string;
  to: string;
}

export interface ScheduleItemInput {
  weekday: string;
  from: string;
  to: string;
}
