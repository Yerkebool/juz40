import { useState } from 'react';
import { format } from 'date-fns';
import type { Task } from '../../types';
import { BottomSheet } from '../../components/BottomSheet';
import { courses, GROUP_ID, CURRENT_STUDENT_ID } from '../../data/mock';

interface S4Props {
  open: boolean;
  onClose: () => void;
  onCreateTask: (task: Task) => void;
  selectedDate: Date;
}

export function S4({ open, onClose, onCreateTask, selectedDate }: S4Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateVal, setDateVal] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const [allDay, setAllDay] = useState(false);
  const [time, setTime] = useState('12:00');
  const [courseId, setCourseId] = useState(courses[0].id);
  const [error, setError] = useState('');

  function handleCreate() {
    if (!title.trim()) {
      setError('Введите название');
      return;
    }
    const dueDate = allDay
      ? new Date(`${dateVal}T23:59:00`)
      : new Date(`${dateVal}T${time}:00`);

    const newTask: Task = {
      id: `personal-${Date.now()}`,
      type: 'additional',
      createdBy: 'student',
      title: title.trim(),
      description: description.trim() || undefined,
      attachments: [],
      requireFileOnSubmit: false,
      allDay,
      dueAt: dueDate.toISOString(),
      courseId,
      groupId: GROUP_ID,
      participants: [CURRENT_STUDENT_ID],
    };
    onCreateTask(newTask);
    setTitle('');
    setDescription('');
    setError('');
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Личная задача">
      <div className="px-4 py-4 space-y-4 pb-8">
        {error && (
          <div className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="Название задачи..."
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание (необязательно)..."
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Предмет</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors bg-white"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Дата</label>
          <input
            type="date"
            value={dateVal}
            onChange={(e) => setDateVal(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Весь день</span>
          <button
            type="button"
            onClick={() => setAllDay(!allDay)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              allDay ? 'bg-[#2F80ED]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                allDay ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {!allDay && (
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-medium">Время</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors active:scale-95"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 py-3 rounded-xl bg-[#2F80ED] text-white text-sm font-medium hover:bg-[#2F80ED]/90 transition-colors active:scale-95"
          >
            Создать
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
