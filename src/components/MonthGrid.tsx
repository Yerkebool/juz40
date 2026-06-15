import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, getDay
} from 'date-fns';
import type { Task, EventItem, Submission } from '../types';
import { getTasksForDay, getEventsForDay } from '../lib/rules';
import { courses } from '../data/mock';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface MonthGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  events: EventItem[];
  submissions: Submission[];
  studentId: string;
}

export function MonthGrid({
  currentMonth, selectedDate, onSelectDate, tasks, events, submissions, studentId
}: MonthGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const today = new Date();

  return (
    <div className="px-2">
      {/* Header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className={`text-center text-[11px] font-medium py-1 ${
              i === 6 ? 'text-red-400' : 'text-white/40'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const isSunday = getDay(day) === 0;

          const dayTasks = inMonth ? getTasksForDay(tasks, submissions, studentId, day) : [];
          const dayEvents = inMonth ? getEventsForDay(events, day) : [];

          // Collect unique colors
          const dotColors: string[] = [];
          dayTasks.forEach(({ task }) => {
            const course = courses.find((c) => c.id === task.courseId);
            if (course && !dotColors.includes(course.color)) dotColors.push(course.color);
          });
          dayEvents.forEach((ev) => {
            const course = courses.find((c) => c.id === ev.courseId);
            if (course && !dotColors.includes(course.color)) dotColors.push(course.color);
          });

          const totalItems = dayTasks.length + dayEvents.length;
          const extraCount = totalItems > 2 ? totalItems - 2 : 0;
          const visibleDots = dotColors.slice(0, 2);

          return (
            <button
              key={i}
              onClick={() => inMonth && onSelectDate(day)}
              disabled={!inMonth}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-all duration-200 ${
                !inMonth ? 'opacity-20 cursor-default' : 'hover:bg-white/10 active:scale-95'
              } ${isSelected ? 'bg-[#2F80ED]' : ''}`}
            >
              <span
                className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday && !isSelected
                    ? 'text-[#2F80ED] bg-[#2F80ED]/20'
                    : isSunday && !isSelected
                    ? 'text-red-400'
                    : 'text-white'
                }`}
              >
                {day.getDate()}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5 h-3">
                {visibleDots.map((color, di) => (
                  <div
                    key={di}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : color }}
                  />
                ))}
                {extraCount > 0 && (
                  <span className="text-[8px] text-white/50 ml-0.5">+{extraCount}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 px-2">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }} />
            <span className="text-[10px] text-white/50">{course.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
