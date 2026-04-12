// Asset maps using public directory paths (Next.js serves from /public)
// All file names below match the actual files in /public/assets/* exactly.
// (Background-removed sprites use sanitized names with underscores in place of
// parentheses and spaces; newer landmark / scene images keep their richer names.)

// NPC Images (High Grade — Hidden Piece)
export const NPC_IMAGES = {
  female: {
    default: '/assets/hiddenpiece/1_CH1_승주_여__기본_정면.png',
    anxious: '/assets/hiddenpiece/1_CH2_승주_여__불안_회피.png',
    pain: '/assets/hiddenpiece/1_CH3_승주_여__고통_귀막음.png',
    calm: '/assets/hiddenpiece/1_CH4_승주_여__편안.png',
    // Note: female "tantrum" (CH5 떼쓰기) is not provided — helper falls back to anxious.
    memory: '/assets/hiddenpiece/1_CH6_승주_여__기억.png',
    discover: '/assets/hiddenpiece/1_CH7_승주_여__지적_발견.png',
    happy: '/assets/hiddenpiece/1_CH8_승주_여__행복.png',
  },
  male: {
    default: '/assets/hiddenpiece/2_CH1_성민_남__기본_정면.png',
    anxious: '/assets/hiddenpiece/2_CH2_성민_남__불안_회피.png',
    pain: '/assets/hiddenpiece/2_CH3_성민_남__고통_귀막음.png',
    calm: '/assets/hiddenpiece/2_CH4_성민_남__편안.png',
    tantrum: '/assets/hiddenpiece/2_CH5_성민_남__떼쓰기.png',
    memory: '/assets/hiddenpiece/2_CH6_성민_남__기억.png',
    discover: '/assets/hiddenpiece/2_CH7_성민_남__지적_발견.png',
    happy: '/assets/hiddenpiece/2_CH8_성민_남__행복.png',
  },
} as const;

export const PLAYER_IMAGES = {
  male: {
    back: '/assets/hiddenpiece/3_CH1_나_남__뒷모습.png',
    surprised: '/assets/hiddenpiece/3_CH2_나_남__놀람_당황.png',
    thinking: '/assets/hiddenpiece/3_CH3_나_남__고민.png',
    talk: '/assets/hiddenpiece/3_CH4_나_남__대화.png',
  },
  female: {
    back: '/assets/hiddenpiece/4_CH1_나_여__뒷모습.png',
    surprised: '/assets/hiddenpiece/4_CH2_나_여__놀람_당황.png',
    thinking: '/assets/hiddenpiece/4_CH3_나_여__고민.png',
    talk: '/assets/hiddenpiece/4_CH4_나_여__대화.png',
  },
} as const;

// Peer / classmate sprites (high grade)
export const PEER_IMAGES = {
  // 또래 친구 A — 남자 (Stage 1, 2, 4 등에서 등장)
  peerA_male: {
    default: '/assets/hiddenpiece/또래_친구_A__남__-_기본.png',
    annoyed: '/assets/hiddenpiece/또래_친구_A__남__-_짜증불편__Stage_1__2__4.png',
    sorry: '/assets/hiddenpiece/또래_친구_A__남__-_미안__Stage_4_사과_장면.png',
  },
  // 또래 친구 B — 여자 (Stage 4 등)
  peerB_female: {
    default: '/assets/hiddenpiece/또래_친구_B__여__-_기본.png',
    annoyed: '/assets/hiddenpiece/또래_친구_B__여__-_짜증__Stage_4.png',
  },
} as const;

// 다수결 압박을 표현하는 친구 무리 (Stage 5)
export const GROUP_PRESSURE_IMAGE =
  '/assets/hiddenpiece/친구_무리__Stage_5_다수결_압박__-_3_4명이_한_방향을_가리킴.png';

