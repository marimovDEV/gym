import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  Users,
  Brain,
  Dumbbell,
  CheckCircle,
  Video,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Exercise, MuscleGroupSlug, EquipmentType, MotionPreset } from '../types/fitness';
import { MUSCLE_GROUPS } from '../data/exercises';

interface AdminPanelProps {
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onDeleteExercise: (id: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  exercises,
  onAddExercise,
  onDeleteExercise,
  onUpdateExercise,
}) => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'users' | 'ai_prompts'>('exercises');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New exercise form state
  const [titleUz, setTitleUz] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [muscleGroupSlug, setMuscleGroupSlug] = useState<MuscleGroupSlug>('chest');
  const [equipment, setEquipment] = useState<EquipmentType>('barbell');
  const [motionType, setMotionType] = useState<MotionPreset>('bench_press');
  const [videoLoopUrl, setVideoLoopUrl] = useState('');
  const [primaryMuscles, setPrimaryMuscles] = useState('');
  const [setupText, setSetupText] = useState('');
  const [executionText, setExecutionText] = useState('');
  const [breathingText, setBreathingText] = useState('');
  const [mistakesText, setMistakesText] = useState('');
  const [defaultSets, setDefaultSets] = useState(4);
  const [defaultReps, setDefaultReps] = useState('8-10');
  const [defaultRestSec, setDefaultRestSec] = useState(90);

  // System Prompt Customization
  const [systemPrompt, setSystemPrompt] = useState<string>(
    `Siz professional sertifikatlangan sport murabbiyi, biomehanika va sport diyetologi mutaxassisisiz. 
Foydalanuvchining jinsi, yoshi, bo'yi, vazni va maqsadiga mos holda aniq yuklamalar (kg), setlar, takrorlashlar va xavfsiz texnikani o'rgatasiz.
Javoblaringizni doim o'zbek tilida, aniq, dalillarga asoslangan va sportcha ruhlantiruvchi tilda bering.`
  );
  const [savedPromptNotice, setSavedPromptNotice] = useState(false);

  const handleSaveNewExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleUz.trim()) return;

    const newEx: Exercise = {
      id: 'ex_' + Date.now(),
      muscleGroupId: muscleGroupSlug,
      muscleGroupSlug,
      title: titleEn.trim() || titleUz.trim(),
      titleUz: titleUz.trim(),
      equipment,
      equipmentLabelUz:
        equipment === 'barbell'
          ? 'Shtanga'
          : equipment === 'dumbbell'
          ? 'Gantel'
          : equipment === 'machine'
          ? 'Trenajyor'
          : equipment === 'cable'
          ? 'Blokli rama'
          : "O'z vazni",
      difficultyLevel: 'intermediate',
      motionType,
      videoLoopUrl: videoLoopUrl.trim() || undefined,
      targetMuscles: {
        primary: primaryMuscles.split(',').map((s) => s.trim()).filter(Boolean),
        secondary: [],
      },
      biomechanics: {
        setup: setupText.trim() || "Dastlabki holatni to'g'ri o'rnating.",
        execution: executionText.trim() || "Harakatni to'liq amplituda bilan bajaring.",
        breathing: breathingText.trim() || "Tushirishda nafas oling, ko'tarishda chiqaring.",
        tempo: '2-0-1',
      },
      commonMistakes: mistakesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      defaultSets: Number(defaultSets),
      defaultReps: defaultReps.trim(),
      defaultRestSec: Number(defaultRestSec),
      defaultStartingWeightKg: 20,
    };

    onAddExercise(newEx);
    setIsAddingNew(false);
    // Reset form
    setTitleUz('');
    setTitleEn('');
    setPrimaryMuscles('');
    setVideoLoopUrl('');
  };

  const handleSavePrompt = () => {
    setSavedPromptNotice(true);
    setTimeout(() => setSavedPromptNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0d121f] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Admin & Murabbiy Boshqaruv Paneli</h2>
            <p className="text-xs text-slate-400">
              Mashqlar katalogi, GIF/Video havolalari, foydalanuvchilar tahlili va AI prompt sozlamalari
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'exercises'
                ? 'bg-[#ccff00] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> Mashqlar ({exercises.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-[#ccff00] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Foydalanuvchilar
          </button>
          <button
            onClick={() => setActiveTab('ai_prompts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai_prompts'
                ? 'bg-[#ccff00] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> AI Promptlari
          </button>
        </div>
      </div>

      {/* 1. Exercises Management */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Barcha mashqlar bazasi ({exercises.length} ta)
            </h3>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-4 py-2 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#ccff00]/15"
            >
              <Plus className="w-4 h-4" /> {isAddingNew ? 'Bekor qilish' : 'Yangi Mashq Qo\'shish'}
            </button>
          </div>

          {/* Add New Exercise Card Form */}
          {isAddingNew && (
            <form
              onSubmit={handleSaveNewExercise}
              className="p-6 rounded-3xl bg-[#0f172a] border border-[#ccff00]/40 shadow-2xl space-y-4 animate-in fade-in"
            >
              <h4 className="text-sm font-bold text-[#ccff00] uppercase tracking-wider">
                Yangi mashq kartochkasi yaratish
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mashq nomi (O'zbekcha) *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleUz}
                    onChange={(e) => setTitleUz(e.target.value)}
                    placeholder="Masalan: Skameykada gantel bosish"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mashq nomi (Inglizcha)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Masalan: Dumbbell Flat Bench Press"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mushak Guruhi
                  </label>
                  <select
                    value={muscleGroupSlug}
                    onChange={(e) => setMuscleGroupSlug(e.target.value as MuscleGroupSlug)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    {MUSCLE_GROUPS.map((mg) => (
                      <option key={mg.slug} value={mg.slug}>
                        {mg.nameUz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Inventar</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value="barbell">Shtanga</option>
                    <option value="dumbbell">Gantel</option>
                    <option value="machine">Trenajyor</option>
                    <option value="cable">Blokli rama</option>
                    <option value="bodyweight">O'z vazni</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Motion Engine Preset
                  </label>
                  <select
                    value={motionType}
                    onChange={(e) => setMotionType(e.target.value as MotionPreset)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value="bench_press">Bench Press (Ko'krak)</option>
                    <option value="squat">Squat (Pristed)</option>
                    <option value="deadlift">Deadlift (Stanovoy)</option>
                    <option value="lat_pulldown">Lat Pulldown (Qanot)</option>
                    <option value="shoulder_press">Shoulder Press (Yelka)</option>
                    <option value="bicep_curl">Bicep Curl (Qo'l)</option>
                    <option value="tricep_pushdown">Tricep Pushdown</option>
                    <option value="dumbbell_lateral_raise">Lateral Raise</option>
                    <option value="push_up">Push Up / Plank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Video/GIF URL (Ixtiyoriy Cloudinary yoki AWS S3 havolasi)
                </label>
                <input
                  type="url"
                  value={videoLoopUrl}
                  onChange={(e) => setVideoLoopUrl(e.target.value)}
                  placeholder="https://example.com/videos/exercise_loop.webm"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Asosiy ishlaydigan mushaklar (vergul bilan)
                </label>
                <input
                  type="text"
                  value={primaryMuscles}
                  onChange={(e) => setPrimaryMuscles(e.target.value)}
                  placeholder="Katta ko'krak mushagi, Oldingi delta"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    To'g'ri texnika ko'rsatmasi
                  </label>
                  <textarea
                    rows={2}
                    value={executionText}
                    onChange={(e) => setExecutionText(e.target.value)}
                    placeholder="Harakatni to'g'ri bajarish tartibi..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Ko'p uchraydigan xatolar (har bir qatorga bittadan)
                  </label>
                  <textarea
                    rows={2}
                    value={mistakesText}
                    onChange={(e) => setMistakesText(e.target.value)}
                    placeholder="Beldan qattiq egilish&#10;Tirsaklarni noto'g'ri ochish"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-[#ccff00] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Bazasiga Saqlash
              </button>
            </form>
          )}

          {/* Exercise Table */}
          <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mashq nomi</th>
                    <th className="py-3 px-4">Mushak Guruhi</th>
                    <th className="py-3 px-4">Inventar</th>
                    <th className="py-3 px-4">Motion / Video</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {exercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {ex.titleUz}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {ex.title}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[#ccff00] font-semibold border border-slate-700">
                          {ex.muscleGroupSlug}
                        </span>
                      </td>
                      <td className="py-3 px-4">{ex.equipmentLabelUz}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ex.videoLoopUrl ? '🎥 MP4/WebM' : `⚡ ${ex.motionType}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteExercise(ex.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Stats & Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold">Faol sportchilar</span>
              <h3 className="text-2xl font-black text-white mt-1">1,248 ta</h3>
              <p className="text-[11px] text-[#ccff00] mt-1">+18% o'tgan haftaga nisbatan</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold">Jami Ko'tarilgan Tonnaj</span>
              <h3 className="text-2xl font-black text-sky-400 mt-1">428,500 kg</h3>
              <p className="text-[11px] text-slate-400 mt-1">428.5 tonna metall</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold">Sarflangan Kaloriya</span>
              <h3 className="text-2xl font-black text-orange-400 mt-1">1,890,200 kcal</h3>
              <p className="text-[11px] text-slate-400 mt-1">AI mashg'ulotlarida yoqilgan</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-3">Oxirgi mashg'ulot jurnallari</h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Sherzod Aliyev', goal: 'Gipertrofiya', focus: "Ko'krak & Triceps", tonnage: '3,840 kg', time: '14 daqiqa oldin' },
                { name: 'Jasur Beknazarov', goal: "Yog' yo'qotish", focus: 'Oyoq & Koor', tonnage: '4,120 kg', time: '1 soat oldin' },
                { name: 'Malika Karimova', goal: 'Tonus & Relief', focus: 'Dumba & Yelka', tonnage: '2,400 kg', time: '3 soat oldin' },
              ].map((u, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white">{u.name}</strong>
                    <span className="text-slate-500 ml-2">({u.goal})</span>
                    <div className="text-[11px] text-[#ccff00] mt-0.5">{u.focus}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white">{u.tonnage}</span>
                    <span className="text-[10px] text-slate-500 block">{u.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Prompts Optimization */}
      {activeTab === 'ai_prompts' && (
        <div className="p-6 rounded-3xl bg-[#0d121f] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Gemini AI Murabbiy Prompt Sozlamalari</h3>
              <p className="text-xs text-slate-400">
                Model: <strong>gemini-2.5-flash</strong> (Dastur generatsiyasi va sport biomehanika maslahati)
              </p>
            </div>
            {savedPromptNotice && (
              <span className="text-xs font-bold text-[#ccff00] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saqlandi!
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              System Instruction (Murabbiy Rol Ko'rsatmasi)
            </label>
            <textarea
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs md:text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePrompt}
              className="px-5 py-2.5 rounded-xl bg-[#ccff00] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-2 shadow-md shadow-[#ccff00]/20"
            >
              <Save className="w-4 h-4" /> Promptni Saqlash
            </button>
            <button
              onClick={() =>
                setSystemPrompt(
                  `Siz professional sertifikatlangan sport murabbiyi, biomehanika va sport diyetologi mutaxassisisiz.`
                )
              }
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            >
              Standartga qaytarish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
