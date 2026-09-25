import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Dumbbell,
  Shield,
  Layers,
  Zap,
  Activity,
  Flame,
  Target,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import { Exercise, MuscleGroupSlug, EquipmentType } from '../types/fitness';
import { MUSCLE_GROUPS } from '../data/exercises';
import { VisualMotionEngine } from './VisualMotionEngine';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onSelectExerciseForWorkout?: (exercise: Exercise) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  exercises,
  onSelectExerciseForWorkout,
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupSlug | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchMuscle = selectedMuscle === 'all' || ex.muscleGroupSlug === selectedMuscle;
      const matchEquipment = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
      const matchSearch =
        !searchQuery.trim() ||
        ex.titleUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.targetMuscles.primary.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchMuscle && matchEquipment && matchSearch;
    });
  }, [exercises, selectedMuscle, selectedEquipment, searchQuery]);

  const equipmentList: { type: EquipmentType | 'all'; labelUz: string }[] = [
    { type: 'all', labelUz: 'Barchasi' },
    { type: 'barbell', labelUz: 'Shtanga' },
    { type: 'dumbbell', labelUz: 'Gantel' },
    { type: 'machine', labelUz: 'Trenajyor' },
    { type: 'cable', labelUz: 'Blokli ramalar' },
    { type: 'bodyweight', labelUz: "O'z vazni bilan" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d121f] to-[#131b2e] p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#ccff00]/15 text-[#ccff00]">
              <Dumbbell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">
              Zaldagi Mashqlar Ensiklopediyasi
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Avtomatik aylanuvchi vizual animatsiyalar va biomehanik tahlil bilan barcha mashqlar bazasi ({exercises.length} ta mashq)
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mashq nomi yoki mushak..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#ccff00] transition-colors"
          />
        </div>
      </div>

      {/* Muscle Group Filter Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Mushak Guruhlari:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedMuscle('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              selectedMuscle === 'all'
                ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-md shadow-[#ccff00]/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            Barcha Mushaklar
          </button>
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = selectedMuscle === mg.slug;
            return (
              <button
                key={mg.id}
                onClick={() => setSelectedMuscle(mg.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-md shadow-[#ccff00]/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{mg.nameUz}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Inventar:
        </span>
        {equipmentList.map((eq) => (
          <button
            key={eq.type}
            onClick={() => setSelectedEquipment(eq.type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              selectedEquipment === eq.type
                ? 'bg-sky-500 text-white font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {eq.labelUz}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Hech qanday mashq topilmadi</h3>
          <p className="text-xs text-slate-500 mt-1">Filtrlarni o'zgartirib ko'ring yoki qidiruv so'zini tozalang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setActiveExerciseModal(exercise)}
              className="group cursor-pointer rounded-2xl bg-[#0d121f] border border-slate-800/90 hover:border-[#ccff00]/50 hover:shadow-xl hover:shadow-[#ccff00]/5 transition-all flex flex-col overflow-hidden"
            >
              {/* Animated Motion Engine Compact Preview */}
              <div className="relative">
                <VisualMotionEngine
                  motionType={exercise.motionType}
                  titleUz={exercise.titleUz}
                  primaryMuscles={exercise.targetMuscles.primary}
                  secondaryMuscles={exercise.targetMuscles.secondary}
                  videoLoopUrl={exercise.videoLoopUrl}
                  videoMp4Url={exercise.videoMp4Url}
                  cameraAngle={exercise.cameraAngle}
                  compact={true}
                  autoplay={true}
                />
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {exercise.equipmentLabelUz}
                    </span>
                    <span className="text-[11px] font-bold text-[#ccff00]">
                      {exercise.difficultyLevel === 'beginner' ? 'Boshlang\'ich' : exercise.difficultyLevel === 'intermediate' ? "O'rta" : 'Yuqori'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#ccff00] transition-colors leading-snug">
                    {exercise.titleUz}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {exercise.title}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 font-semibold">{exercise.defaultSets} set</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{exercise.defaultReps}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[#ccff00] font-bold group-hover:translate-x-0.5 transition-transform">
                    Tahlil <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Exercise Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-[#0e1422] border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setActiveExerciseModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
                  {activeExerciseModal.equipmentLabelUz}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {activeExerciseModal.difficultyLevel === 'beginner' ? 'Boshlang\'ich daraja' : activeExerciseModal.difficultyLevel === 'intermediate' ? "O'rta daraja" : 'Professional'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                {activeExerciseModal.titleUz}
              </h2>
              <p className="text-xs text-slate-400">{activeExerciseModal.title}</p>
            </div>

            {/* Visual Motion Engine Showcase */}
            <VisualMotionEngine
              motionType={activeExerciseModal.motionType}
              titleUz={activeExerciseModal.titleUz}
              primaryMuscles={activeExerciseModal.targetMuscles.primary}
              secondaryMuscles={activeExerciseModal.targetMuscles.secondary}
              videoLoopUrl={activeExerciseModal.videoLoopUrl}
              videoMp4Url={activeExerciseModal.videoMp4Url}
              cameraAngle={activeExerciseModal.cameraAngle}
              autoplay={true}
            />

            {/* 1. Working Muscles Section */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-[#ccff00] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Qaysi Mushaklar Ishlaydi?
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <strong className="text-slate-300">Asosiy yuklama (Target): </strong>
                  <span className="text-[#ccff00] font-semibold">
                    {activeExerciseModal.targetMuscles.primary.join(', ')}
                  </span>
                </div>
                {activeExerciseModal.targetMuscles.secondary.length > 0 && (
                  <div>
                    <strong className="text-slate-400">Yordamchi mushaklar (Synergists): </strong>
                    <span className="text-slate-300">
                      {activeExerciseModal.targetMuscles.secondary.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Biomechanical Instructions */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> To'g'ri Bajarish Texnikasi
              </h4>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white block mb-0.5">1. Dastlabki holat (Setup):</strong>
                  <p>{activeExerciseModal.biomechanics.setup}</p>
                </div>
                <div>
                  <strong className="text-white block mb-0.5">2. Harakat (Execution):</strong>
                  <p>{activeExerciseModal.biomechanics.execution}</p>
                </div>
                <div>
                  <strong className="text-[#ccff00] block mb-0.5">3. Nafas olish (Breathing):</strong>
                  <p>{activeExerciseModal.biomechanics.breathing}</p>
                </div>
                <div>
                  <strong className="text-slate-400 block mb-0.5">4. Sur'at (Tempo):</strong>
                  <p>{activeExerciseModal.biomechanics.tempo}</p>
                </div>
              </div>
            </div>

            {/* 3. Common Mistakes */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-2">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Ko'p Uchraydigan Xatolar
              </h4>
              <ul className="space-y-1 text-xs text-red-200 list-disc list-inside">
                {activeExerciseModal.commonMistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            {onSelectExerciseForWorkout && (
              <button
                onClick={() => {
                  onSelectExerciseForWorkout(activeExerciseModal);
                  setActiveExerciseModal(null);
                }}
                className="w-full py-3 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ccff00]/25 transition-all"
              >
                <PlusIcon /> Bugungi Mashg'ulotga Qo'shish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
  );
}