export const BG_IMAGES = {
  classroom: '/assets/hiddenpiece/5_CH1_배경_교실.png',
  dataworld: '/assets/hiddenpiece/5_CH2_배경_데이터세상.png',
  breaktime: '/assets/hiddenpiece/5_CH3_배경_쉬는시간.png',
  cafeteria: '/assets/hiddenpiece/5_CH4_배경_급식실.png',
  noise: '/assets/hiddenpiece/5_CH5_배경_소음.png',
  playground: '/assets/hiddenpiece/5_CH6_배경_운동장.png',
  ktx: '/assets/hiddenpiece/5_CH7_배경_KTX.png',
  sciencelab: '/assets/hiddenpiece/5_CH8_배경_미술실.png',
  crossroads: '/assets/hiddenpiece/5_CH9_배경_갈림길.png',
  map: '/assets/hiddenpiece/5_CH10_배경_안내도.png',
  exit: '/assets/hiddenpiece/5_CH11_배경_출구.png',
  // 새 누적 배경
  highMap: '/assets/hiddenpiece/고학년 미션 월드맵 배경 (169, 6개 랜드마크 자리 분포).png',
  foggyForest: '/assets/hiddenpiece/Stage 5 - 안개 낀 숲 갈림길 (인트로용).png',
  deadEnd: '/assets/hiddenpiece/Stage 5 - 막다른 길 (오답 루트, 선택).png',
  // Stage 3: 운동장 모래에 그려진 지하철 노선도 — 승주의 특별 관심사 장면 배경
  sandPlayground: '/assets/hiddenpiece/Stage_3_-_운동장_모래에_그려진_지하철_노선도__선택.png',
} as const;

// 고학년 월드맵 노드 (랜드마크 일러스트)
export const STAGE_NODE_IMAGES: Record<string, string> = {
  'stage-1': '/assets/hiddenpiece/1단계_노드_-_앵무새_트리하우스.png',
  'stage-2': '/assets/hiddenpiece/2단계_노드_-_화산_급식소.png',
  'stage-3': '/assets/hiddenpiece/3단계_노드_-_작은_기차역.png',
  'stage-4': '/assets/hiddenpiece/4단계_노드_-_모자이크_탑.png',
  'stage-5': '/assets/hiddenpiece/5단계_노드_-_갈림길_표지판.png',
  'stage-6': '/assets/hiddenpiece/6단계_노드_-_빛나는_연구소__잠금_가능.png',
};

// UI overlay assets
export const LOCK_OVERLAY_IMAGE = '/assets/hiddenpiece/잠금_오버레이_-_자물쇠와_사슬__선택.png';
export const COMPLETE_BADGE_IMAGE = '/assets/hiddenpiece/완료_도장배지__선택.png';

// 단계별 배지 이미지 (미션 완료 시 팝업, 월드맵 완료 표시, 결과 카드에 사용)
export const BADGE_IMAGES: Record<string, { src: string; label: string }> = {
  'stage-1': { src: '/assets/hiddenpiece/badge_소통.png', label: '소통의 배지' },
  'stage-2': { src: '/assets/hiddenpiece/badge_배려.png', label: '배려의 방패' },
  'stage-3': { src: '/assets/hiddenpiece/badge_약속.png', label: '약속의 시계' },
  'stage-4': { src: '/assets/hiddenpiece/badge_강점.png', label: '강점의 전구' },
  'stage-5': { src: '/assets/hiddenpiece/badge_신뢰.png', label: '신뢰의 리본' },
  'stage-6': { src: '/assets/hiddenpiece/badge_완성.png', label: '히든피스 완성' },
};

// PECS 카드 이미지 (Stage 4 미니게임)
export const PECS_CARD_IMAGES = {
  me: '/assets/hiddenpiece/pecs_나.png',
  canDo: '/assets/hiddenpiece/pecs_할수있어.png',
  puzzle: '/assets/hiddenpiece/pecs_퍼즐.png',
} as const;

// AAC 태블릿 선택지 이미지 (Stage 1 미니게임)
export const AAC_CHOICE_IMAGES = {
  crayon: '/assets/hiddenpiece/aac_크레파스.png',
  book: '/assets/hiddenpiece/aac_책.png',
  apple: '/assets/hiddenpiece/aac_사과.png',
  scissors: '/assets/hiddenpiece/aac_가위.png',
} as const;

export const ITEM_IMAGES = {
  aac: '/assets/hiddenpiece/6_CH1_아이템_AAC.png',
  headset: '/assets/hiddenpiece/6_CH2_아이템_헤드셋.png',
  timer: '/assets/hiddenpiece/6_CH3_아이템_타이머.png',
  pecs: '/assets/hiddenpiece/6_CH4_아이템_PECS.png',
  squishy: '/assets/hiddenpiece/6_CH5_아이템_말랑이.png',
  map: '/assets/hiddenpiece/6_CH6_아이템_지도.png',
  ribbon: '/assets/hiddenpiece/6_CH7_아이템_리본.png',
  bulb: '/assets/hiddenpiece/6_CH8_아이템_전구.png',
  // 새 누적 아이템
  yellowCrayon: '/assets/hiddenpiece/Stage_1_-_노란_크레파스__선택.png',
  subwayMapItem: '/assets/hiddenpiece/Stage 3 - 지하철 노선도 아이템 (선택).png',
} as const;

