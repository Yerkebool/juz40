import { useState } from 'react';
import { ChevronLeft, FileText, Clock, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task, Submission } from '../../types';
import { students } from '../../data/mock';
import { getTaskStatus } from '../../lib/rules';

type Tab4 = 'done' | 'undone' | 'overdue' | 'files';

interface C4Props {
  task: Task;
  submissions: Submission[];
  onBack: () => void;
}

export function C4({ task, submissions, onBack }: C4Props) {
  const [tab, setTab] = useState<Tab4>('done');
  const now = new Date();

  const taskSubs = submissions.filter((s) => s.taskId === task.id);

  function getStudentSub(studentId: string) {
    return taskSubs.find((s) => s.studentId === studentId);
  }

  const doneStudents = students.filter((s) => {
    const sub = getStudentSub(s.id);
    return sub?.done;
  });

  const undoneStudents = students.filter((s) => {
    const sub = getStudentSub(s.id);
    return !sub?.done;
  });

  const overdueStudents = students.filter((s) => {
    const sub = getStudentSub(s.id);
    const status = getTaskStatus(task, sub, now);
    return status === 'overdue';
  });

  const filesStudents = students.filter((s) => {
    const sub = getStudentSub(s.id);
    return (sub?.files?.length ?? 0) > 0;
  });

  const tabs: { key: Tab4; label: string; count: number }[] = [
    { key: 'done', label: 'Выполнили', count: doneStudents.length },
    { key: 'undone', label: 'Не выполнили', count: undoneStudents.length },
    { key: 'overdue', label: 'Просрочили', count: overdueStudents.length },
    { key: 'files', label: 'Прикрепили файл', count: filesStudents.length },
  ];

  const displayStudents = {
    done: doneStudents,
    undone: undoneStudents,
    overdue: overdueStudents,
    files: filesStudents,
  }[tab];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={22} className="text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 mb-0.5">Контроль выполнения</p>
            <h1 className="text-base font-bold text-white leading-tight truncate">{task.title}</h1>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'text-[#2F80ED] border-b-2 border-[#2F80ED]'
                : 'text-white/50'
            }`}
          >
            {t.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
              tab === t.key ? 'bg-[#2F80ED]/20 text-[#2F80ED]' : 'bg-white/10 text-white/40'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3 space-y-2">
        {displayStudents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/40 text-sm">Пока нет учеников в этой категории</p>
          </div>
        ) : (
          displayStudents.map((student) => {
            const sub = getStudentSub(student.id);
            return (
              <div key={student.id} className="bg-white/5 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#A855F7] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">{student.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{student.name}</p>
                    {sub?.submittedAt && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-white/40" />
                        <span className="text-xs text-white/40">
                          {format(parseISO(sub.submittedAt), 'HH:mm', { locale: ru })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(sub?.files?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-xs text-white/50">
                        <FileText size={12} />
                        <span>{sub!.files.length}</span>
                      </div>
                    )}
                    {sub?.comment && (
                      <MessageSquare size={12} className="text-white/40" />
                    )}
                  </div>
                </div>
                {sub?.comment && (
                  <p className="text-xs text-white/50 bg-white/5 rounded-lg px-2 py-1 line-clamp-2">
                    {sub.comment}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
