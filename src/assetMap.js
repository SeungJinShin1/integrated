// 에셋 이미지 import
// 1_* = 특수학생(여/승주)
import npcF_default from './assets/1_CH1_승주(여)_기본 정면.png';
import npcF_anxious from './assets/1_CH2_승주(여)_불안,회피.png';
import npcF_pain from './assets/1_CH3_승주(여)_고통(귀막음).png';
import npcF_calm from './assets/1_CH4_승주(여)_편안.png';
import npcF_tantrum from './assets/1_CH5_승주(여)_떼쓰기.png';
import npcF_memory from './assets/1_CH6_승주(여)_기억.png';
import npcF_discover from './assets/1_CH7_승주(여)_지적(발견).png';
import npcF_happy from './assets/1_CH8_승주(여)_행복.png';

// 2_* = 특수학생(남/성민)
import npcM_default from './assets/2_CH1_성민(남)_기본 정면.png';
import npcM_anxious from './assets/2_CH2_성민(남)_불안,회피.png';
import npcM_pain from './assets/2_CH3_성민(남)_고통(귀막음).png';
import npcM_calm from './assets/2_CH4_성민(남)_편안.png';
import npcM_tantrum from './assets/2_CH5_성민(남)_떼쓰기.png';
import npcM_memory from './assets/2_CH6_성민(남)_기억.png';
import npcM_discover from './assets/2_CH7_성민(남)_지적(발견).png';
import npcM_happy from './assets/2_CH8_성민(남)_행복.png';

// 3_* = 나(남)
import playerM_back from './assets/3_CH1_나(남)_뒷모습.png';
import playerM_surprised from './assets/3_CH2_나(남)_놀람,당황.png';
import playerM_thinking from './assets/3_CH3_나(남)_고민.png';
import playerM_talk from './assets/3_CH4_나(남)_대화.png';

// 4_* = 나(여)
import playerF_back from './assets/4_CH1_나(여)_뒷모습.png';
import playerF_surprised from './assets/4_CH2_나(여)_놀람,당황.png';
import playerF_thinking from './assets/4_CH3_나(여)_고민.png';
import playerF_talk from './assets/4_CH4_나(여)_대화.png';

// 5_* = 배경 (16:9)
import bg_classroom from './assets/5_CH1_배경_교실.png';
import bg_dataworld from './assets/5_CH2_배경_데이터세상.png';
import bg_breaktime from './assets/5_CH3_배경_쉬는시간.png';
import bg_cafeteria from './assets/5_CH4_배경_급식실.png';
import bg_noise from './assets/5_CH5_배경_소음.png';
import bg_playground from './assets/5_CH6_배경_운동장.png';
import bg_ktx from './assets/5_CH7_배경_KTX.png';
import bg_sciencelab from './assets/5_CH8_배경_미술실.png';
import bg_crossroads from './assets/5_CH9_배경_갈림길.png';
import bg_map from './assets/5_CH10_배경_안내도.png';
import bg_exit from './assets/5_CH11_배경_출구.png';

// 6_* = 아이템 (1:1)
import item_aac from './assets/6_CH1_아이템_AAC.png';
import item_headset from './assets/6_CH2_아이템_헤드셋.png';
import item_timer from './assets/6_CH3_아이템_타이머.png';
import item_pecs from './assets/6_CH4_아이템_PECS.png';
import item_squishy from './assets/6_CH5_아이템_말랑이.png';
import item_map from './assets/6_CH6_아이템_지도.png';
import item_ribbon from './assets/6_CH7_아이템_리본.png';
import item_bulb from './assets/6_CH8_아이템_전구.png';

// NPC 이미지 맵 (성별별)
export const NPC_IMAGES = {
    female: {
        default: npcF_default,
        anxious: npcF_anxious,
        pain: npcF_pain,
        calm: npcF_calm,
        tantrum: npcF_tantrum,
        memory: npcF_memory,
        discover: npcF_discover,
        happy: npcF_happy,
    },
    male: {
        default: npcM_default,
        anxious: npcM_anxious,
        pain: npcM_pain,
        calm: npcM_calm,
        tantrum: npcM_tantrum,
        memory: npcM_memory,
        discover: npcM_discover,
        happy: npcM_happy,
    },
};

// 플레이어 이미지 맵 (성별별)
export const PLAYER_IMAGES = {
    male: {
        back: playerM_back,
        surprised: playerM_surprised,
        thinking: playerM_thinking,
        talk: playerM_talk,
    },
    female: {
        back: playerF_back,
        surprised: playerF_surprised,
        thinking: playerF_thinking,
        talk: playerF_talk,
    },
};

// 배경 이미지 맵
export const BG_IMAGES = {
    classroom: bg_classroom,
    dataworld: bg_dataworld,
    breaktime: bg_breaktime,
    cafeteria: bg_cafeteria,
    noise: bg_noise,
    playground: bg_playground,
    ktx: bg_ktx,
    sciencelab: bg_sciencelab,
    crossroads: bg_crossroads,
    map: bg_map,
    exit: bg_exit,
};

// 아이템 이미지 맵
export const ITEM_IMAGES = {
    aac: item_aac,
    headset: item_headset,
    timer: item_timer,
    pecs: item_pecs,
    squishy: item_squishy,
    map: item_map,
    ribbon: item_ribbon,
    bulb: item_bulb,
};

// 헬퍼: NPC 이미지 가져오기
export function getNpcImage(gender, emotion = 'default') {
    const images = NPC_IMAGES[gender] || NPC_IMAGES.female;
    return images[emotion] || images.default;
}

// 헬퍼: 플레이어 이미지 가져오기
export function getPlayerImage(gender, pose = 'talk') {
    const images = PLAYER_IMAGES[gender] || PLAYER_IMAGES.male;
    return images[pose] || images.talk;
}
