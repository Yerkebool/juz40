import { Paperclip, Clock } from 'lucide-react';
import type { Task, Submission } from '../types';
import { Checkbox } from './Checkbox';
import { getTaskStatus } from '../lib/rules';
import { format, parseISO } from 'date-fns';
import { courses } from '../data/mock';

interface TaskRowProps {
  task: Task;
  submission?: Submission;
  onToggle?: (taskId: string) => void;
  onClick?: (taskId: string) => void;
}

export function TaskRow({ task, submission, onToggle, onClick }: TaskRowProps) {
  const now = new Date();
  const status = getTaskStatus(task, submission, now);
  const course = courses.find((c) => c.id === task.courseId);
  const isDone = status === 'done';
  const isOverdue = status === 'overdue';

  const timeLabel = task.allDay
    ? 'Весь день'
    : format(parseISO(task.dueAt), 'HH:mm');

  const canCheck = !task.requireFileOnSubmit || (submission?.files?.length ?? 0) > 0;
  const accentColor = course?.color ?? '#6B7280';

  return (
    <div
      className={`flex items-start gap-3 py-3 cursor-pointer transition-opacity duration-150 ${
        isDone ? 'opacity-40' : 'opacity-100'
      }`}
      onClick={() => onClick?.(task.id)}
    >
      <div className="mt-[2px] flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isDone}
          onChange={() => onToggle?.(task.id)}
          disabled={!canCheck}
          size={20}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-[13.5px] font-medium leading-snug ${
            isDone ? 'line-through text-white/40' : 'text-white/90'
          }`}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.lessonTag && (
            <span
              className="text-[10px] font-semibold px-2 py-[3px] rounded-[5px] leading-none flex-shrink-0"
              style={{ backgroundColor: accentColor + '28', color: accentColor }}
            >
              {task.lessonTag}
            </span>
          )}

          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-white/35'}`}>
            <Clock size={10} strokeWidth={2.5} />
            <span className="text-[11px]">
              {timeLabel}{isOverdue ? ' · просрочено' : ''}
            </span>
          </div>

          {(task.attachments.length > 0 || task.requireFileOnSubmit) && (
            <div className="flex items-center gap-0.5 text-amber-400/70">
              <Paperclip size={10} strokeWidth={2.5} />
              {task.requireFileOnSubmit && (
                <span className="text-[10px]">обяз.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
