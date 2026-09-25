import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Volume2,
  Plus,
  Minus,
  Trophy,
} from 'lucide-react';
import { WorkoutPlan, WorkoutExerciseItem, WorkoutSetData } from '../types/fitness';
import { VisualMotionEngine } from './VisualMotionEngine';
import { playCountdownTick, playRestCompleteSound, playSetCompleteSound, playWorkoutFinishSound } from '../utils/audio';

interface WorkoutPlayerModalProps {
  plan: WorkoutPlan;
  onClose: () => void;
  onFinishWorkout: (updatedPlan: WorkoutPlan, summaryStats: {
    durationSeconds: number;
    totalTonnageKg: number;
    caloriesBurned: number;
  }) => void;
}

export const WorkoutPlayerModal: React.FC<WorkoutPlayerModalProps> = ({
  plan,
  onClose,
  onFinishWorkout,
}) => {
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>(plan.exercises);
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [workoutElapsedSec, setWorkoutElapsedSec] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Rest Timer State
  const [restRemainingSec, setRestRemainingSec] = useState<number | null>(null);
  const [restTotalSec, setRestTotalSec] = useState<number>(60);
  const [isRestActive, setIsRestActive] = useState<boolean>(false);

  // Overall workout duration timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setWorkoutElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Rest countdown timer with sound notifications
  useEffect(() => {
    if (!isRestActive || restRemainingSec === null) return;

    if (restRemainingSec <= 0) {
      playRestCompleteSound();
      setIsRestActive(false);
      setRestRemainingSec(null);
      return;
    }

    if (restRemainingSec <= 3 && restRemainingSec > 0) {
      playCountdownTick();
    }

    const timer = setTimeout(() => {
      setRestRemainingSec((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRestActive, restRemainingSec]);

  const currentExercise = exercises[currentExIndex];

  // Calculate live cumulative metrics
  const calculateTotalTonnage = () => {
    return exercises.reduce((acc, ex) => {
      return (
        acc +
        ex.sets.reduce((sAcc, s) => {
          return s.completed ? sAcc + s.actualReps * s.weightKg : sAcc;
        }, 0)
      );
    }, 0);
  };

  const calculateTotalCompletedSets = () => {
    return exercises.reduce((acc, ex) => {
      return acc + ex.sets.filter((s) => s.completed).length;
    }, 0);
  };

  const calculateTotalSets = () => {
    return exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  // Estimated calorie expenditure: ~0.11 kcal per kg of lifter weight per minute, scaled by tonnage
  const calculateEstimatedCalories = () => {
    const minutes = Math.max(1, Math.round(workoutElapsedSec / 60));
    const tonnage = calculateTotalTonnage();
    const baseBurn = minutes * 6.5; // average intense lifting burn
    const workloadBurn = Math.round(tonnage * 0.04);
    return Math.round(baseBurn + workloadBurn);
  };

  // Toggle set completion and trigger rest timer
  const handleToggleSet = (setIndex: number) => {
    const updatedExercises = [...exercises];
    const targetSet = updatedExercises[currentExIndex].sets[setIndex];
    const newStatus = !targetSet.completed;
    targetSet.completed = newStatus;

    if (newStatus) {
      playSetCompleteSound();
      // Start rest timer
      const restDuration = currentExercise.restSeconds || 60;
      setRestTotalSec(restDuration);
      setRestRemainingSec(restDuration);
      setIsRestActive(true);
    }

    setExercises(updatedExercises);
  };

  const handleUpdateWeight = (setIndex: number, delta: number) => {
    const updatedExercises = [...exercises];
    const s = updatedExercises[currentExIndex].sets[setIndex];
    s.weightKg = Math.max(0, Math.round((s.weightKg + delta) * 2) / 2);
    setExercises(updatedExercises);
  };

  const handleUpdateReps = (setIndex: number, delta: number) => {
    const updatedExercises = [...exercises];
    const s = updatedExercises[currentExIndex].sets[setIndex];
    s.actualReps = Math.max(1, s.actualReps + delta);
    setExercises(updatedExercises);
  };

  const handleFinish = () => {
    playWorkoutFinishSound();
    setIsFinished(true);
    const summary = {
      durationSeconds: workoutElapsedSec,
      totalTonnageKg: calculateTotalTonnage(),
      caloriesBurned: calculateEstimatedCalories(),
    };
    const updatedPlan: WorkoutPlan = {
      ...plan,
      exercises,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      stats: {
        durationSeconds: workoutElapsedSec,
        totalTonnageKg: summary.totalTonnageKg,
        caloriesBurned: summary.caloriesBurned,
        completedSetsCount: calculateTotalCompletedSets(),
        totalSetsCount: calculateTotalSets(),
      },
    };
    onFinishWorkout(updatedPlan, summary);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100">
      {/* Top Athletic Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d121f] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-ping" />
              <h2 className="text-base font-bold text-white tracking-wide">
                {plan.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {currentExercise?.exerciseTitle} ({currentExIndex + 1}/{exercises.length})
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Clock className="w-4 h-4 text-[#ccff00]" />
            <span className="font-mono text-sm font-bold text-white">
              {formatTime(workoutElapsedSec)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Dumbbell className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-300">
              Tonnaj: <strong className="text-white">{calculateTotalTonnage().toLocaleString()} kg</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-300">
              <strong className="text-white">{calculateEstimatedCalories()}</strong> kcal
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ccff00] to-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-[#ccff00]/20"
          >
            Yakunlash
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Motion Engine & Technique */}
        <div className="lg:col-span-6 space-y-4">
          <VisualMotionEngine
            motionType={currentExercise.motionType}
            titleUz={currentExercise.exerciseTitle}
            primaryMuscles={[currentExercise.muscleGroupSlug]}
            cameraAngle={currentExercise.cameraAngle}
            videoLoopUrl={currentExercise.videoLoopUrl}
            videoMp4Url={currentExercise.videoMp4Url}
            autoplay={true}
          />

          {/* Quick instructions & Cues */}
          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800">
            <h4 className="text-xs font-bold text-[#ccff00] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Murabbiy Ko'rsatmasi
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentExercise.instructionsBrief ||
                "Har bir takrorlashni to'liq amplituda bilan bajaring. Tushirishda 2-3 soniya sekin boshqaring, ko'tarishda kuchli nafas chiqaring."}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Sets Tracker & Rest Countdown */}
        <div className="lg:col-span-6 space-y-5">
          {/* Rest Timer Floating Widget */}
          {isRestActive && restRemainingSec !== null && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-[#ccff00] shadow-xl shadow-[#ccff00]/10 flex items-center justify-between animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#334155"
                      strokeWidth="3.5"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#ccff00"
                      strokeWidth="3.5"
                      fill="none"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 * (1 - restRemainingSec / restTotalSec)}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-sm text-[#ccff00]">
                    {restRemainingSec}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ccff00]">
                    Dam Olish Taymeri
                  </h4>
                  <p className="text-xs text-slate-400">Mushaklarni tiklab oling</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRestRemainingSec((prev) => (prev ? prev + 15 : 15))}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200"
                >
                  +15s
                </button>
                <button
                  onClick={() => {
                    setIsRestActive(false);
                    setRestRemainingSec(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-400 border border-red-500/30"
                >
                  O'tkazib yuborish
                </button>
              </div>
            </div>
          )}

          {/* Sets Table */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  Yondashuvlar (Sets & Reps)
                </h3>
                <span className="text-xs text-slate-400">
                  Tavsiya: {currentExercise.targetSets} set × {currentExercise.targetReps}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Dam: {currentExercise.restSeconds}s
              </span>
            </div>

            <div className="space-y-2.5">
              {currentExercise.sets.map((set, setIdx) => (
                <div
                  key={set.setNumber}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    set.completed
                      ? 'bg-[#ccff00]/10 border-[#ccff00]/50 text-white'
                      : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Set Number */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        set.completed
                          ? 'bg-[#ccff00] text-black'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {set.setNumber}
                    </span>

                    {/* Weight Adjustment */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateWeight(setIdx, -2.5)}
                        className="w-6 h-6 rounded bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-sm w-16 text-center text-white">
                        {set.weightKg} kg
                      </span>
                      <button
                        onClick={() => handleUpdateWeight(setIdx, 2.5)}
                        className="w-6 h-6 rounded bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-slate-500 font-bold">×</span>

                    {/* Reps Adjustment */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateReps(setIdx, -1)}
                        className="w-6 h-6 rounded bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-sm w-12 text-center text-white">
                        {set.actualReps}
                      </span>
                      <button
                        onClick={() => handleUpdateReps(setIdx, 1)}
                        className="w-6 h-6 rounded bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => handleToggleSet(setIdx)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      set.completed
                        ? 'bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/20'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-slate-300 border border-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {set.completed ? 'Bajarildi' : 'Bajarish'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Between Exercises */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentExIndex === 0}
              onClick={() => setCurrentExIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-300 flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Oldingi Mashq
            </button>

            <span className="text-xs text-slate-400 font-medium">
              {currentExIndex + 1} dan {exercises.length}
            </span>

            {currentExIndex < exercises.length - 1 ? (
              <button
                onClick={() => setCurrentExIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
                className="px-4 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#ccff00]/20"
              >
                Keyingi Mashq <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ccff00] to-emerald-400 hover:opacity-95 text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                <Trophy className="w-4 h-4" /> Mashg'ulotni Tugatish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
