import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, Send } from 'lucide-react';
import type { Task, DailyPlan, Attachment } from '../../types';
import { getTasksForDay } from '../../lib/rules';
import { courses, GROUP_ID, CURRENT_STUDENT_ID, submissions as mockSubs } from '../../data/mock';
import { FileUpload } from '../../components/FileUpload';

interface C5Props {
  onBack: () => void;
  tasks: Task[];
  dailyPlans: DailyPlan[];
  onSavePlan: (plan: DailyPlan) => void;
}

export function C5({ onBack, tasks, onSavePlan }: C5Props) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedDate, setSelectedDate] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [text, setText] = useState('');
  const [imageFiles, setImageFiles] = useState<Attachment[]>([]);
  const [saved, setSaved] = useState(false);

  const previewDate = new Date(selectedDate + 'T12:00:00');
  const dayTasks = getTasksForDay(tasks, mockSubs, CURRENT_STUDENT_ID, previewDate);
  const dateLabel = format(previewDate, 'd MMMM, EEEE', { locale: ru });

  function handleSend() {
    const plan: DailyPlan = {
      date: selectedDate,
      groupId: GROUP_ID,
      curatorText: text.trim() || undefined,
    };
    onSavePlan(plan);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <h1 className="text-base font-bold text-white">Дневное вступление</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
        {/* Date picker */}
        <div className="space-y-1">
          <label className="text-xs text-white/50 uppercase tracking-wider">Дата</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-[#2F80ED] transition-colors"
          />
          <p className="text-xs text-white/40 capitalize">{dateLabel}</p>
        </div>

        {/* Task preview */}
        <div className="space-y-2">
          <p className="text-xs text-white/50 uppercase tracking-wider">Задачи на этот день ({dayTasks.length})</p>
          {dayTasks.length === 0 ? (
            <p className="text-sm text-white/30 italic">Нет задач</p>
          ) : (
            <div className="space-y-2">
              {dayTasks.map(({ task }) => {
                const course = courses.find((c) => c.id === task.courseId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl"
                    style={{ borderLeft: `3px solid ${course?.color ?? '#6B7280'}` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{task.title}</p>
                      <p className="text-xs text-white/40">{course?.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Motivational text */}
        <div className="space-y-2">
          <label className="text-xs text-white/50 uppercase tracking-wider">Мотивационный текст</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Сәлем! Бүгін де күшті болыңдар! 💪"
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#2F80ED] transition-colors resize-none"
          />
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-xs text-white/50 uppercase tracking-wider">Изображение</label>
          <div className="bg-white/5 rounded-xl p-3">
            <FileUpload
              files={imageFiles}
              onAdd={(f) => setImageFiles([...imageFiles, f])}
              onRemove={(id) => setImageFiles(imageFiles.filter((f) => f.id !== id))}
            />
          </div>
        </div>

        {/* Saved message */}
        {saved && (
          <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-3 text-center">
            ✅ Дневное вступление сохранено!
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              const tomorrow2 = new Date();
              tomorrow2.setDate(tomorrow2.getDate() + 1);
              setSelectedDate(format(tomorrow2, 'yyyy-MM-dd'));
            }}
            className="w-full py-3 rounded-xl bg-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors active:scale-95"
          >
            <span>Сформировать план на завтра</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="w-full py-3 rounded-xl bg-[#2F80ED] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#2F80ED]/30 active:scale-95 transition-all hover:bg-[#2F80ED]/90"
          >
            <Send size={16} />
            <span>Отправить</span>
          </button>
        </div>
      </div>
    </div>
  );
}
