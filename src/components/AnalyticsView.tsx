import React from 'react';
import {
  Trophy,
  Flame,
  Dumbbell,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { WorkoutLogRecord } from '../types/fitness';

interface AnalyticsViewProps {
  logs: WorkoutLogRecord[];
  onStartNewWorkout: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  onStartNewWorkout,
}) => {
  const totalTonnageAll = logs.reduce((acc, l) => acc + l.totalTonnageKg, 0);
  const totalCaloriesAll = logs.reduce((acc, l) => acc + l.caloriesBurned, 0);
  const totalMinutesAll = Math.round(logs.reduce((acc, l) => acc + l.durationSeconds, 0) / 60);

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    return `${m} daqiqa`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0d121f] to-[#141b2c] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Jami Tonnaj
            </span>
            <span className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <Dumbbell className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalTonnageAll.toLocaleString()} <span className="text-xs font-sans text-slate-400">kg</span>
          </div>
          <span className="text-[11px] text-[#ccff00] font-semibold mt-1 block">
            Ko'tarilgan temir og'irligi
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0d121f] to-[#141b2c] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Yoqilgan Kaloriya
            </span>
            <span className="p-2 rounded-xl bg-orange-500/15 text-orange-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalCaloriesAll.toLocaleString()} <span className="text-xs font-sans text-slate-400">kcal</span>
          </div>
          <span className="text-[11px] text-orange-400 font-semibold mt-1 block">
            Sof energiya sarfi
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0d121f] to-[#141b2c] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Zaldagi Vaqt
            </span>
            <span className="p-2 rounded-xl bg-[#ccff00]/15 text-[#ccff00]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalMinutesAll} <span className="text-xs font-sans text-slate-400">daq.</span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            Foydali trenirovka vaqti
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0d121f] to-[#141b2c] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mashg'ulotlar
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {logs.length} <span className="text-xs font-sans text-slate-400">sessiya</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            100% bajarilgan dasturlar
          </span>
        </div>
      </div>

      {/* Workout Logs History List */}
      <div className="p-6 rounded-3xl bg-[#0d121f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ccff00]" />
            <h3 className="text-base font-bold text-white">
              Bajarilgan Mashg'ulotlar Tarixi
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Jami: {logs.length} ta yozuv
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Hozircha yakunlangan mashg'ulot yo'q</p>
            <p className="text-xs text-slate-500 mt-1">
              "Bugungi Mashg'ulot" bo'limiga o'ting va ilk trenirovkangizni boshlang!
            </p>
            <button
              onClick={onStartNewWorkout}
              className="mt-4 px-4 py-2 rounded-xl bg-[#ccff00] text-black font-extrabold text-xs uppercase"
            >
              Mashg'ulotni Boshlash
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
                    <h4 className="text-sm font-bold text-white">{log.workoutTitle}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{new Date(log.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{formatSec(log.durationSeconds)}</span>
                    <span>•</span>
                    <span>{log.totalSets} ta set</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">
                      Tonnaj
                    </span>
                    <span className="font-mono font-bold text-sm text-white">
                      {log.totalTonnageKg.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">
                      Kaloriya
                    </span>
                    <span className="font-mono font-bold text-sm text-orange-400">
                      {log.caloriesBurned} kcal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
