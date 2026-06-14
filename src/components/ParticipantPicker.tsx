import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import type { User } from '../types';

interface ParticipantPickerProps {
  students: User[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function ParticipantPicker({ students, selected, onChange }: ParticipantPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = students.every((s) => selected.includes(s.id));

  function toggleAll() {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(students.map((s) => s.id));
    }
  }

  function toggleOne(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-semibold text-gray-700">
          Выбрано: {selected.length}/{students.length}
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm text-[#2F80ED] font-medium"
        >
          {allSelected ? 'Снять все' : 'Выбрать все'}
        </button>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {filtered.map((student) => {
          const isSelected = selected.includes(student.id);
          return (
            <button
              key={student.id}
              type="button"
              onClick={() => toggleOne(student.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#2F80ED] border-[#2F80ED]'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#A855F7] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {student.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-800">{student.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
