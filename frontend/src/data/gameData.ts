import { ToolInfo } from '@/types';

export const TOOLS: Record<string, ToolInfo> = {
  aac: { icon: 'FaTabletScreenButton', name: 'AAC 태블릿', color: 'tool-blue', desc: 'AAC(보완대체의사소통) 태블릿은 말로 소통이 어려운 친구가 그림이나 기호로 자기 생각을 표현할 수 있게 도와주는 도구예요.' },
  headset: { icon: 'FaHeadphones', name: '노이즈 캔슬링 헤드셋', color: 'tool-purple', desc: '소리에 매우 예민한 친구에게 시끄러운 소리를 줄여주는 헤드셋이에요. 갑작스러운 큰 소리로 힘들어하는 친구를 도울 수 있어요.' },
  timer: { icon: 'FaHourglassHalf', name: '비주얼 타이머', color: 'tool-amber', desc: '시간을 눈으로 볼 수 있는 타이머예요. 활동이 끝나는 시간을 미리 알 수 있어서 변화를 준비할 수 있게 도와줘요.' },
  squishy: { icon: 'FaHandSparkles', name: '말랑이 (Fidget Toy)', color: 'tool-pink', desc: '말랑말랑한 장난감이에요. 불안하거나 초조할 때 손으로 주물럭거리면 마음이 차분해져요.' },
  pecs: { icon: 'FaImages', name: 'PECS 카드', color: 'tool-green', desc: 'PECS(그림교환 의사소통)는 그림 카드를 교환하며 의사소통하는 방법이에요.' },
};

export const STAGE_NAMES: Record<string, string> = {
  mode_select: '모드 선택',
  prologue: 'Prologue',
  'stage-1': '🦜 1단계: 앵무새의 숲',
  'stage-2': '💥 2단계: 폭탄이 터졌다!',
  'stage-3': '🚂 3단계: 기차는 멈추지 않아',
  'stage-4': '🧩 4단계: 사라진 퍼즐 조각',
  'stage-5': '🌲 5단계: 갈림길의 기억',
  'stage-6': '🔬 6단계: 프리즘 연구소',
  encyclopedia: '도감',
  low_intro: '새싹 요원',
  low_stage1: '먼저 물어봐주기',
  low_stage2: '귀가 아파요',
  low_stage3: '기다려주기',
  low_stage4: '쉽게 말해주기',
  low_ending: '수료증 발급',
};

export const HIGH_STAGES = [
  { id: 'stage-1', title: '앵무새의 숲', subtitle: '반향어 & 소통', emoji: '🦜' },
  { id: 'stage-2', title: '폭탄이 터졌다!', subtitle: '감각 과부하 & 조절', emoji: '💥' },
  { id: 'stage-3', title: '기차는 멈추지 않아', subtitle: '전이 & 감각 조절', emoji: '🚂' },
  { id: 'stage-4', title: '사라진 퍼즐 조각', subtitle: '강점 & 주체성', emoji: '🧩' },
  { id: 'stage-5', title: '갈림길의 기억', subtitle: '통합 & 신뢰', emoji: '🌲' },
  { id: 'stage-6', title: '프리즘 연구소', subtitle: 'AI 회고 & 공유', emoji: '🔬', locked: true },
];
