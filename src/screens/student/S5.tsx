import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Sunrise, ChevronRight } from 'lucide-react';
import type { DailyPlan } from '../../types';
import { curator } from '../../data/mock';

interface S5Props {
  dailyPlan?: DailyPlan;
  date: Date;
  onStart: () => void;
}

export function S5({ dailyPlan, date, onStart }: S5Props) {
  const dateLabel = format(date, 'd MMMM, EEEE', { locale: ru });

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 min-h-0">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#2F80ED]/20 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Curator avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#A855F7] flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">
              {curator.name.charAt(0)}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/50">Куратор</p>
            <p className="text-white font-semibold">{curator.name}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-center gap-2">
          <Sunrise size={16} className="text-amber-400" />
          <span className="text-white/60 text-sm capitalize">{dateLabel}</span>
        </div>

        {/* Message card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          {dailyPlan?.curatorText ? (
            <p className="text-white text-base leading-relaxed text-center">
              {dailyPlan.curatorText}
            </p>
          ) : (
            <p className="text-white/60 text-sm text-center italic">
              Куратор хабарлама жазбаған...
            </p>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-[#2F80ED] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#2F80ED]/30 active:scale-95 transition-all duration-200 hover:bg-[#2F80ED]/90"
        >
          <span>Начать день</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
