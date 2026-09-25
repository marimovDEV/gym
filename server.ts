import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory workout storage
interface StoredWorkoutLog {
  id: string;
  userId: string;
  date: string;
  workoutTitle: string;
  durationSeconds: number;
  totalTonnageKg: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  totalSets: number;
  notes?: string;
}

const workoutHistoryStore: StoredWorkoutLog[] = [
  {
    id: 'sample-1',
    userId: 'usr_default',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    workoutTitle: "Ko'krak va Triceps Hipertrofiyasi",
    durationSeconds: 3120, // 52 mins
    totalTonnageKg: 3450,
    caloriesBurned: 410,
    exercisesCompleted: 4,
    totalSets: 14,
  },
  {
    id: 'sample-2',
    userId: 'usr_default',
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    workoutTitle: 'Oyoq va Dumba Kuch Dasturi',
    durationSeconds: 3600, // 60 mins
    totalTonnageKg: 5200,
    caloriesBurned: 530,
    exercisesCompleted: 4,
    totalSets: 15,
  },
];

// 1. Endpoint: Generate AI Personalized Workout
app.post('/api/ai/generate-workout', async (req: Request, res: Response) => {
  try {
    const { userProfile, targetMuscleGroup, splitDayTitle } = req.body;

    const userGoal =
      userProfile?.targetGoal === 'fat_loss'
        ? "Yog' yo'qotish va rel'yef (Metabolik zichlik, 12-15 takrorlash, 60s dam)"
        : userProfile?.targetGoal === 'strength'
        ? 'Maksimal kuch (Og\'ir vazn, 4-6 takrorlash, 120s dam)'
        : 'Mushak gipertrofiyasi (Hajm va massa, 8-12 takrorlash, 75-90s dam)';

    const prompt = `
Siz sport zallari va fitnes bo'yicha eng tajribali murabbiy va biomehanika mutaxassisisiz.
Foydalanuvchi biometrik ma'lumotlari:
- Ismi: ${userProfile?.fullName || 'Sportchi'}
- Jinsi: ${userProfile?.gender || 'erkak'}
- Yoshi: ${userProfile?.age || 24} yosh
- Bo'yi: ${userProfile?.height || 178} sm, Hozirgi Vazni: ${userProfile?.weight || 75} kg
- Asosiy maqsad: ${userGoal}
- Darajasi: ${userProfile?.fitnessLevel || 'intermediate'}
- Haftalik mashg'ulotlar soni: ${userProfile?.daysPerWeek || 4} kun
- Jarohat yoki cheklovlar: ${userProfile?.injuriesOrLimitations || "Yo'q"}
- Tanlangan mushak guruhi/fokusi: ${targetMuscleGroup || "Ko'krak va Qanot"}
- Dastur nomi: ${splitDayTitle || "Bugungi Shaxsiy Trenirovka"}

Ushbu sportchiga bugun zalda bajarish uchun mukammal moslashtirilgan, xavfsiz va progressiv kunlik mashg'ulot rejasini tuzib bering.
Har bir mashq uchun sportchining vazniga qarab aniq ishchi vazn (kg), yondashuvlar (sets) va takrorlashlar (reps) soni, dam olish vaqti (soniyalarda), hamda qisqa texnik ko'rsatma yozing.
Javobni quyidagi JSON strukturada qaytaring.
`;

    // Call Gemini Model (prefer gemini-2.5-flash or gemini-3.8-flash)
    let modelName = 'gemini-2.5-flash';
    let response;

    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction:
            "Siz o'zbek tilida so'zlashuvchi professional fitnes murabbiyisiz. Sportchining biometrik ko'rsatkichlariga qarab aniq ishchi vaznlarni (kg) va xavfsiz texnikani belgilaysiz.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              focusArea: { type: Type.STRING },
              aiRationale: { type: Type.STRING },
              warmUp: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    note: { type: Type.STRING },
                  },
                  required: ['name', 'duration', 'note'],
                },
              },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    exerciseId: { type: Type.STRING },
                    exerciseTitle: { type: Type.STRING },
                    muscleGroupSlug: { type: Type.STRING },
                    equipment: { type: Type.STRING },
                    motionType: { type: Type.STRING },
                    targetSets: { type: Type.INTEGER },
                    targetReps: { type: Type.STRING },
                    recommendedWeightKg: { type: Type.NUMBER },
                    restSeconds: { type: Type.INTEGER },
                    instructionsBrief: { type: Type.STRING },
                  },
                  required: [
                    'exerciseTitle',
                    'muscleGroupSlug',
                    'targetSets',
                    'targetReps',
                    'recommendedWeightKg',
                    'restSeconds',
                  ],
                },
              },
              coolDown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    duration: { type: Type.STRING },
                  },
                  required: ['name', 'duration'],
                },
              },
            },
            required: ['title', 'focusArea', 'exercises'],
          },
        },
      });
    } catch (modelErr) {
      console.warn('Falling back to gemini-3.8-flash', modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error) {
    console.error('Error generating workout:', error);
    res.status(500).json({
      error: 'Trenirovka dasturini yaratishda xatolik yuz berdi',
      details: String(error),
    });
  }
});

