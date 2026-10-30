function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

type ScheduleWithDetails = {
  id: string;
  scheduledAt: Date;
  duration: number;
  room: string | null;
  className: string | null;
  status: string;
  teacher: {
    id: string;
    user: { name: string; avatar: string | null };
  };
  student: {
    id: string;
    user: { name: string };
  };
  subject: { id: string; name: string };
};

export function toScheduleEntryResponse(schedule: ScheduleWithDetails) {
  const start = schedule.scheduledAt;
  const end = new Date(start.getTime() + schedule.duration * 60 * 1000);

  return {
    id: schedule.id,
    weekday: start.getDay(),
    from: formatTime(start),
    to: formatTime(end),
    subject: schedule.subject.name,
    subjectId: schedule.subject.id,
    teacherId: schedule.teacher.id,
    teacherName: schedule.teacher.user.name,
    teacherAvatar: schedule.teacher.user.avatar ?? undefined,
    studentId: schedule.student.id,
    studentName: schedule.student.user.name,
    className: schedule.className ?? "",
    room: schedule.room ?? "",
    status: schedule.status,
    scheduledAt: schedule.scheduledAt,
    duration: schedule.duration,
  };
}
