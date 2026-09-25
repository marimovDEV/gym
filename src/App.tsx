import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Flame,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Trophy,
  User,
  Settings,
  Shield,
  Play,
  CheckCircle2,
  RefreshCw,
  Plus,
  Clock,
  ChevronRight,
  TrendingUp,
  Brain,
  Sliders,
} from 'lucide-react';
import {
  UserProfile,
  Exercise,
  WorkoutPlan,
  WorkoutExerciseItem,
  WorkoutLogRecord,
  MuscleGroupSlug,
} from './types/fitness';
import { INITIAL_EXERCISES, MUSCLE_GROUPS } from './data/exercises';
import { VisualMotionEngine } from './components/VisualMotionEngine';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutPlayerModal } from './components/WorkoutPlayerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AICoachPanel } from './components/AICoachPanel';
import { AdminPanel } from './components/AdminPanel';
import { AnalyticsView } from './components/AnalyticsView';

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default',
  fullName: 'Sherzod Aliyev',
  email: 'sherzod@fitness.uz',
  phone: '+998 90 123 45 67',
  gender: 'male',
  age: 24,
  height: 178,
  weight: 76,
  targetGoal: 'hypertrophy',
  fitnessLevel: 'intermediate',
  preferredEquipment: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
  daysPerWeek: 4,
  createdAt: new Date().toISOString(),
};

