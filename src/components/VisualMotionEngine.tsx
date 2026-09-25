import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Activity,
  Eye,
  Zap,
  Camera,
  Layers,
  Sparkles,
  Wind,
  Compass,
  Maximize2,
  Video as VideoIcon,
} from 'lucide-react';
import { MotionPreset, CameraAngle } from '../types/fitness';

interface VisualMotionEngineProps {
  motionType: MotionPreset;
  titleUz: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  videoLoopUrl?: string;
  videoMp4Url?: string;
  cameraAngle?: CameraAngle;
  autoplay?: boolean;
  compact?: boolean;
}

export const VisualMotionEngine: React.FC<VisualMotionEngineProps> = ({
  motionType,
  titleUz,
  primaryMuscles,
  secondaryMuscles = [],
  videoLoopUrl,
  videoMp4Url,
  cameraAngle: customCameraAngle,
  autoplay = true,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState<number>(1);
  const [mode, setMode] = useState<'biomechanical' | 'video'>(videoLoopUrl ? 'video' : 'biomechanical');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (videoLoopUrl) {
      setMode('video');
    }
  }, [videoLoopUrl]);
  const [currentPhase, setCurrentPhase] = useState<'concentric' | 'peak' | 'eccentric'>('concentric');
  const [showMotionPath, setShowMotionPath] = useState<boolean>(true);
  const [showAnatomicalGlow, setShowAnatomicalGlow] = useState<boolean>(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Camera angle determination per TZ standard
  const defaultCameraAngle: CameraAngle = [
    'squat',
    'deadlift',
    'plank',
    'push_up',
    'lunges',
    'hanging_leg_raise',
  ].includes(motionType)
    ? 'side_90'
    : 'three_quarter_45';

  const cameraAngle = customCameraAngle || defaultCameraAngle;

  // Strict TZ Cadence & Phase Timing (Total ~3.7s seamless loop):
  // 1. Concentric (Lifting/Pulling): 1.2s (dynamic power) -> 0% to 32.4%
  // 2. Peak Contraction (Pause/Squeeze): 0.5s pause -> 32.4% to 45.9%
  // 3. Eccentric (Controlled Lowering): 2.0s (controlled negative) -> 45.9% to 100%
  const T_CONCENTRIC = 1200;
  const T_PEAK = 500;
  const T_ECCENTRIC = 2000;
  const TOTAL_CYCLE = (T_CONCENTRIC + T_PEAK + T_ECCENTRIC) / speed;

  const fracConcentric = T_CONCENTRIC / (T_CONCENTRIC + T_PEAK + T_ECCENTRIC); // ~0.324
  const fracPeak = (T_CONCENTRIC + T_PEAK) / (T_CONCENTRIC + T_PEAK + T_ECCENTRIC); // ~0.459

  useEffect(() => {
    let active = true;

    const animate = (currentTime: number) => {
      if (!isPlaying) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = (currentTime - startTimeRef.current) % TOTAL_CYCLE;
      const t = elapsed / TOTAL_CYCLE; // 0 to 1
      setProgress(t);

      if (t < fracConcentric) {
        setCurrentPhase('concentric');
      } else if (t < fracPeak) {
        setCurrentPhase('peak');
      } else {
        setCurrentPhase('eccentric');
      }

      if (active) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, TOTAL_CYCLE, fracConcentric, fracPeak]);

  // Video play/pause synchronization
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, mode]);

  // Compute smooth normalized position [0 = bottom/stretched, 1 = top/contracted]
  // With cubic smoothing for natural biomechanics
  let displacement = 0;
  if (progress < fracConcentric) {
    // 0 -> 1 (lifting) with dynamic ease-out
    const p = progress / fracConcentric;
    displacement = 0.5 - 0.5 * Math.cos(p * Math.PI);
  } else if (progress < fracPeak) {
    // 1 (holding top peak)
    displacement = 1;
  } else {
    // 1 -> 0 (controlled lowering)
    const p = (progress - fracPeak) / (1 - fracPeak);
    displacement = 0.5 + 0.5 * Math.cos(p * Math.PI);
  }

  // Trajectory bar path data per exercise
  const getMotionPathData = () => {
    switch (motionType) {
      case 'bench_press':
        return { x1: 170, y1: 135, x2: 170, y2: 215, currentY: 215 - displacement * 80 };
      case 'squat':
        return { x1: 175, y1: 110, x2: 175, y2: 180, currentY: 180 - displacement * 70 };
      case 'deadlift':
        return { x1: 170, y1: 140, x2: 170, y2: 245, currentY: 245 - displacement * 105 };
      case 'lat_pulldown':
        return { x1: 180, y1: 95, x2: 180, y2: 175, currentY: 95 + displacement * 80 };
      case 'shoulder_press':
        return { x1: 180, y1: 105, x2: 180, y2: 185, currentY: 185 - displacement * 80 };
      case 'bicep_curl':
        return { x1: 195, y1: 155, x2: 225, y2: 235, currentY: 235 - displacement * 80 };
      case 'tricep_pushdown':
        return { x1: 185, y1: 175, x2: 185, y2: 250, currentY: 175 + displacement * 75 };
      case 'dumbbell_lateral_raise':
        return { x1: 220, y1: 160, x2: 220, y2: 240, currentY: 240 - displacement * 80 };
      default:
        return { x1: 180, y1: 140, x2: 180, y2: 220, currentY: 220 - displacement * 80 };
    }
  };

  const pathData = getMotionPathData();

  // Render Kinematic 60fps Humanoid Skeleton with Rim Lighting & Anatomical Highlights
  const renderBiomechanicKinematics = () => {
    switch (motionType) {
      case 'bench_press': {
        const barY = 210 - displacement * 75; // Lower to chest at 210, push to 135
        const elbowBend = 75 - displacement * 40;
        return (
          <g>
            {/* Flat Bench with Studio Rim Glow */}
            <rect x="65" y="240" width="230" height="14" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="105" y="254" width="12" height="66" fill="#0f172a" />
            <rect x="243" y="254" width="12" height="66" fill="#0f172a" />

            {/* Athlete lying on bench - Compression Rashguard Dark Silhouette */}
            {/* Head with Rim Light */}
            <circle cx="105" cy="226" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            {/* Torso */}
            <line x1="120" y1="230" x2="220" y2="230" stroke="#0f172a" strokeWidth="22" strokeLinecap="round" />
            <line x1="120" y1="230" x2="220" y2="230" stroke="#334155" strokeWidth="16" strokeLinecap="round" />

            {/* Target Muscle: Pectoralis Major - Neon Fire/Orange Glow */}
            {showAnatomicalGlow && (
              <ellipse
                cx="170"
                cy="224"
                rx={20 + displacement * 3}
                ry={9 + displacement * 3}
                fill={currentPhase === 'peak' ? '#ff3b30' : currentPhase === 'concentric' ? '#ff5500' : '#ccff00'}
                opacity={0.9}
                className="filter drop-shadow-[0_0_12px_#ff5500]"
              />
            )}

            {/* Synergist Muscle: Triceps / Anterior Delt - Light Cyan Rim */}
            {showAnatomicalGlow && (
              <circle
                cx="145"
                cy="222"
                r="7"
                fill="#38bdf8"
                opacity={0.8}
                className="filter drop-shadow-[0_0_8px_#38bdf8]"
              />
            )}

            {/* Arms - Upper arm & forearm kinematics */}
            <path
              d={`M 155 228 L ${170 - elbowBend} ${215 - displacement * 20} L 170 ${barY}`}
              stroke="#64748b"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Rim Highlight on Arm */}
            <path
              d={`M 155 228 L ${170 - elbowBend} ${215 - displacement * 20} L 170 ${barY}`}
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.75"
            />

            {/* Barbell with Metallic Sheen */}
            <line x1="45" y1={barY} x2="295" y2={barY} stroke="#f8fafc" strokeWidth="7" strokeLinecap="round" />
            {/* Olympic Weight Plates with Rim Color */}
            <rect x="55" y={barY - 32} width="12" height="64" rx="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="69" y={barY - 25} width="8" height="50" rx="2" fill="#f59e0b" />
            <rect x="273" y={barY - 32} width="12" height="64" rx="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="287" y={barY - 25} width="8" height="50" rx="2" fill="#f59e0b" />

            {/* Feet firmly on floor */}
            <path d="M 220 230 L 245 270 L 245 320" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 220 230 L 245 270 L 245 320" stroke="#475569" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      }

      case 'squat': {
        // Squat: Hip and knee flexion with 90° Side View tripod perspective
        const hipDrop = (1 - displacement) * 70; // displacement=1 is top/standing, 0 is bottom squat
        const kneeX = 180 + (1 - displacement) * 32;
        const kneeY = 240 + (1 - displacement) * 16;
        const hipX = 145 - (1 - displacement) * 26;
        const hipY = 175 + hipDrop;
        const barY = 110 + hipDrop;
        const torsoAngleX = 160 - (1 - displacement) * 20;

        return (
          <g>
            {/* Platform Floor with Rim Light */}
            <line x1="30" y1="330" x2="330" y2="330" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            <line x1="30" y1="326" x2="330" y2="326" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />

            {/* Legs: Foot (200, 330) -> Knee -> Hip */}
            <path
              d={`M 200 330 L ${kneeX} ${kneeY} L ${hipX} ${hipY}`}
              stroke="#0f172a"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={`M 200 330 L ${kneeX} ${kneeY} L ${hipX} ${hipY}`}
              stroke="#334155"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Target Muscle: Quads (Kvadritseps) & Glutes - Neon Orange/Red */}
            {showAnatomicalGlow && (
              <>
                {/* Gluteus Maximus Highlight */}
                <circle
                  cx={hipX - 6}
                  cy={hipY}
                  r="17"
                  fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'}
                  opacity={0.88}
                  className="filter drop-shadow-[0_0_12px_#ff5500]"
                />
                {/* Quadriceps Femoris Highlight */}
                <ellipse
                  cx={kneeX - 16}
                  cy={kneeY - 18}
                  rx="14"
                  ry="9"
                  fill="#ccff00"
                  opacity={0.85}
                  className="filter drop-shadow-[0_0_10px_#ccff00]"
                />
              </>
            )}

            {/* Secondary Muscle: Core / Lower back - Light Cyan */}
            {showAnatomicalGlow && (
              <rect
                x={hipX + 5}
                y={hipY - 26}
                width="14"
                height="22"
                rx="4"
                fill="#38bdf8"
                opacity={0.7}
                className="filter drop-shadow-[0_0_8px_#38bdf8]"
              />
            )}

            {/* Torso with compression suit aesthetic */}
            <line x1={hipX} y1={hipY} x2={torsoAngleX} y2={barY + 16} stroke="#0f172a" strokeWidth="22" strokeLinecap="round" />
            <line x1={hipX} y1={hipY} x2={torsoAngleX} y2={barY + 16} stroke="#475569" strokeWidth="15" strokeLinecap="round" />
            {/* Rim light highlight along spine */}
            <line x1={hipX - 6} y1={hipY} x2={torsoAngleX - 6} y2={barY + 16} stroke="#e2e8f0" strokeWidth="2" opacity="0.8" strokeLinecap="round" />

            {/* Head */}
            <circle cx={torsoAngleX + 4} cy={barY - 4} r="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />

            {/* Barbell resting on Upper Traps */}
            <line x1="60" y1={barY} x2="300" y2={barY} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
            <rect x="70" y={barY - 34} width="12" height="68" rx="3" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="84" y={barY - 28} width="8" height="56" rx="2" fill="#3b82f6" />
            <rect x="274" y={barY - 34} width="12" height="68" rx="3" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="264" y={barY - 28} width="8" height="56" rx="2" fill="#3b82f6" />
          </g>
        );
      }

      case 'deadlift': {
        // Deadlift: Standing up (displacement=1) vs Bottom setup (displacement=0)
        const lift = displacement;
        const hipX = 140 + lift * 25;
        const hipY = 230 - lift * 55;
        const barY = 245 - lift * 105;
        const shoulderX = 175 + lift * 5;
        const shoulderY = 175 - lift * 45;

        return (
          <g>
            <line x1="30" y1="330" x2="330" y2="330" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            {/* Legs */}
            <path d={`M 195 330 L 190 260 L ${hipX} ${hipY}`} stroke="#0f172a" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={`M 195 330 L 190 260 L ${hipX} ${hipY}`} stroke="#475569" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Target Muscle: Hamstring, Glutes & Erector Spinae - Neon Fire Glow */}
            {showAnatomicalGlow && (
              <>
                <circle cx={hipX} cy={hipY} r="18" fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'} opacity={0.9} className="filter drop-shadow-[0_0_12px_#ff5500]" />
                <line x1={hipX + 2} y1={hipY} x2={shoulderX - 2} y2={shoulderY} stroke="#ccff00" strokeWidth="10" opacity={0.8} strokeLinecap="round" className="filter drop-shadow-[0_0_8px_#ccff00]" />
              </>
            )}

            {/* Torso */}
            <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
            <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#64748b" strokeWidth="16" strokeLinecap="round" />
            <circle cx={shoulderX + 4} cy={shoulderY - 20} r="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />

            {/* Arms hanging straight down */}
            <line x1={shoulderX} y1={shoulderY} x2={175} y2={barY} stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />

            {/* Barbell */}
            <line x1="50" y1={barY} x2="300" y2={barY} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
            <rect x="65" y={barY - 34} width="12" height="68" rx="3" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="275" y={barY - 34} width="12" height="68" rx="3" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
          </g>
        );
      }

      case 'lat_pulldown': {
        // Lat pulldown: Bar pulled from 95 to 175
        const barY = 95 + displacement * 80;
        const elbowX = 135 + displacement * 15;
        const elbowY = 130 + displacement * 40;

        return (
          <g>
            {/* Machine Lat Pulldown Station */}
            <rect x="80" y="270" width="200" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" />
            <rect x="175" y="40" width="10" height="230" fill="#0f172a" />
            {/* Overhead Pulley */}
            <circle cx="180" cy="50" r="14" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="180" y1="50" x2="180" y2={barY} stroke="#94a3b8" strokeWidth="3" />

            {/* Athlete seated */}
            <circle cx="180" cy="165" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <line x1="180" y1="180" x2="180" y2="270" stroke="#0f172a" strokeWidth="24" strokeLinecap="round" />
            <line x1="180" y1="180" x2="180" y2="270" stroke="#475569" strokeWidth="16" strokeLinecap="round" />

            {/* Target Muscle: Latissimus Dorsi (Qanot mushaklari) - Neon Fire / Orange */}
            {showAnatomicalGlow && (
              <path
                d="M 166 185 Q 152 215 168 245 L 180 245 L 180 185 Z"
                fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'}
                opacity={0.88}
                className="filter drop-shadow-[0_0_12px_#ff5500]"
              />
            )}
            {showAnatomicalGlow && (
              <path
                d="M 194 185 Q 208 215 192 245 L 180 245 L 180 185 Z"
                fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'}
                opacity={0.88}
                className="filter drop-shadow-[0_0_12px_#ff5500]"
              />
            )}

            {/* Arms pulling wide bar */}
            <path d={`M 180 180 L ${elbowX} ${elbowY} L 105 ${barY}`} stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d={`M 180 180 L ${360 - elbowX} ${elbowY} L 255 ${barY}`} stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round" fill="none" />

            {/* Wide Lat Bar */}
            <path d={`M 85 ${barY + 6} Q 180 ${barY} 275 ${barY + 6}`} stroke="#f8fafc" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>
        );
      }

      case 'bicep_curl': {
        // Bicep curl: Forearm rotates upward from 235 to 155
        const handX = 220 - displacement * 25;
        const handY = 245 - displacement * 90;
        const elbowX = 195;
        const elbowY = 225;

        return (
          <g>
            <line x1="40" y1="330" x2="320" y2="330" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            {/* Athlete Standing Silhouette */}
            <circle cx="170" cy="115" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            {/* Torso */}
            <line x1="170" y1="130" x2="170" y2="240" stroke="#0f172a" strokeWidth="24" strokeLinecap="round" />
            <line x1="170" y1="130" x2="170" y2="240" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
            <line x1="168" y1="240" x2="168" y2="330" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

            {/* Target Muscle: Biceps Brachii - Peak Squeeze Glow */}
            {showAnatomicalGlow && (
              <ellipse
                cx="186"
                cy="185"
                rx={9 + displacement * 4}
                ry={12 + displacement * 4}
                fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'}
                opacity={0.92}
                className="filter drop-shadow-[0_0_12px_#ff5500]"
              />
            )}

            {/* Upper Arm and Forearm */}
            <line x1="175" y1="140" x2={elbowX} y2={elbowY} stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />

            {/* Dumbbell */}
            <line x1={handX - 18} y1={handY} x2={handX + 18} y2={handY} stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
            <rect x={handX - 22} y={handY - 14} width="7" height="28" rx="2" fill="#38bdf8" />
            <rect x={handX + 15} y={handY - 14} width="7" height="28" rx="2" fill="#38bdf8" />
          </g>
        );
      }

      default: {
        // Default biomechanical movement (Shoulder Press / Bodyweight)
        const weightY = 185 - displacement * 80;
        return (
          <g>
            <line x1="40" y1="330" x2="320" y2="330" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="180" cy="120" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <line x1="180" y1="135" x2="180" y2="245" stroke="#0f172a" strokeWidth="24" strokeLinecap="round" />
            <line x1="180" y1="135" x2="180" y2="245" stroke="#475569" strokeWidth="16" strokeLinecap="round" />
            <line x1="180" y1="245" x2="180" y2="330" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

            {/* Target Muscle: Deltoids / Target Muscles */}
            {showAnatomicalGlow && (
              <>
                <circle cx="158" cy="148" r="12" fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'} opacity={0.9} className="filter drop-shadow-[0_0_10px_#ff5500]" />
                <circle cx="202" cy="148" r="12" fill={currentPhase === 'peak' ? '#ff3b30' : '#ff5500'} opacity={0.9} className="filter drop-shadow-[0_0_10px_#ff5500]" />
              </>
            )}

            {/* Arms lifting weight */}
            <path d={`M 160 148 L 145 ${weightY + 25} L 155 ${weightY}`} stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d={`M 200 148 L 215 ${weightY + 25} L 205 ${weightY}`} stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round" fill="none" />
            <line x1="110" y1={weightY} x2="250" y2={weightY} stroke="#f8fafc" strokeWidth="7" strokeLinecap="round" />
          </g>
        );
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#0B0F17] shadow-2xl flex flex-col justify-between select-none ${
        compact ? 'h-[270px]' : 'h-[380px] md:h-[440px]'
      }`}
    >
      {/* 1. TOP OVERLAY: Camera Angle, Video/Biomechanics Toggle & Resolution */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Camera Angle Badge (TZ Section 2) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#121824]/90 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow-md">
            <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>
              {cameraAngle === 'side_90'
                ? 'Side View (90°)'
                : cameraAngle === 'three_quarter_45'
                ? 'Three-Quarter (45°)'
                : 'Front View (0°)'}
            </span>
          </div>

          {/* 60fps & Aspect Ratio Badge (TZ Section 5) */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-mono font-bold text-[#ccff00]">
            <span>60 FPS</span>
            <span className="text-slate-600">•</span>
            <span>1:1</span>
          </div>
        </div>

        {/* Mode Selector & Visual Overlay Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Motion Path Toggle */}
          <button
            onClick={() => setShowMotionPath(!showMotionPath)}
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              showMotionPath
                ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Harakat trayektoriyasi yo'lini ko'rsatish"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {/* Anatomical Highlight Toggle */}
          <button
            onClick={() => setShowAnatomicalGlow(!showAnatomicalGlow)}
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              showAnatomicalGlow
                ? 'bg-[#ff5500]/20 border-[#ff5500] text-[#ff5500]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Mushak ta'kidlash (Anatomical Highlight)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Video / 3D Kinematics Switcher */}
          {videoLoopUrl && (
            <div className="p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center">
              <button
                onClick={() => setMode('biomechanical')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  mode === 'biomechanical'
                    ? 'bg-[#ccff00] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kinematika
              </button>
              <button
                onClick={() => setMode('video')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 ${
                  mode === 'video'
                    ? 'bg-[#ccff00] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <VideoIcon className="w-3 h-3" /> Video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. REAL-TIME PHASE & BREATHING INDICATOR (TZ Section 3 & 4) */}
      <div className="absolute top-12 left-3 z-30">
        <div className="flex flex-col gap-1.5">
          {/* Phase Badge */}
          <div
            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all ${
              currentPhase === 'concentric'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                : currentPhase === 'peak'
                ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-red-500/20 animate-pulse'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sky-500/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>
              {currentPhase === 'concentric'
                ? 'Konsentrik (Ko‘tarish • 1.2s)'
                : currentPhase === 'peak'
                ? 'Pik qisqarish (Pauza • 0.5s)'
                : 'Ekssentrik (Tushirish • 2.0s)'}
            </span>
          </div>

          {/* Breathing Indicator (TZ Section 4) */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 shadow-md">
            <Wind className="w-3.5 h-3.5 text-[#ccff00]" />
            {currentPhase === 'concentric' ? (
              <span className="text-[#ff5500]">💨 Nafas chiqarish (Exhale)</span>
            ) : currentPhase === 'peak' ? (
              <span className="text-[#ccff00]">⚡ Ushlab turish (Hold)</span>
            ) : (
              <span className="text-sky-400">🫁 Nafas olish (Inhale)</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN DISPLAY CANVAS / VIDEO ELEMENT (TZ Section 6 HTML5 Standard) */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0B0F17]">
        {mode === 'video' && videoLoopUrl ? (
          <div className="w-full h-full relative bg-[#0B0F17] flex items-center justify-center p-1">
            {videoLoopUrl.endsWith('.gif') ? (
              <img
                src={videoLoopUrl}
                alt={titleUz}
                loading="lazy"
                onError={() => setMode('biomechanical')}
                className="w-full h-full object-contain filter contrast-105 rounded-2xl select-none"
              />
            ) : (
              /* HTML5 Video Standard compliant with TZ Section 6 */
              <video
                ref={videoRef}
                src={videoLoopUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onLoadedData={() => setVideoLoaded(true)}
                onError={() => setMode('biomechanical')}
                className="w-full h-full object-cover"
              >
                {videoMp4Url && <source src={videoMp4Url} type="video/mp4" />}
                <source src={videoLoopUrl} type="video/webm" />
              </video>
            )}
          </div>
        ) : (
          /* SVG Kinematic Vector Mesh with Studio Lighting & Rim Lights */
          <svg
            viewBox="0 0 360 360"
            className="w-full h-full max-h-full transition-transform duration-75 select-none"
          >
            <defs>
              {/* Neutral Dark Athletic Studio Gradient (#0B0F17 to #121824) */}
              <linearGradient id="studioBackdrop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B0F17" />
                <stop offset="100%" stopColor="#121824" />
              </linearGradient>

              {/* Rim Lighting (Konturli yorug'lik) Radial Glow */}
              <radialGradient id="rimLightingGlow" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
                <stop offset="60%" stopColor="#1e293b" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#0B0F17" stopOpacity="0" />
              </radialGradient>

              {/* Studio Grid Floor */}
              <pattern id="studioGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.6" opacity="0.3" />
              </pattern>
            </defs>

            {/* Dark Neutral Studio Background */}
            <rect width="360" height="360" fill="url(#studioBackdrop)" />
            <rect width="360" height="360" fill="url(#studioGrid)" />
            <circle cx="180" cy="180" r="150" fill="url(#rimLightingGlow)" />

            {/* Motion Trajectory Guide Path (TZ Section 4) */}
            {showMotionPath && (
              <g opacity="0.85">
                {/* Thin Trajectory Vector Line */}
                <line
                  x1={pathData.x1}
                  y1={pathData.y1}
                  x2={pathData.x2}
                  y2={pathData.y2}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                {/* Dynamic Tracker Particle */}
                <circle
                  cx={pathData.x1}
                  cy={pathData.currentY}
                  r="5"
                  fill="#ccff00"
                  className="filter drop-shadow-[0_0_8px_#ccff00]"
                />
                <circle cx={pathData.x1} cy={pathData.currentY} r="9" stroke="#ccff00" strokeWidth="1" fill="none" opacity="0.5" />
              </g>
            )}

            {/* 60fps Kinematic Rig & Humanoid Weights */}
            {renderBiomechanicKinematics()}
          </svg>
        )}
      </div>

      {/* 4. BOTTOM FLOATING CONTROLS & MUSCLE CHIPS */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800/90 shadow-xl">
        {/* Play/Pause & Speed Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title={isPlaying ? "To'xtatish" : 'Boshlash'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#ccff00]" />}
          </button>

          <button
            onClick={() => setSpeed(speed === 1 ? 0.75 : speed === 0.75 ? 1.25 : 1)}
            className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="Harakat tezligini o'zgartirish"
          >
            {speed}x
          </button>

          {/* Seamless Loop Progress Ring */}
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-[#ccff00] to-[#38bdf8] transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Anatomical Working Muscles Labels */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55%] scrollbar-none">
          {primaryMuscles.map((muscle, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 whitespace-nowrap"
            >
              <Zap className="w-2.5 h-2.5" />
              {muscle}
            </span>
          ))}
          {secondaryMuscles.slice(0, 1).map((sec, idx) => (
            <span
              key={idx}
              className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 whitespace-nowrap"
            >
              {sec}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
