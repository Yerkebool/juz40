import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task, EventItem, Submission } from '../../types';
import { MonthGrid } from '../../components/MonthGrid';

interface S2Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  events: EventItem[];
  submissions: Submission[];
  studentId: string;
  onBack: () => void;
}

export function S2({ selectedDate, onSelectDate, tasks, events, submissions, studentId, onBack }: S2Props) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthLabel = format(currentMonth, 'LLLL yyyy', { locale: ru });

  function handleSelectDay(date: Date) {
    onSelectDate(date);
    onBack();
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft size={18} className="text-white/70" />
            </button>
            <span className="text-white font-semibold capitalize w-40 text-center">
              {monthLabel}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight size={18} className="text-white/70" />
            </button>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <MonthGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDay}
          tasks={tasks}
          events={events}
          submissions={submissions}
          studentId={studentId}
        />
      </div>
    </div>
  );
}
