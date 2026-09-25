export type Gender = 'male' | 'female';
export type FitnessGoal = 'fat_loss' | 'hypertrophy' | 'strength' | 'endurance';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetGoal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  preferredEquipment: string[];
  injuriesOrLimitations?: string;
  daysPerWeek: number;
  createdAt: string;
}

export type MuscleGroupSlug = 
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'abs';

export interface MuscleGroup {
  id: string;
  nameUz: string;
  nameEn: string;
  slug: MuscleGroupSlug;
  descriptionUz: string;
  targetMuscles: string[];
  icon: string;
}

export type EquipmentType = 
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight';

export type MotionPreset =
  | 'bench_press'
  | 'squat'
  | 'deadlift'
  | 'lat_pulldown'
  | 'shoulder_press'
  | 'bicep_curl'
  | 'tricep_pushdown'
  | 'cable_crossover'
  | 'leg_press'
  | 'dumbbell_lateral_raise'
  | 'hanging_leg_raise'
  | 'incline_dumbbell_press'
  | 'bent_over_row'
  | 'push_up'
  | 'lunges'
  | 'plank';

export type CameraAngle = 'side_90' | 'three_quarter_45' | 'front';
export type VideoProductionType = '3d_blender' | 'ai_generated' | 'studio_shoot' | 'biomechanical_engine';

export interface ExerciseBiomechanicalInfo {
  setup: string;
  execution: string;
  breathing: string;
  tempo: string;
}

export interface VideoStandardSpec {
  format?: 'webm_vp9' | 'mp4_h264' | 'gif';
  resolution?: '1080x1080' | '1080x1350' | string;
  fps?: 60 | 30 | number;
  fileSizeBytes?: number;
  maxFileSizeMb?: number;
  backgroundHex?: string;
  isMuted?: boolean;
  hasRimLight?: boolean;
  cameraAngle?: CameraAngle;
  seamlessLoop?: boolean;
  tempo?: {
    concentricSec: number;
    peakHoldSec: number;
    eccentricSec: number;
  };
  phases?: {
    concentricSec: number; // 1 - 1.5s
    peakSec: number;       // 0.5s
    eccentricSec: number;  // 2.0s
  };
}

export interface Exercise {
  id: string;
  muscleGroupId: string;
  muscleGroupSlug: MuscleGroupSlug;
  title: string;
  titleUz: string;
  equipment: EquipmentType;
  equipmentLabelUz: string;
  difficultyLevel: FitnessLevel;
  motionType: MotionPreset;
  cameraAngle?: CameraAngle;
  videoLoopUrl?: string; // WebM or MP4 loop URL
  videoMp4Url?: string;  // Fallback MP4
  videoStandardSpec?: VideoStandardSpec;
  targetMuscles: {
    primary: string[];
    secondary: string[];
  };
  biomechanics: ExerciseBiomechanicalInfo;
  commonMistakes: string[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSec: number;
  defaultStartingWeightKg: number;
}

export interface WorkoutSetData {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  muscleGroupSlug: MuscleGroupSlug;
  equipment: string;
  motionType: MotionPreset;
  cameraAngle?: CameraAngle;
  videoLoopUrl?: string;
  videoMp4Url?: string;
  targetSets: number;
  targetReps: string;
  recommendedWeightKg: number;
  restSeconds: number;
  instructionsBrief: string;
  sets: WorkoutSetData[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  focusArea: string;
  date: string;
  aiGenerated: boolean;
  aiRationale?: string;
  warmUp: { name: string; duration: string; note: string }[];
  exercises: WorkoutExerciseItem[];
  coolDown: { name: string; duration: string }[];
  isCompleted: boolean;
  completedAt?: string;
  stats?: {
    durationSeconds: number;
    totalTonnageKg: number;
    caloriesBurned: number;
    completedSetsCount: number;
    totalSetsCount: number;
  };
}

export interface WorkoutLogRecord {
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

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  suggestions?: string[];
}
