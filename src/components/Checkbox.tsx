import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: number;
}

export function Checkbox({ checked, onChange, disabled, size = 24 }: CheckboxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`flex items-center justify-center rounded-full border-[1.5px] transition-all duration-200 flex-shrink-0 ${
        checked
          ? 'bg-[#2F80ED] border-[#2F80ED] scale-[1.08]'
          : 'border-white/25 bg-transparent hover:border-white/50'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
      style={{ width: size, height: size }}
    >
      {checked && <Check size={size * 0.6} className="text-white" strokeWidth={3} />}
    </button>
  );
}
