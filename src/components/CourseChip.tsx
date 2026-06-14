import type { Course } from '../types';

interface CourseChipProps {
  course?: Course;
  label?: string;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export function CourseChip({ course, label, selected, onClick, small }: CourseChipProps) {
  const color = course?.color ?? '#6B7280';
  const text = label ?? course?.name ?? '';

  if (small) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: color + '22', color }}
      >
        {text}
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        selected
          ? 'text-white shadow-md'
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
      style={selected ? { backgroundColor: color } : {}}
    >
      {text}
    </button>
  );
}
