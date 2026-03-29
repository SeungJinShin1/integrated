// Asset maps using public directory paths (Next.js serves from /public)
// NPC Images (High Grade - Prism)
export const NPC_IMAGES = {
  female: {
    default: '/assets/prism/1_CH1_승주(여)_기본 정면.png',
    anxious: '/assets/prism/1_CH2_승주(여)_불안,회피.png',
    pain: '/assets/prism/1_CH3_승주(여)_고통(귀막음).png',
    calm: '/assets/prism/1_CH4_승주(여)_편안.png',
    tantrum: '/assets/prism/1_CH5_승주(여)_떼쓰기.png',
    memory: '/assets/prism/1_CH6_승주(여)_기억.png',
    discover: '/assets/prism/1_CH7_승주(여)_지적(발견).png',
    happy: '/assets/prism/1_CH8_승주(여)_행복.png',
  },
  male: {
    default: '/assets/prism/2_CH1_성민(남)_기본 정면.png',
    anxious: '/assets/prism/2_CH2_성민(남)_불안,회피.png',
    pain: '/assets/prism/2_CH3_성민(남)_고통(귀막음).png',
    calm: '/assets/prism/2_CH4_성민(남)_편안.png',
    tantrum: '/assets/prism/2_CH5_성민(남)_떼쓰기.png',
    memory: '/assets/prism/2_CH6_성민(남)_기억.png',
    discover: '/assets/prism/2_CH7_성민(남)_지적(발견).png',
    happy: '/assets/prism/2_CH8_성민(남)_행복.png',
  },
} as const;

export const PLAYER_IMAGES = {
  male: {
    back: '/assets/prism/3_CH1_나(남)_뒷모습.png',
    surprised: '/assets/prism/3_CH2_나(남)_놀람,당황.png',
    thinking: '/assets/prism/3_CH3_나(남)_고민.png',
    talk: '/assets/prism/3_CH4_나(남)_대화.png',
  },
  female: {
    back: '/assets/prism/4_CH1_나(여)_뒷모습.png',
    surprised: '/assets/prism/4_CH2_나(여)_놀람,당황.png',
    thinking: '/assets/prism/4_CH3_나(여)_고민.png',
    talk: '/assets/prism/4_CH4_나(여)_대화.png',
  },
} as const;

export const BG_IMAGES = {
  classroom: '/assets/prism/5_CH1_배경_교실.png',
  dataworld: '/assets/prism/5_CH2_배경_데이터세상.png',
  breaktime: '/assets/prism/5_CH3_배경_쉬는시간.png',
  cafeteria: '/assets/prism/5_CH4_배경_급식실.png',
  noise: '/assets/prism/5_CH5_배경_소음.png',
  playground: '/assets/prism/5_CH6_배경_운동장.png',
  ktx: '/assets/prism/5_CH7_배경_KTX.png',
  sciencelab: '/assets/prism/5_CH8_배경_미술실.png',
  crossroads: '/assets/prism/5_CH9_배경_갈림길.png',
  map: '/assets/prism/5_CH10_배경_안내도.png',
  exit: '/assets/prism/5_CH11_배경_출구.png',
} as const;

export const ITEM_IMAGES = {
  aac: '/assets/prism/6_CH1_아이템_AAC.png',
  headset: '/assets/prism/6_CH2_아이템_헤드셋.png',
  timer: '/assets/prism/6_CH3_아이템_타이머.png',
  pecs: '/assets/prism/6_CH4_아이템_PECS.png',
  squishy: '/assets/prism/6_CH5_아이템_말랑이.png',
  map: '/assets/prism/6_CH6_아이템_지도.png',
  ribbon: '/assets/prism/6_CH7_아이템_리본.png',
  bulb: '/assets/prism/6_CH8_아이템_전구.png',
} as const;

// Low Grade (Sprout)
export const LOW_NPC_IMAGES = {
  female: {
    default: '/assets/sprout/1_CH1_승주(저_여)_기본_정면.png',
    upset: '/assets/sprout/1_CH2_승주(저_여)_속상.png',
    earblock: '/assets/sprout/1_CH3_승주(저_여)_귀막음.png',
    happy: '/assets/sprout/1_CH4_승주(저_여)_기분_좋음.png',
    happy2: '/assets/sprout/1_CH4_승주(저_여)_기분_좋음2.png',
  },
  male: {
    default: '/assets/sprout/2_CH1_성민(저_남)_기본_정면.png',
    upset: '/assets/sprout/2_CH2_성민(저_남)_속상.png',
    earblock: '/assets/sprout/2_CH3_성민(저_남)_귀막음.png',
    happy: '/assets/sprout/2_CH4_성민(저_남)_기분_좋음.png',
    happy2: '/assets/sprout/2_CH4_성민(저_남)_기분_좋음2.png',
  },
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
  return (images as Record<string, string>)[emotion] || images.default;
}

export function getPlayerImage(gender: Gender, pose: string = 'talk'): string {
  const images = PLAYER_IMAGES[gender] || PLAYER_IMAGES.male;
  return (images as Record<string, string>)[pose] || images.talk;
}

export function getLowNpcImage(gender: Gender, emotion: string = 'default'): string {
  const images = LOW_NPC_IMAGES[gender] || LOW_NPC_IMAGES.female;
  return (images as Record<string, string>)[emotion] || images.default;
}
