import { useState } from 'react';
import { format } from 'date-fns';
import type { Task, EventItem, DailyPlan, Attachment } from '../../types';
import { BottomSheet } from '../../components/BottomSheet';
import { FileUpload } from '../../components/FileUpload';
import { courses, GROUP_ID } from '../../data/mock';

type TabType = 'task' | 'event' | 'daily';

interface C1Props {
  open: boolean;
  onClose: () => void;
  onCreateTask: (task: Task) => void;
  onCreateEvent: (event: EventItem) => void;
  onCreateDailyPlan: (plan: DailyPlan) => void;
  selectedDate: Date;
  onOpenParticipants: (selected: string[], onSave: (ids: string[]) => void) => void;
}

export function C1({ open, onClose, onCreateTask, onCreateEvent, onCreateDailyPlan, selectedDate, onOpenParticipants }: C1Props) {
  const [tab, setTab] = useState<TabType>('task');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskFiles, setTaskFiles] = useState<Attachment[]>([]);
  const [requireFile, setRequireFile] = useState(false);
  const [taskAllDay, setTaskAllDay] = useState(false);
  const [taskDate, setTaskDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const [taskTime, setTaskTime] = useState('23:59');
  const [taskCourse, setTaskCourse] = useState(courses[0].id);
  const [taskParticipants, setTaskParticipants] = useState<string[]>([]);
  const [taskLessonTag, setTaskLessonTag] = useState('');

  // Event fields
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evStart, setEvStart] = useState(format(selectedDate, 'yyyy-MM-dd') + 'T10:00');
  const [evEnd, setEvEnd] = useState(format(selectedDate, 'yyyy-MM-dd') + 'T11:00');
  const [evAllDay, setEvAllDay] = useState(false);
  const [evCourse, setEvCourse] = useState(courses[0].id);

  // Daily plan fields
  const [dpDate, setDpDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const [dpText, setDpText] = useState('');
  const [dpFiles, setDpFiles] = useState<Attachment[]>([]);

  const [error, setError] = useState('');

  const evEndInvalid = evEnd && evStart && evEnd < evStart;

  function handleCreateTask() {
    if (!taskTitle.trim()) { setError('Введите название'); return; }
    const dueDate = taskAllDay
      ? new Date(`${taskDate}T23:59:00`)
      : new Date(`${taskDate}T${taskTime}:00`);

    const task: Task = {
      id: `task-${Date.now()}`,
      type: 'rating',
      createdBy: 'curator',
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      attachments: taskFiles,
      requireFileOnSubmit: requireFile,
      allDay: taskAllDay,
      dueAt: dueDate.toISOString(),
      publishDate: new Date().toISOString(),
      courseId: taskCourse,
      groupId: GROUP_ID,
      participants: taskParticipants.length > 0 ? taskParticipants : 'all',
      lessonTag: taskLessonTag.trim() || undefined,
    };
    onCreateTask(task);
    setTaskTitle(''); setTaskDesc(''); setTaskFiles([]); setError('');
    onClose();
  }

  function handleCreateEvent() {
    if (!evTitle.trim()) { setError('Введите название'); return; }
    if (evEndInvalid) { setError('Конец не может быть раньше начала'); return; }

    const event: EventItem = {
      id: `event-${Date.now()}`,
      createdBy: 'curator',
      title: evTitle.trim(),
      description: evDesc.trim() || undefined,
      location: evLocation.trim() || undefined,
      startAt: evAllDay ? new Date(`${evStart.split('T')[0]}T00:00:00`).toISOString() : new Date(evStart).toISOString(),
      endAt: evEnd ? (evAllDay ? new Date(`${evEnd.split('T')[0]}T23:59:00`).toISOString() : new Date(evEnd).toISOString()) : undefined,
      allDay: evAllDay,
      courseId: evCourse,
      groupId: GROUP_ID,
      participants: 'all',
    };
    onCreateEvent(event);
    setEvTitle(''); setEvDesc(''); setEvLocation(''); setError('');
    onClose();
  }

  function handleCreateDailyPlan() {
    if (!dpText.trim()) { setError('Введите текст'); return; }
    const plan: DailyPlan = {
      date: dpDate,
      groupId: GROUP_ID,
      curatorText: dpText.trim(),
    };
    onCreateDailyPlan(plan);
    setDpText(''); setError('');
    onClose();
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'task', label: 'Задача' },
    { key: 'event', label: 'Мероприятие' },
    { key: 'daily', label: 'Дневное' },
  ];

  function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <button
          type="button"
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-[#2F80ED]' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Создать" fullHeight>
      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-[#2F80ED] border-b-2 border-[#2F80ED]'
                : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 space-y-4">
        {error && (
          <div className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* TASK TAB */}
        {tab === 'task' && (
          <>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Название *</label>
              <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Название задачи..."
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Описание</label>
              <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Описание..." rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Тег урока</label>
              <input type="text" value={taskLessonTag} onChange={(e) => setTaskLessonTag(e.target.value)}
                placeholder="Напр.: §5.1"
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Вложения</label>
              <FileUpload files={taskFiles} onAdd={(f) => setTaskFiles([...taskFiles, f])} onRemove={(id) => setTaskFiles(taskFiles.filter((f) => f.id !== id))} />
            </div>
            <Toggle on={requireFile} onToggle={() => setRequireFile(!requireFile)} label="Обязательное прикрепление файла" />
            <Toggle on={taskAllDay} onToggle={() => setTaskAllDay(!taskAllDay)} label="Весь день" />
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Дата</label>
              <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            {!taskAllDay && (
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Время</label>
                <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Предмет</label>
              <select value={taskCourse} onChange={(e) => setTaskCourse(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors bg-white">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Участники</label>
              <button
                type="button"
                onClick={() => onOpenParticipants(taskParticipants, setTaskParticipants)}
                className="w-full text-left border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 hover:border-[#2F80ED] transition-colors"
              >
                {taskParticipants.length === 0
                  ? 'Все ученики'
                  : `Выбрано: ${taskParticipants.length} учеников`}
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Отмена</button>
              <button type="button" onClick={handleCreateTask}
                className="flex-1 py-3 rounded-xl bg-[#2F80ED] text-white text-sm font-medium hover:bg-[#2F80ED]/90 transition-colors active:scale-95">Создать</button>
            </div>
          </>
        )}

        {/* EVENT TAB */}
        {tab === 'event' && (
          <>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Название *</label>
              <input type="text" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Название мероприятия..."
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Описание</label>
              <textarea value={evDesc} onChange={(e) => setEvDesc(e.target.value)} placeholder="Описание..." rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Место</label>
              <input type="text" value={evLocation} onChange={(e) => setEvLocation(e.target.value)} placeholder="Место проведения..."
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            <Toggle on={evAllDay} onToggle={() => setEvAllDay(!evAllDay)} label="Весь день" />
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Начало</label>
              <input type={evAllDay ? 'date' : 'datetime-local'}
                value={evAllDay ? evStart.split('T')[0] : evStart}
                onChange={(e) => setEvStart(evAllDay ? e.target.value + 'T00:00' : e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Конец</label>
              <input
                type={evAllDay ? 'date' : 'datetime-local'}
                value={evAllDay ? evEnd.split('T')[0] : evEnd}
                onChange={(e) => setEvEnd(evAllDay ? e.target.value + 'T23:59' : e.target.value)}
                className={`w-full border rounded-xl px-3 py-3 text-sm text-gray-800 outline-none transition-colors ${evEndInvalid ? 'border-red-400' : 'border-gray-200 focus:border-[#2F80ED]'}`}
              />
              {evEndInvalid && <p className="text-xs text-red-500">Конец не может быть раньше начала</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Предмет</label>
              <select value={evCourse} onChange={(e) => setEvCourse(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors bg-white">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Отмена</button>
              <button type="button" onClick={handleCreateEvent} disabled={!!evEndInvalid}
                className="flex-1 py-3 rounded-xl bg-[#2F80ED] text-white text-sm font-medium hover:bg-[#2F80ED]/90 transition-colors active:scale-95 disabled:opacity-50">Создать</button>
            </div>
          </>
        )}

        {/* DAILY TAB */}
        {tab === 'daily' && (
          <>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Дата</label>
              <input type="date" value={dpDate} onChange={(e) => setDpDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Мотивационный текст *</label>
              <textarea value={dpText} onChange={(e) => setDpText(e.target.value)} placeholder="Доброе утро! Сегодня мы..." rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Изображение</label>
              <FileUpload files={dpFiles} onAdd={(f) => setDpFiles([...dpFiles, f])} onRemove={(id) => setDpFiles(dpFiles.filter((f) => f.id !== id))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Отмена</button>
              <button type="button" onClick={handleCreateDailyPlan}
                className="flex-1 py-3 rounded-xl bg-[#2F80ED] text-white text-sm font-medium hover:bg-[#2F80ED]/90 transition-colors active:scale-95">Отправить</button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
