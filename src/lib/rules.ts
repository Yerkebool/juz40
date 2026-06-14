import type { Task, EventItem, Submission } from '../types';
import { isSameDay, isBefore, isAfter, parseISO, startOfDay } from 'date-fns';

export function isTaskVisibleForStudent(
  task: Task,
  submission: Submission | undefined,
  studentId: string,
  date: Date
): boolean {
  // Check participant visibility
  if (task.participants !== 'all' && !task.participants.includes(studentId)) {
    return false;
  }

  const due = parseISO(task.dueAt);
  const today = startOfDay(date);
  const dueDay = startOfDay(due);

  // For rating tasks: visible from publishDate until done or dueAt passed
  if (task.type === 'rating') {
    const pub = task.publishDate ? startOfDay(parseISO(task.publishDate)) : dueDay;
    if (isBefore(today, pub)) return false;

    // If done, only show on due date
    if (submission?.done) {
      return isSameDay(date, due);
    }

    // If overdue (past due date and not done), still show
    return !isAfter(today, dueDay) || !submission?.done;
  }

  // For additional/student tasks: show on dueAt date, overflow if undone
  if (task.type === 'additional') {
    if (isSameDay(date, due)) return true;
    // Overflow: if not done and date is after due
    if (isAfter(today, dueDay) && !submission?.done) return true;
    return false;
  }

  return false;
}

export function getTasksForDay(
  tasks: Task[],
  submissions: Submission[],
  studentId: string,
  date: Date
): { task: Task; submission: Submission | undefined }[] {
  return tasks
    .filter((task) => {
      const sub = submissions.find((s) => s.taskId === task.id && s.studentId === studentId);
      return isTaskVisibleForStudent(task, sub, studentId, date);
    })
    .map((task) => ({
      task,
      submission: submissions.find((s) => s.taskId === task.id && s.studentId === studentId),
    }));
}

export function getTaskStatus(
  task: Task,
  submission: Submission | undefined,
  now: Date
): 'done' | 'overdue' | 'pending' {
  if (submission?.done) return 'done';
  const due = parseISO(task.dueAt);
  if (isBefore(due, now)) return 'overdue';
  return 'pending';
}

export function getEventsForDay(events: EventItem[], date: Date): EventItem[] {
  return events.filter((event) => {
    const start = parseISO(event.startAt);
    if (event.endAt) {
      const end = parseISO(event.endAt);
      // Multi-day: check if date falls within [startAt, endAt]
      return (
        (isSameDay(date, start) || isAfter(date, start)) &&
        (isSameDay(date, end) || isBefore(date, end))
      );
    }
    return isSameDay(date, start);
  });
}
