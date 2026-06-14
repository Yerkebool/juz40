import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import type { Task, EventItem, Submission } from '../types';
import { getTasksForDay, getEventsForDay } from '../lib/rules';
import { courses } from '../data/mock';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  events: EventItem[];
  submissions: Submission[];
  studentId: string;
}

export function WeekStrip({ selectedDate, onSelectDate, tasks, events, submissions, studentId }: WeekStripProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();

  return (
    <div className="flex gap-1 px-2">
      {days.map((day, i) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const isSunday = getDay(day) === 0;
        const dayTasks = getTasksForDay(tasks, submissions, studentId, day);
        const dayEvents = getEventsForDay(events, day);

        // Collect up to 3 dot colors
        const dots: string[] = [];
        dayTasks.slice(0, 2).forEach(({ task }) => {
          const course = courses.find((c) => c.id === task.courseId);
          if (course && !dots.includes(course.color)) dots.push(course.color);
        });
        dayEvents.slice(0, 1).forEach((ev) => {
          const course = courses.find((c) => c.id === ev.courseId);
          if (course && !dots.includes(course.color)) dots.push(course.color);
        });

        return (
          <button
            key={i}
            onClick={() => onSelectDate(day)}
            className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all duration-200 ${
              isSelected ? 'bg-[#2F80ED]' : 'hover:bg-white/10'
            }`}
          >
            <span className={`text-[10px] font-medium mb-1 ${
              isSunday && !isSelected ? 'text-red-400' : 'text-white/50'
            }`}>
              {DAY_LABELS[i]}
            </span>
            <div
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                isToday && !isSelected
                  ? 'bg-[#2F80ED]/30 text-[#2F80ED]'
                  : isSunday && !isSelected
                  ? 'text-red-400'
                  : 'text-white'
              }`}
            >
              {day.getDate()}
            </div>
            {/* Dots */}
            <div className="flex gap-0.5 mt-1 h-2 items-center">
              {dots.slice(0, 3).map((color, di) => (
                <div
                  key={di}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : color }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