// 2. Endpoint: AI Coach Advice
app.post('/api/ai/coach-advice', async (req: Request, res: Response) => {
  try {
    const { question, userProfile, conversationHistory } = req.body;

    const prompt = `
Foydalanuvchi profil:
- Ismi: ${userProfile?.fullName || 'Sportchi'}
- Jinsi: ${userProfile?.gender || 'erkak'}, Yoshi: ${userProfile?.age || 24}
- Bo'yi: ${userProfile?.height || 178} sm, Vazni: ${userProfile?.weight || 75} kg
- Maqsad: ${userProfile?.targetGoal || 'hypertrophy'}
- Daraja: ${userProfile?.fitnessLevel || 'intermediate'}
- Jarohatlar: ${userProfile?.injuriesOrLimitations || "Yo'q"}

Foydalanuvchi savoli:
"${question}"

Siz sport zali bosh murabbiyisiz. Sportchiga aniq, ilmiy asoslangan, xavfsiz va ilhomlantiruvchi javob bering (o'zbek tilida).
Quyidagi JSON formatda qaytaring:
{
  "reply": "Murabbiyning batafsil va aniq tavsiyasi...",
  "suggestions": ["Qisqa keyingi savol 1", "Qisqa keyingi savol 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('Error in coach advice:', err);
    res.json({
      reply:
        "Har qanday mashqda xavfsizlik birinchi o'rinda turadi. Tushirish fazasini nazorat qiling (2-3 soniya), ko'tarishda kuchli nafas chiqaring va umurtqa pog'onasini neytral holatda saqlang!",
      suggestions: [
        "Pristedda tizzalarim og'rimasligi uchun nima qilish kerak?",
        "Gantellar bilan ishlaganda qanday nafas olinadi?",
      ],
    });
  }
});

// 3. Endpoint: Workout Logging & Analytics
app.post('/api/workouts/log', (req: Request, res: Response) => {
  try {
    const logData: StoredWorkoutLog = {
      id: 'log_' + Date.now(),
      userId: req.body.userId || 'usr_default',
      date: new Date().toISOString(),
      workoutTitle: req.body.workoutTitle || "Mashg'ulot",
      durationSeconds: Number(req.body.durationSeconds) || 2700,
      totalTonnageKg: Number(req.body.totalTonnageKg) || 2500,
      caloriesBurned: Number(req.body.caloriesBurned) || 350,
      exercisesCompleted: Number(req.body.exercisesCompleted) || 4,
      totalSets: Number(req.body.totalSets) || 12,
      notes: req.body.notes || '',
    };

    workoutHistoryStore.unshift(logData);
    res.json({ success: true, log: logData });
  } catch (err) {
    res.status(500).json({ error: 'Log saqlanmadi' });
  }
});

app.get('/api/workouts/history', (req: Request, res: Response) => {
  res.json(workoutHistoryStore);
});

// Vite Middleware mounting for SPA
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Smart Fitness Server is running on port ${PORT}`);
  });
}

startServer();
