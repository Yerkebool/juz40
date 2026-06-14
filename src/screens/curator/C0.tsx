import { useState } from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Search, MapPin } from 'lucide-react';
import type { Task, EventItem, Submission, Course } from '../../types';
import { WeekStrip } from '../../components/WeekStrip';
import { TaskRow } from '../../components/TaskRow';
import { CourseChip } from '../../components/CourseChip';
import { getTasksForDay, getEventsForDay } from '../../lib/rules';
import { courses, CURRENT_STUDENT_ID } from '../../data/mock';

interface C0Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  events: EventItem[];
  submissions: Submission[];
  onCreateTask: () => void;
  onGoToMonth: () => void;
  onOpenControl: (taskId: string) => void;
}

export function C0({
  selectedDate,
  onSelectDate,
  tasks,
  events,
  submissions,
  onCreateTask,
  onGoToMonth,
  onOpenControl,
}: C0Props) {
  const [weekBase, setWeekBase] = useState(selectedDate);
  const [filterCourse, setFilterCourse] = useState<string | null>(null);

  const monthLabel = format(selectedDate, 'LLLL yyyy', { locale: ru });

  // For curator, show all tasks (use first student as proxy for visibility)
  const dayItems = getTasksForDay(tasks, submissions, CURRENT_STUDENT_ID, selectedDate);
  const dayEvents = getEventsForDay(events, selectedDate);

  const filtered = filterCourse
    ? dayItems.filter((i) => i.task.courseId === filterCourse)
    : dayItems;

  const groupedByPourse: { course: Course; items: typeof filtered }[] = [];
  courses.forEach((course) => {
    const courseItems = filtered.filter((i) => i.task.courseId === course.id);
    if (courseItems.length > 0) {
      groupedByPourse.push({ course, items: courseItems });
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

        {/* Course filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 thin-scrollbar">
          <CourseChip label="Все" selected={filterCourse === null} onClick={() => setFilterCourse(null)} />
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
              studentId={CURRENT_STUDENT_ID}
            />
          </div>
          <button onClick={() => setWeekBase(addWeeks(weekBase, 1))} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronRight size={16} className="text-white/50" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {/* Create task button */}
        <button
          onClick={onCreateTask}
          className="w-full py-3 rounded-2xl border border-dashed border-[#2F80ED]/40 text-[#2F80ED] text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-[#2F80ED]/08 transition-colors active:scale-[0.99]"
        >
          <Plus size={16} />
          <span>Создать задачу</span>
        </button>

        {/* Events */}
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
                    className="px-4 py-3 rounded-2xl"
                    style={{ background: color + '18', borderLeft: `3px solid ${color}` }}
                  >
                    <p className="text-[14px] font-semibold text-white leading-snug">{ev.title}</p>
                    {ev.location && (
                      <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
                        <MapPin size={10} strokeWidth={2.5} />
                        {ev.location}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks */}
        {groupedByPourse.length > 0 ? (
          <div className="space-y-3">
            {groupedByPourse.map(({ course, items }) => (
              <div
                key={course.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${course.color}` }}
              >
                <div className="px-4 pt-3 pb-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: course.color + 'bb' }}>
                    {course.name}
                  </span>
                </div>
                <div className="px-4 divide-y divide-white/[0.05]">
                  {items.map(({ task, submission }) => (
                    <div key={task.id} className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <TaskRow task={task} submission={submission} onClick={onOpenControl} />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenControl(task.id); }}
                        className="ml-2 flex-shrink-0 text-[10.5px] text-white/25 hover:text-white/50 transition-colors border border-white/10 hover:border-white/25 px-2 py-1 rounded-lg"
                      >
                        контроль
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pb-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-[15px] font-medium text-white/50">Создайте первую задачу для учеников</p>
          </div>
        )}
      </div>
    </div>
  );
}
