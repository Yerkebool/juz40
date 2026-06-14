import { useState } from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Search, ChevronLeft, ChevronRight, Plus, ChevronDown, MapPin } from 'lucide-react';
import type { Task, EventItem, Submission, Course } from '../../types';
import { WeekStrip } from '../../components/WeekStrip';
import { TaskRow } from '../../components/TaskRow';
import { ProgressBar } from '../../components/ProgressBar';
import { CourseChip } from '../../components/CourseChip';
import { getTasksForDay, getEventsForDay, getTaskStatus } from '../../lib/rules';
import { courses } from '../../data/mock';

interface S1Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  events: EventItem[];
  submissions: Submission[];
  studentId: string;
  onToggleTask: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onCreateTask: () => void;
  onGoToMonth: () => void;
}

export function S1({
  selectedDate,
  onSelectDate,
  tasks,
  events,
  submissions,
  studentId,
  onToggleTask,
  onOpenTask,
  onCreateTask,
  onGoToMonth,
}: S1Props) {
  const [weekBase, setWeekBase] = useState(selectedDate);
  const [filterCourse, setFilterCourse] = useState<string | null>(null);
  const [completedOpen, setCompletedOpen] = useState(false);
  const now = new Date();

  const monthLabel = format(selectedDate, 'LLLL yyyy', { locale: ru });

  const dayItems = getTasksForDay(tasks, submissions, studentId, selectedDate);
  const dayEvents = getEventsForDay(events, selectedDate);

  // Filter by course
  const filtered = filterCourse
    ? dayItems.filter((i) => i.task.courseId === filterCourse)
    : dayItems;

  const pending = filtered.filter(({ task, submission }) => {
    const s = getTaskStatus(task, submission, now);
    return s !== 'done';
  });

  const done = filtered.filter(({ task, submission }) => {
    const s = getTaskStatus(task, submission, now);
    return s === 'done';
  });

  const total = filtered.length;
  const doneCount = done.length;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;

  // Group pending by course
  const groupedPending: { course: Course; items: typeof pending }[] = [];
  courses.forEach((course) => {
    const courseItems = pending.filter((i) => i.task.courseId === course.id);
    if (courseItems.length > 0) {
      groupedPending.push({ course, items: courseItems });
    }
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onGoToMonth}
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-base font-semibold capitalize">{monthLabel}</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Search size={20} className="text-white/70" />
          </button>
        </div>

        {/* Course filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 thin-scrollbar">
          <CourseChip
            label="Все"
            selected={filterCourse === null}
            onClick={() => setFilterCourse(null)}
          />
          {courses.map((c) => (
            <CourseChip
              key={c.id}
              course={c}
              selected={filterCourse === c.id}
              onClick={() => setFilterCourse(filterCourse === c.id ? null : c.id)}
            />
          ))}
        </div>
      </div>

      {/* Week strip */}
      <div className="px-2 py-2">
        <div className="flex items-center gap-1 mb-1">
          <button onClick={() => setWeekBase(subWeeks(weekBase, 1))} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronLeft size={16} className="text-white/50" />
          </button>
          <div className="flex-1">
            <WeekStrip
              selectedDate={selectedDate}
              onSelectDate={(d) => { onSelectDate(d); setWeekBase(d); }}
              tasks={tasks}
              events={events}
              submissions={submissions}
              studentId={studentId}
            />
          </div>
          <button onClick={() => setWeekBase(addWeeks(weekBase, 1))} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronRight size={16} className="text-white/50" />
          </button>
        </div>
      </div>

      {/* Day content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {/* Progress — inline, no card */}
        {total > 0 && (
          <div className="pt-1 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] text-white/45">
                Выполнено {doneCount} из {total}
              </span>
              <span className="text-[12px] font-semibold text-[#2F80ED]">
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}

        {/* Events for today */}
        {dayEvents.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.12em] mb-2 px-1">
              Мероприятия
            </p>
            <div className="space-y-2">
              {dayEvents.map((ev) => {
                const course = courses.find((c) => c.id === ev.courseId);
                const color = course?.color ?? '#6B7280';
                return (
                  <div
                    key={ev.id}
                    className="px-4 py-3 rounded-2xl flex items-center gap-3"
                    style={{
                      background: color + '18',
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-white leading-snug">
                        {ev.title}
                      </p>
                      {ev.location && (
                        <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
                          <MapPin size={10} strokeWidth={2.5} />
                          {ev.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks grouped by course */}
        {groupedPending.length > 0 ? (
          <div className="space-y-3">
            {groupedPending.map(({ course, items }) => (
              <div
                key={course.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderLeft: `3px solid ${course.color}`,
                }}
              >
                {/* Course label */}
                <div className="px-4 pt-3 pb-0">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: course.color + 'bb' }}
                  >
                    {course.name}
                  </span>
                </div>
                {/* Task rows — divided by thin separator */}
                <div className="px-4 divide-y divide-white/[0.05]">
                  {items.map(({ task, submission }) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      submission={submission}
                      onToggle={onToggleTask}
                      onClick={onOpenTask}
                    />
                  ))}
                </div>
                <div className="pb-1" />
              </div>
            ))}
          </div>
        ) : (
          total === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">🎉</span>
              <p className="text-[15px] font-medium text-white/55">На сегодня задач нет</p>
              <p className="text-[13px] text-white/25 mt-1">Отличный день для отдыха!</p>
            </div>
          )
        )}

        {/* Completed section */}
        {done.length > 0 && (
          <div>
            <button
              onClick={() => setCompletedOpen(!completedOpen)}
              className="flex items-center gap-2 text-white/35 hover:text-white/55 transition-colors py-1"
            >
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${completedOpen ? 'rotate-180' : ''}`}
              />
              <span className="text-[12px] font-medium">
                Выполнено · {done.length}
              </span>
            </button>
            {completedOpen && (
              <div className="mt-2 rounded-2xl overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.025)' }}>
                <div className="px-4 divide-y divide-white/[0.04]">
                  {done.map(({ task, submission }) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      submission={submission}
                      onToggle={onToggleTask}
                      onClick={onOpenTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCreateTask}
        className="absolute bottom-24 right-4 w-14 h-14 rounded-full bg-[#2F80ED] flex items-center justify-center shadow-lg shadow-[#2F80ED]/40 active:scale-90 transition-all duration-200 hover:bg-[#2F80ED]/90 z-10"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
}
