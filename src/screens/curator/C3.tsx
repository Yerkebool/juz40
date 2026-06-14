import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { ParticipantPicker } from '../../components/ParticipantPicker';
import { students } from '../../data/mock';

interface C3Props {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onSave: (ids: string[]) => void;
}

export function C3({ open, onClose, selected, onSave }: C3Props) {
  const [local, setLocal] = useState(selected);

  function handleSave() {
    onSave(local);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Участники">
      <ParticipantPicker students={students} selected={local} onChange={setLocal} />
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-[#2F80ED] text-white font-medium text-sm active:scale-95 transition-all"
        >
          Сохранить
        </button>
      </div>
    </BottomSheet>
  );
}
