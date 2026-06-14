import { useState } from 'react';
import { format } from 'date-fns';
import type { EventItem } from '../../types';
import { BottomSheet } from '../../components/BottomSheet';
import { courses, GROUP_ID } from '../../data/mock';

interface C2Props {
  open: boolean;
  onClose: () => void;
  onCreateEvent: (event: EventItem) => void;
  selectedDate: Date;
}

export function C2({ open, onClose, onCreateEvent, selectedDate }: C2Props) {
  const defaultDate = format(selectedDate, 'yyyy-MM-dd');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState(defaultDate + 'T10:00');
  const [endAt, setEndAt] = useState(defaultDate + 'T11:00');
  const [allDay, setAllDay] = useState(false);
  const [courseId, setCourseId] = useState(courses[0].id);
  const [error, setError] = useState('');

  const endInvalid = endAt && startAt && endAt < startAt;

  function handleCreate() {
    if (!title.trim()) { setError('Введите название'); return; }
    if (endInvalid) { setError('Конец не может быть раньше начала'); return; }

    const event: EventItem = {
      id: `event-${Date.now()}`,
      createdBy: 'curator',
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startAt: allDay ? new Date(startAt.split('T')[0] + 'T00:00:00').toISOString() : new Date(startAt).toISOString(),
      endAt: endAt ? (allDay ? new Date(endAt.split('T')[0] + 'T23:59:00').toISOString() : new Date(endAt).toISOString()) : undefined,
      allDay,
      courseId,
      groupId: GROUP_ID,
      participants: 'all',
    };
    onCreateEvent(event);
    setTitle(''); setDescription(''); setLocation(''); setError('');
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Создать мероприятие">
      <div className="px-4 py-4 space-y-4 pb-8">
        {error && (
          <div className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Название *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Название мероприятия..."
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Описание</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание..." rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors resize-none" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Место</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Место проведения..."
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Весь день</span>
          <button type="button" onClick={() => setAllDay(!allDay)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allDay ? 'bg-[#2F80ED]' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${allDay ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Начало</label>
          <input type={allDay ? 'date' : 'datetime-local'}
            value={allDay ? startAt.split('T')[0] : startAt}
            onChange={(e) => setStartAt(allDay ? e.target.value + 'T00:00' : e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Конец</label>
          <input type={allDay ? 'date' : 'datetime-local'}
            value={allDay ? endAt.split('T')[0] : endAt}
            onChange={(e) => setEndAt(allDay ? e.target.value + 'T23:59' : e.target.value)}
            className={`w-full border rounded-xl px-3 py-3 text-sm text-gray-800 outline-none transition-colors ${endInvalid ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#2F80ED]'}`} />
          {endInvalid && <p className="text-xs text-red-500">Конец не может быть раньше начала</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Предмет</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#2F80ED] transition-colors bg-white">
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            Отмена
          </button>
          <button type="button" onClick={handleCreate} disabled={!!endInvalid}
            className="flex-1 py-3 rounded-xl bg-[#2F80ED] text-white text-sm font-medium hover:bg-[#2F80ED]/90 transition-colors active:scale-95 disabled:opacity-50">
            Создать
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