export default function App() {
  // Application State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('smart_fitness_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fitness_exercises');
      if (!saved) return INITIAL_EXERCISES;
      const parsed: Exercise[] = JSON.parse(saved);
      // Auto-backfill videoLoopUrl, cameraAngle, videoStandardSpec from INITIAL_EXERCISES
      return parsed.map((p) => {
        const init = INITIAL_EXERCISES.find((i) => i.id === p.id);
        if (!init) return p;
        return {
          ...init,
          ...p,
          videoLoopUrl: p.videoLoopUrl || init.videoLoopUrl,
          cameraAngle: p.cameraAngle || init.cameraAngle,
          videoStandardSpec: p.videoStandardSpec || init.videoStandardSpec,
        };
      });
    } catch {
      return INITIAL_EXERCISES;
    }
  });

  const [logs, setLogs] = useState<WorkoutLogRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fitness_logs');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'log_prev_1',
              userId: 'usr_default',
              date: new Date(Date.now() - 86400000 * 2).toISOString(),
              workoutTitle: "Ko'krak va Triceps Hipertrofiyasi",
              durationSeconds: 3120,
              totalTonnageKg: 3450,
              caloriesBurned: 410,
              exercisesCompleted: 4,
              totalSets: 14,
            },
            {
              id: 'log_prev_2',
              userId: 'usr_default',
              date: new Date(Date.now() - 86400000 * 4).toISOString(),
              workoutTitle: 'Oyoq va Dumba Kuch Dasturi',
              durationSeconds: 3600,
              totalTonnageKg: 5200,
              caloriesBurned: 530,
              exercisesCompleted: 4,
              totalSets: 15,
            },
          ];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'today' | 'library' | 'coach' | 'analytics' | 'admin'>('today');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [todayPlan, setTodayPlan] = useState<WorkoutPlan>(() => generateDefaultPlan(DEFAULT_PROFILE, INITIAL_EXERCISES));

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('smart_fitness_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('smart_fitness_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('smart_fitness_logs', JSON.stringify(logs));
  }, [logs]);

  // Default plan generator
  function generateDefaultPlan(profile: UserProfile, exList: Exercise[]): WorkoutPlan {
    const selectedEx = exList.filter((e) => ['bench_press', 'incline_dumbbell_press', 'lat_pulldown', 'tricep_pushdown'].includes(e.id));
    const finalEx = selectedEx.length > 0 ? selectedEx : exList.slice(0, 4);

    return {
      id: 'plan_' + Date.now(),
      userId: profile.id,
      title: "Bugungi AI Trenirovka: Ko'krak va Qanot",
      focusArea: "Katta ko'krak va qanot mushaklari balansi",
      date: new Date().toISOString(),
      aiGenerated: true,
      aiRationale: `${profile.fullName} uchun ${profile.targetGoal === 'hypertrophy' ? 'mushak massasi' : 'tonus'} maqsadida 8-12 takrorlash oralig'i va o'rtacha 75s dam olish vaqti bilan tuzilgan optimal split.`,
      warmUp: [
        { name: 'Yugurish yo\'lakchasi (kardio)', duration: '5 daqiqa', note: 'Pulsni 120-130 gacha ko\'tarish' },
        { name: 'Yelka va bo\'g\'imlar aylanma harakati', duration: '3 daqiqa', note: 'Rotator kuff qizdirish' },
      ],
      exercises: finalEx.map((ex, idx) => ({
        id: 'w_ex_' + idx,
        exerciseId: ex.id,
        exerciseTitle: ex.titleUz,
        muscleGroupSlug: ex.muscleGroupSlug,
        equipment: ex.equipmentLabelUz,
        motionType: ex.motionType,
        cameraAngle: ex.cameraAngle,
        videoLoopUrl: ex.videoLoopUrl,
        videoMp4Url: ex.videoMp4Url,
        targetSets: ex.defaultSets,
        targetReps: ex.defaultReps,
        recommendedWeightKg: ex.defaultStartingWeightKg,
        restSeconds: ex.defaultRestSec,
        instructionsBrief: ex.biomechanics.execution,
        sets: Array.from({ length: ex.defaultSets }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          targetReps: 10,
          actualReps: 10,
          weightKg: ex.defaultStartingWeightKg,
          completed: false,
        })),
      })),
      coolDown: [
        { name: 'Ko\'krak va qanot mushaklarini cho\'zish (Stretching)', duration: '4 daqiqa' },
        { name: 'Nafasni me\'yorlashtirish', duration: '2 daqiqa' },
      ],
      isCompleted: false,
    };
  }

  // Generate with real Gemini AI
  const handleGenerateAIWorkout = async (targetMuscle?: string) => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch('/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          targetMuscleGroup: targetMuscle || "Ko'krak va Qo'llar",
          splitDayTitle: "Shaxsiy Yuqori Tana Split Dasturi",
        }),
      });

      if (!response.ok) {
        throw new Error('AI generatsiyasida xatolik');
      }

      const data = await response.json();

      // Map response to WorkoutPlan
      const newPlan: WorkoutPlan = {
        id: 'plan_ai_' + Date.now(),
        userId: userProfile.id,
        title: data.title || "Bugungi Shaxsiy AI Mashg'uloti",
        focusArea: data.focusArea || "Mushak gipertrofiyasi va quvvat",
        date: new Date().toISOString(),
        aiGenerated: true,
        aiRationale: data.aiRationale,
        warmUp: data.warmUp || [
          { name: 'Kardio isinish', duration: '5 daqiqa', note: 'Bo\'g\'imlarni tayyorlash' },
        ],
        exercises: (data.exercises || []).map((ex: any, idx: number) => {
          // Find matching motion preset or fallback
          const matchingPreset = exercises.find((e) => e.id === ex.exerciseId || e.titleUz.toLowerCase().includes(ex.exerciseTitle?.toLowerCase()))?.motionType || 'bench_press';
          return {
            id: 'ai_ex_' + idx,
            exerciseId: ex.exerciseId || 'gen_' + idx,
            exerciseTitle: ex.exerciseTitle,
            muscleGroupSlug: (ex.muscleGroupSlug as MuscleGroupSlug) || 'chest',
            equipment: ex.equipment || 'Shtanga / Gantel',
            motionType: (ex.motionType as any) || matchingPreset,
            targetSets: ex.targetSets || 4,
            targetReps: String(ex.targetReps || '8-10'),
            recommendedWeightKg: Number(ex.recommendedWeightKg) || 40,
            restSeconds: Number(ex.restSeconds) || 75,
            instructionsBrief: ex.instructionsBrief || 'Harakatni to\'liq amplituda bilan bajaring.',
            sets: Array.from({ length: ex.targetSets || 4 }).map((_, sIdx) => ({
              setNumber: sIdx + 1,
              targetReps: 10,
              actualReps: 10,
              weightKg: Number(ex.recommendedWeightKg) || 40,
              completed: false,
            })),
          };
        }),
        coolDown: data.coolDown || [
          { name: 'Mushaklarni cho\'zish (Statik stretching)', duration: '5 daqiqa' },
        ],
        isCompleted: false,
      };

      setTodayPlan(newPlan);
    } catch (err) {
      console.error('AI plan error, creating intelligent fallback plan:', err);
      setTodayPlan(generateDefaultPlan(userProfile, exercises));
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleFinishWorkout = (
    updatedPlan: WorkoutPlan,
    stats: { durationSeconds: number; totalTonnageKg: number; caloriesBurned: number }
  ) => {
    setTodayPlan(updatedPlan);
    setIsPlayerOpen(false);

    const newLog: WorkoutLogRecord = {
      id: 'log_' + Date.now(),
      userId: userProfile.id,
      date: new Date().toISOString(),
      workoutTitle: updatedPlan.title,
      durationSeconds: stats.durationSeconds,
      totalTonnageKg: stats.totalTonnageKg,
      caloriesBurned: stats.caloriesBurned,
      exercisesCompleted: updatedPlan.exercises.length,
      totalSets: updatedPlan.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0),
    };

    setLogs((prev) => [newLog, ...prev]);

    // Send to backend
    fetch('/api/workouts/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch((e) => console.debug('Backend log sync error:', e));
  };

  // Add exercise to current workout from encyclopedia
  const handleAddExerciseToToday = (exercise: Exercise) => {
    const newItem: WorkoutExerciseItem = {
      id: 'added_' + Date.now(),
      exerciseId: exercise.id,
      exerciseTitle: exercise.titleUz,
      muscleGroupSlug: exercise.muscleGroupSlug,
      equipment: exercise.equipmentLabelUz,
      motionType: exercise.motionType,
      cameraAngle: exercise.cameraAngle,
      videoLoopUrl: exercise.videoLoopUrl,
      videoMp4Url: exercise.videoMp4Url,
      targetSets: exercise.defaultSets,
      targetReps: exercise.defaultReps,
      recommendedWeightKg: exercise.defaultStartingWeightKg,
      restSeconds: exercise.defaultRestSec,
      instructionsBrief: exercise.biomechanics.execution,
      sets: Array.from({ length: exercise.defaultSets }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        targetReps: 10,
        actualReps: 10,
        weightKg: exercise.defaultStartingWeightKg,
        completed: false,
      })),
    };

    setTodayPlan((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newItem],
    }));

    setActiveTab('today');
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Top Athletic Navbar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ccff00] to-emerald-400 flex items-center justify-center text-black font-black shadow-lg shadow-[#ccff00]/20">
              <Zap className="w-5 h-5 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white uppercase font-athletic">
                  AI Smart Fitness
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 uppercase">
                  Pro Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Visual Motion Engine & Gemini AI Murabbiy
              </p>
            </div>
          </div>

          {/* User Quick Biometrics Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-[#ccff00]/60 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-[#ccff00]">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-bold text-white block leading-tight">
                  {userProfile.fullName}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {userProfile.weight} kg • {userProfile.height} sm •{' '}
                  {userProfile.targetGoal === 'hypertrophy'
                    ? 'Massa'
                    : userProfile.targetGoal === 'fat_loss'
                    ? 'Yog\' yo\'qotish'
                    : 'Kuch'}
                </span>
              </div>
            </button>

            <button
              onClick={() => setIsPlayerOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#ccff00]/25 transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span className="hidden sm:inline">Mashg'ulotni Boshlash</span>
              <span className="sm:hidden">Start</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-[#090d16] border-b border-slate-800/80 px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'today', label: "Bugungi Mashg'ulot", icon: Dumbbell },
            { id: 'library', label: 'Mashqlar Ensiklopediyasi', icon: Layers },
            { id: 'coach', label: 'Gemini AI Murabbiy', icon: Brain },
            { id: 'analytics', label: 'Progress & Tonnaj', icon: TrendingUp },
            { id: 'admin', label: 'Admin & Sozlamalar', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                  isCurrent
                    ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-md shadow-[#ccff00]/20'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-black' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Page Views */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {/* TAB 1: TODAY'S WORKOUT */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* AI Generator Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#11192e] to-[#0a101d] p-6 md:p-8 border border-slate-800 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini AI Shaxsiylashtirilgan Reja
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {todayPlan.title}
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {todayPlan.aiRationale ||
                    "Biometrik ko'rsatkichlaringiz, tiklanish sur'atingiz va maqsadlaringiz asosida sun'iy intellekt tomonidan generatsiya qilingan optimal trenirovka."}
                </p>

                {/* Quick Split Picker & Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsPlayerOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ccff00] to-emerald-400 hover:opacity-95 text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#ccff00]/25 transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-black" /> Mashg'ulotni Boshlash (Zal Rejimi)
                  </button>

                  <button
                    disabled={isGeneratingPlan}
                    onClick={() => handleGenerateAIWorkout()}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs md:text-sm flex items-center gap-2 border border-slate-700 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGeneratingPlan ? 'animate-spin text-[#ccff00]' : ''}`} />
                    {isGeneratingPlan ? 'AI Tuzmoqda...' : 'AI Rejani Yangilash'}
                  </button>
                </div>
              </div>

              {/* Decorative Subtle Glowing Mesh */}
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#ccff00]/10 blur-3xl pointer-events-none" />
            </div>

            {/* Warm-Up Section */}
            {todayPlan.warmUp && todayPlan.warmUp.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> 1. Isinish va Bo'g'imlarni Tayyorlash (Warm-Up)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {todayPlan.warmUp.map((w, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <strong className="text-white">{w.name}</strong>
                        <p className="text-[11px] text-slate-400">{w.note}</p>
                      </div>
                      <span className="font-mono font-bold text-sky-400 text-xs px-2 py-1 rounded bg-sky-500/10">
                        {w.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercises List in Today's Workout with Visual Motion Engine */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#ccff00]" /> 2. Asosiy Mashg'ulotlar Bloklari ({todayPlan.exercises.length} ta mashq)
                </h3>
                <button
                  onClick={() => setActiveTab('library')}
                  className="text-xs font-bold text-[#ccff00] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Mashq qo'shish
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todayPlan.exercises.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#0d121f] border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-lg bg-[#ccff00] text-black font-black text-xs flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.equipment}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-snug">
                          {item.exerciseTitle}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#ccff00] block">
                          {item.targetSets} set × {item.targetReps}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Tavsiya: {item.recommendedWeightKg} kg • Dam: {item.restSeconds}s
                        </span>
                      </div>
                    </div>

                    {/* Integrated Looping Visual Motion Engine */}
                    <VisualMotionEngine
                      motionType={item.motionType}
                      titleUz={item.exerciseTitle}
                      primaryMuscles={[item.muscleGroupSlug]}
                      cameraAngle={item.cameraAngle}
                      videoLoopUrl={item.videoLoopUrl}
                      videoMp4Url={item.videoMp4Url}
                      compact={true}
                      autoplay={true}
                    />

                    {/* Instructions brief */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {item.instructionsBrief}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cool-Down Section */}
            {todayPlan.coolDown && todayPlan.coolDown.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 3. Mashg'ulotni Yakunlash (Cool-Down & Cho'zilish)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {todayPlan.coolDown.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-white font-medium">{c.name}</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs px-2 py-1 rounded bg-emerald-500/10">
                        {c.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXERCISE LIBRARY */}
        {activeTab === 'library' && (
          <ExerciseLibrary
            exercises={exercises}
            onSelectExerciseForWorkout={handleAddExerciseToToday}
          />
        )}

        {/* TAB 3: GEMINI AI COACH CHAT */}
        {activeTab === 'coach' && (
          <div className="max-w-4xl mx-auto">
            <AICoachPanel userProfile={userProfile} />
          </div>
        )}

        {/* TAB 4: PROGRESS & HISTORY */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            logs={logs}
            onStartNewWorkout={() => {
              setActiveTab('today');
              setIsPlayerOpen(true);
            }}
          />
        )}

        {/* TAB 5: ADMIN & MURABBIY PANEL */}
        {activeTab === 'admin' && (
          <AdminPanel
            exercises={exercises}
            onAddExercise={(newEx) => setExercises((prev) => [newEx, ...prev])}
            onDeleteExercise={(id) => setExercises((prev) => prev.filter((e) => e.id !== id))}
            onUpdateExercise={(updated) =>
              setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
            }
          />
        )}
      </main>

      {/* Interactive Gym Workout Player Modal */}
      {isPlayerOpen && (
        <WorkoutPlayerModal
          plan={todayPlan}
          onClose={() => setIsPlayerOpen(false)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {/* User Onboarding & Biometrics Modal */}
      <OnboardingModal
        initialProfile={userProfile}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          setIsOnboardingOpen(false);
          // Regenerate default routine
          setTodayPlan(generateDefaultPlan(updated, exercises));
        }}
      />
    </div>
  );
}
