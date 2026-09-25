import React, { useState } from 'react';
import {
  User,
  Activity,
  Target,
  Flame,
  Scale,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
} from 'lucide-react';
import { UserProfile, Gender, FitnessGoal, FitnessLevel } from '../types/fitness';

interface OnboardingModalProps {
  initialProfile?: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onSaveProfile,
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState<string>(initialProfile?.fullName || 'Sherzod Aliyev');
  const [email, setEmail] = useState<string>(initialProfile?.email || 'sherzod@fitness.uz');
  const [phone, setPhone] = useState<string>(initialProfile?.phone || '+998 90 123 45 67');
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male');
  const [age, setAge] = useState<number>(initialProfile?.age || 24);
  const [height, setHeight] = useState<number>(initialProfile?.height || 178);
  const [weight, setWeight] = useState<number>(initialProfile?.weight || 76);
  const [targetGoal, setTargetGoal] = useState<FitnessGoal>(initialProfile?.targetGoal || 'hypertrophy');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(initialProfile?.fitnessLevel || 'intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialProfile?.daysPerWeek || 4);
  const [limitations, setLimitations] = useState<string>(initialProfile?.injuriesOrLimitations || '');

  if (!isOpen) return null;

  // Real-time Biometrics Calculations
  // BMI = weight(kg) / (height(m))^2
  const heightInMeters = height / 100;
  const bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;

  let bmiCategory = 'Normal vazn';
  let bmiColor = 'text-[#ccff00]';
  if (bmi < 18.5) {
    bmiCategory = 'Vazn kamligi';
    bmiColor = 'text-yellow-400';
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'Ortiqcha vazn';
    bmiColor = 'text-orange-400';
  } else if (bmi >= 30) {
    bmiCategory = 'Semizlik';
    bmiColor = 'text-red-400';
  }

  // Mifflin-St Jeor BMR formula
  // Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
  // Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
  const bmr = Math.round(
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
  );

  // TDEE estimation based on training days
  const activityMultiplier = daysPerWeek <= 2 ? 1.375 : daysPerWeek <= 4 ? 1.55 : 1.725;
  const tdee = Math.round(bmr * activityMultiplier);

  // Recommended calorie intake based on goal
  let targetCalories = tdee;
  if (targetGoal === 'fat_loss') targetCalories = Math.round(tdee - 450);
  if (targetGoal === 'hypertrophy') targetCalories = Math.round(tdee + 350);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      id: initialProfile?.id || 'usr_' + Date.now(),
      fullName,
      email,
      phone,
      gender,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      targetGoal,
      fitnessLevel,
      preferredEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      injuriesOrLimitations: limitations,
      daysPerWeek: Number(daysPerWeek),
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
    };
    onSaveProfile(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-[#0d121f] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ccff00]/15 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Biometrik Profil & Onboarding
              </h2>
              <p className="text-xs text-slate-400">
                AI rejangizni shaxsiylashtirish uchun biometrik ko'rsatkichlaringizni kiriting
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800"
            >
              Yopish
            </button>
          )}
        </div>

        {/* Live Biometric Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              BMI (Indeks)
            </span>
            <span className={`text-base font-black ${bmiColor}`}>{bmi}</span>
            <span className="text-[10px] text-slate-500 block truncate">{bmiCategory}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              BMR (Tinchlikda)
            </span>
            <span className="text-base font-black text-white">{bmr}</span>
            <span className="text-[10px] text-slate-500 block">kcal/kun</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              TDEE (Faollik)
            </span>
            <span className="text-base font-black text-sky-400">{tdee}</span>
            <span className="text-[10px] text-slate-500 block">kcal/kun</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Maqsadli Kaloriya
            </span>
            <span className="text-base font-black text-[#ccff00]">{targetCalories}</span>
            <span className="text-[10px] text-slate-500 block">kcal/kun</span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Ism va Familiya
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Telefon yoki Email
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
              />
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Jinsingiz
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    gender === 'male'
                      ? 'bg-[#ccff00] text-black border-[#ccff00]'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Erkak
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    gender === 'female'
                      ? 'bg-[#ccff00] text-black border-[#ccff00]'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Ayol
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Yoshingiz
              </label>
              <input
                type="number"
                min="12"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Haftada necha kun?
              </label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#ccff00]"
              >
                <option value={2}>2 kun (Boshlang'ich)</option>
                <option value={3}>3 kun (Klassik split)</option>
                <option value={4}>4 kun (Optimal Upper/Lower)</option>
                <option value={5}>5 kun (Push/Pull/Legs)</option>
                <option value={6}>6 kun (Intensiv)</option>
              </select>
            </div>
          </div>

          {/* Height and Weight Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">Bo'y (Height)</span>
                <span className="font-mono font-bold text-[#ccff00] text-sm">{height} sm</span>
              </div>
              <input
                type="range"
                min="130"
                max="220"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">Hozirgi Vazn (Weight)</span>
                <span className="font-mono font-bold text-[#ccff00] text-sm">{weight} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer"
              />
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Asosiy Maqsad:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'fat_loss',
                  title: 'Vazn tashlash',
                  sub: "Yog' yo'qotish va rel'yef",
                  icon: Flame,
                },
                {
                  id: 'hypertrophy',
                  title: 'Mushak massasi',
                  sub: "Gipertrofiya va hajm",
                  icon: Activity,
                },
                {
                  id: 'strength',
                  title: 'Kuch va tonus',
                  sub: "Kuch ko'rsatkichlari",
                  icon: Zap,
                },
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = targetGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setTargetGoal(g.id as FitnessGoal)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#ccff00]/15 border-[#ccff00] text-white shadow-lg shadow-[#ccff00]/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#ccff00]' : 'text-slate-500'}`} />
                    <div className="font-bold text-xs text-white">{g.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{g.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fitness Level */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Mashg'ulot Tajribangiz:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'beginner', title: "Boshlang'ich", desc: "0-6 oy" },
                { id: 'intermediate', title: "O'rta daraja", desc: "6-24 oy" },
                { id: 'advanced', title: "Professional", desc: "2+ yil" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setFitnessLevel(lvl.id as FitnessLevel)}
                  className={`py-2 px-3 rounded-xl border text-center transition-colors ${
                    fitnessLevel === lvl.id
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{lvl.title}</div>
                  <div className="text-[10px] text-slate-400">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Limitations or injuries */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Jarohatlar yoki cheklovlar (agar mavjud bo'lsa)
            </label>
            <input
              type="text"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="Masalan: Tizza og'rig'i, bel churrasi, yelka shikastlanishi..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ccff00] to-emerald-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#ccff00]/20 hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-4 h-4" /> Ma'lumotlarni Saqlash & Dasturni Tuzish
          </button>
        </form>
      </div>
    </div>
  );
};
