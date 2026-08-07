import { ToolInfo } from '@/types';

// 도구 아이콘은 모두 자체 제작 PNG (ITEM_IMAGES) 키를 통해 표시합니다.
// color 는 팝업/배지의 강조 컬러로 직접 사용되는 CSS 값입니다.
export const TOOLS: Record<string, ToolInfo> = {
  aac: { iconKey: 'aac', name: 'AAC(보완대체의사소통) 태블릿', color: '#3b82f6', desc: 'AAC(보완대체의사소통) 태블릿은 말로 소통이 어려운 친구가 그림이나 기호로 자기 생각을 표현할 수 있게 도와주는 도구예요.' },
  headset: { iconKey: 'headset', name: '노이즈 캔슬링 헤드셋', color: '#a855f7', desc: '소리에 매우 예민한 친구에게 시끄러운 소리를 줄여주는 헤드셋이에요. 갑작스러운 큰 소리로 힘들어하는 친구를 도울 수 있어요.' },
  timer: { iconKey: 'timer', name: '비주얼 타이머', color: '#f59e0b', desc: '시간을 눈으로 볼 수 있는 타이머예요. 활동이 끝나는 시간을 미리 알 수 있어서 변화를 준비할 수 있게 도와줘요.' },
  squishy: { iconKey: 'squishy', name: '말랑이', color: '#ec4899', desc: '말랑말랑한 장난감이에요. 불안하거나 초조할 때 손으로 주물럭거리면 마음이 차분해져요.' },
  pecs: { iconKey: 'pecs', name: '의사소통 카드', color: '#22c55e', desc: '의사소통 카드는 그림으로 자기 마음을 표현할 수 있는 도구예요.' },
  map: { iconKey: 'map', name: '안내 지도', color: '#6366f1', desc: '여러 갈래 길이 있는 곳에서 방향을 잡을 수 있도록 돕는 지도예요. 친구가 길을 헤맬 때 함께 보며 결정할 수 있어요.' },
  ribbon: { iconKey: 'ribbon', name: '기억의 리본', color: '#f43f5e', desc: '함께 했던 소중한 순간을 떠올리게 해 주는 리본이에요. 친구를 믿고 기다릴 수 있도록 용기를 줘요.' },
  bulb: { iconKey: 'bulb', name: '반짝이는 전구', color: '#eab308', desc: '새로운 생각이 떠올랐을 때 친구와 나누는 아이디어 등불이에요. 서로의 강점을 비춰 줘요.' },
};

export const STAGE_NAMES: Record<string, string> = {
  mode_select: '모드 선택',
  prologue: 'Prologue',
  'stage-1': '1단계: 앵무새의 숲',
  'stage-2': '2단계: 폭탄이 터졌다!',
  'stage-3': '3단계: 기차는 멈추지 않아',
  'stage-4': '4단계: 사라진 퍼즐 조각',
  'stage-5': '5단계: 갈림길의 기억',
  'stage-6': '6단계: 빛나는 우리 반',
  encyclopedia: '도감',
  low_intro: '히든피스 새싹',
  low_stage1: '먼저 물어봐주기',
  low_stage2: '귀가 아파요',
  low_stage3: '기다려주기',
  low_stage4: '쉽게 말해주기',
  low_stage5: '다르게 놀아도 괜찮아',
  low_ending: '수료증 발급',
};

// 고학년 월드맵 랜드마크 목록. 이모지는 저작권 이슈로 제거했고, 지도 노드의 썸네일 일러스트(STAGE_NODE_IMAGES)가 시각적 아이덴티티를 담당합니다.
export const HIGH_STAGES = [
  { id: 'stage-1', title: '앵무새의 숲', subtitle: '반향어 & 소통' },
  { id: 'stage-2', title: '폭탄이 터졌다!', subtitle: '감각 과부하 & 조절' },
  { id: 'stage-3', title: '기차는 멈추지 않아', subtitle: '전이 & 감각 조절' },
  { id: 'stage-4', title: '사라진 퍼즐 조각', subtitle: '강점 & 주체성' },
  { id: 'stage-5', title: '갈림길의 기억', subtitle: '통합 & 신뢰' },
  { id: 'stage-6', title: '빛나는 우리 반', subtitle: '히든피스 완성', locked: true },
];
