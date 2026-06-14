import { useState } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Paperclip, FileText, AlertTriangle, Send } from 'lucide-react';
import type { Task, Submission, Attachment } from '../../types';
import { Checkbox } from '../../components/Checkbox';
import { FileUpload } from '../../components/FileUpload';
import { getTaskStatus } from '../../lib/rules';
import { courses } from '../../data/mock';

interface S3Props {
  task: Task;
  submission?: Submission;
  allTodayTasks: { task: Task; submission?: Submission }[];
  onBack: () => void;
  onToggleTask: (taskId: string) => void;
  onUpdateSubmission: (taskId: string, data: Partial<Submission>) => void;
  onNavigate: (taskId: string) => void;
}

export function S3({ task, submission, allTodayTasks, onBack, onToggleTask, onUpdateSubmission, onNavigate }: S3Props) {
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>(submission?.files ?? []);
  const [comment, setComment] = useState(submission?.comment ?? '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const now = new Date();
  const status = getTaskStatus(task, submission, now);
  const course = courses.find((c) => c.id === task.courseId);
  const isDone = status === 'done';
  const isOverdue = !isDone && isBefore(parseISO(task.dueAt), now);
  const canCheck = !task.requireFileOnSubmit || uploadedFiles.length > 0;

  const currentIndex = allTodayTasks.findIndex((t) => t.task.id === task.id);
  const prevTask = currentIndex > 0 ? allTodayTasks[currentIndex - 1] : null;
  const nextTask = currentIndex < allTodayTasks.length - 1 ? allTodayTasks[currentIndex + 1] : null;

  const timeLabel = task.allDay
    ? 'Весь день'
    : format(parseISO(task.dueAt), 'd MMMM HH:mm', { locale: ru });

  function handleAddFile(file: Attachment) {
    const newFiles = [...uploadedFiles, file];
    setUploadedFiles(newFiles);
    onUpdateSubmission(task.id, { files: newFiles });
  }

  function handleRemoveFile(id: string) {
    const newFiles = uploadedFiles.filter((f) => f.id !== id);
    setUploadedFiles(newFiles);
    onUpdateSubmission(task.id, { files: newFiles });
  }

  function handleSend() {
    if (uploadedFiles.length === 0 && task.requireFileOnSubmit) {
      setErrorMsg('Файл тіркеу міндетті');
      return;
    }
    onUpdateSubmission(task.id, {
      files: uploadedFiles,
      comment,
      submittedAt: new Date().toISOString(),
      done: true,
    });
    setSuccessMsg('Файлдар жіберілді!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Colored top bar */}
      <div
        className="px-4 pt-4 pb-4"
        style={{ backgroundColor: (course?.color ?? '#2F80ED') + '22' }}
      >
        {/* Back + prev/next nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => prevTask && onNavigate(prevTask.task.id)}
              disabled={!prevTask}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
            >
              <ChevronLeft size={18} className="text-white/60" />
            </button>
            <button
              onClick={() => nextTask && onNavigate(nextTask.task.id)}
              disabled={!nextTask}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
            >
              <ChevronRight size={18} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Course · type · tag — one compact line */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-[11px] font-semibold px-2 py-[3px] rounded-md leading-none"
            style={{ backgroundColor: (course?.color ?? '#6B7280') + '35', color: course?.color ?? '#fff' }}
          >
            {course?.name}
          </span>
          <span className="text-[11px] text-white/35 leading-none">
            {task.type === 'rating' ? 'Рейтинг' : 'Дополнительная'}
          </span>
          {task.lessonTag && (
            <>
              <span className="text-white/20 text-[11px]">·</span>
              <span className="text-[11px] text-white/35 leading-none">{task.lessonTag}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-[17px] font-bold text-white leading-snug mb-3">
          {task.title}
        </h1>

        {/* Deadline */}
        <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : 'text-white/40'}`}>
          {isOverdue
            ? <AlertTriangle size={13} strokeWidth={2.5} />
            : <Clock size={13} strokeWidth={2} />
          }
          <span className="text-[12px]">
            {isOverdue ? 'Срок истёк: ' : 'Срок: '}{timeLabel}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5 pt-4">
        {/* Big checkbox */}
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4">
          <Checkbox
            checked={isDone}
            onChange={() => onToggleTask(task.id)}
            disabled={!canCheck}
            size={32}
          />
          <div>
            <p className="text-white font-medium">
              {isDone ? 'Выполнено' : 'Отметить как выполнено'}
            </p>
            {task.requireFileOnSubmit && !isDone && (
              <p className="text-xs text-amber-400 mt-0.5">Требуется прикрепить файл</p>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-wider">Описание</p>
            <p className="text-white/80 text-sm leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Task attachments (instructions) */}
        {task.attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Материалы</p>
            {task.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <Paperclip size={16} className="text-white/40" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{att.name}</p>
                  <p className="text-xs text-white/30">{att.sizeMb} МБ</p>
                </div>
                <FileText size={16} className="text-white/30" />
              </div>
            ))}
          </div>
        )}

        {/* Submission block */}
        <div className="space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">Отправка файлов</p>
          <div className="bg-white rounded-2xl p-4 space-y-3">
            {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-lg p-2">
                <AlertTriangle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="text-green-600 text-sm bg-green-50 rounded-lg p-2 text-center">
                ✅ {successMsg}
              </div>
            )}
            <FileUpload
              files={uploadedFiles}
              onAdd={handleAddFile}
              onRemove={handleRemoveFile}
              onError={setErrorMsg}
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий к заданию..."
              className="w-full resize-none border border-gray-200 rounded-xl p-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors"
              rows={3}
            />
            {uploadedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleSend}
                className="w-full py-3 rounded-xl bg-[#2F80ED] text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Send size={16} />
                <span>Отправить файлы</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