// UI Icon Images — 저작권 보호를 위해 기존의 react-icons 대신
// 자체 생성 이미지를 사용합니다. 모두 /public/assets/icons/ 아래에 위치합니다.
// (나노바나나 등으로 생성한 PNG를 같은 파일명으로 추가하면 자동 반영됩니다.)
export const ICON_IMAGES = {
  // 내비게이션 / 시스템
  home: '/assets/icons/home.png',
  back: '/assets/icons/back.png',
  map: '/assets/icons/map.png',
  expand: '/assets/icons/expand.png',
  volumeOn: '/assets/icons/volume_on.png',
  volumeOff: '/assets/icons/volume_off.png',
  users: '/assets/icons/users.png',
  logout: '/assets/icons/logout.png',
  refresh: '/assets/icons/refresh.png',
  // 관리자
  shield: '/assets/icons/shield.png',
  trash: '/assets/icons/trash.png',
  key: '/assets/icons/key.png',
  close: '/assets/icons/close.png',
  copy: '/assets/icons/copy.png',
  download: '/assets/icons/download.png',
  // HUD / 게임 상태
  heart: '/assets/icons/heart.png',
  star: '/assets/icons/star.png',
  clock: '/assets/icons/clock.png',
  // 모드 선택
  seedling: '/assets/icons/seedling.png',
  hiddenpiece: '/assets/icons/hiddenpiece.png',
} as const;

// Low Grade (Sprout)
export const LOW_NPC_IMAGES = {
  female: {
    default: '/assets/sprout/1_CH1_승주_저_여__기본_정면.png',
    upset: '/assets/sprout/1_CH2_승주_저_여__속상.png',
    earblock: '/assets/sprout/1_CH3_승주_저_여__귀막음.png',
    happy: '/assets/sprout/1_CH4_승주_저_여__기분_좋음.png',
    happy2: '/assets/sprout/1_CH4_승주_저_여__기분_좋음2.png',
  },
  male: {
    default: '/assets/sprout/2_CH1_성민_저_남__기본_정면.png',
    upset: '/assets/sprout/2_CH2_성민_저_남__속상.png',
    earblock: '/assets/sprout/2_CH3_성민_저_남__귀막음.png',
    happy: '/assets/sprout/2_CH4_성민_저_남__기분_좋음.png',
    happy2: '/assets/sprout/2_CH4_성민_저_남__기분_좋음2.png',
  },
} as const;

// 저학년 음성 나레이션 (타입캐스트 녹음 — NPC 이름 대신 "친구" 사용)
export const LOW_VOICE = {
  ep1_intro: '/assets/sprout/voice_ep1_intro.mp3',
  ep1_complete: '/assets/sprout/voice_ep1_complete.mp3',
  ep2_intro: '/assets/sprout/voice_ep2_intro.mp3',
  ep2_complete: '/assets/sprout/voice_ep2_complete.mp3',
  ep3_intro: '/assets/sprout/voice_ep3_intro.mp3',
  ep3_complete: '/assets/sprout/voice_ep3_complete.mp3',
  ep4_card: '/assets/sprout/voice_ep4_card.mp3',
  ep4_squishy: '/assets/sprout/voice_ep4_squishy.mp3',
  ep4_complete: '/assets/sprout/voice_ep4_complete.mp3',
  ending_intro: '/assets/sprout/voice_ending_intro.mp3',
  ending_cert: '/assets/sprout/voice_ending_cert.mp3',
} as const;

export const LOW_BG_IMAGES = {
  intro: '/assets/sprout/3_BG_intro.png',
  stages: '/assets/sprout/3_BG1,BG2,BG3,BG4.png',
  ending: '/assets/sprout/3_BG_ending.png',
} as const;

// Helper functions
type Gender = 'male' | 'female';

export function getNpcImage(gender: Gender, emotion: string = 'default'): string {
  const images = NPC_IMAGES[gender] || NPC_IMAGES.female;
  const lookup = images as Record<string, string>;
  // Female does not currently have a "tantrum" sprite — fall back to anxious.
  if (gender === 'female' && emotion === 'tantrum') {
    return lookup.anxious || lookup.default;
  }
  return lookup[emotion] || lookup.default;
}

export function getPlayerImage(gender: Gender, pose: string = 'talk'): string {
  const images = PLAYER_IMAGES[gender] || PLAYER_IMAGES.male;
  return (images as Record<string, string>)[pose] || images.talk;
}

export function getLowNpcImage(gender: Gender, emotion: string = 'default'): string {
  const images = LOW_NPC_IMAGES[gender] || LOW_NPC_IMAGES.female;
  return (images as Record<string, string>)[emotion] || images.default;
}
