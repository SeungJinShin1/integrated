import { useState } from 'react';
import { useGame } from '../GameContext';
import { FaUserSecret, FaSeedling, FaPlay } from 'react-icons/fa6';
import { BG_IMAGES } from '../assetMap';

export default function ModeSelect() {
    const { setGradeMode, setStage, dispatch } = useGame();
    const [showLowGradeSetup, setShowLowGradeSetup] = useState(false);
    const [npcName, setNpcName] = useState('승주');
    const [npcGender, setNpcGender] = useState('female');

    const initiateLowGradeSetup = () => {
        setShowLowGradeSetup(true);
    };

    const handleStartLowGrade = () => {
        // 저학년 모드의 경우 플레이어 이름은 불필요하므로 '나'로 고정, NPC 정보만 설정
        dispatch({ type: 'SET_PLAYER', payload: { name: '나', gender: 'male' } });
        dispatch({ type: 'SET_NPC', payload: { name: npcName.trim() || (npcGender === 'female' ? '승주' : '성민'), gender: npcGender } });
        setGradeMode('low_grade');
        setStage('low_intro');
    };

    const handleSelectHighGrade = () => {
        setGradeMode('high_grade');
        setStage('prologue');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center z-10 overflow-y-auto py-4 bg-indigo-50">
            <img src={BG_IMAGES.dataworld} alt="배경" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-indigo-100 z-10 transition-all duration-300">
                {!showLowGradeSetup ? (
                    <div className="animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">원팀 프로젝트: 히든 피스</h1>
                            <p className="text-slate-500">당신의 요원 등급을 선택해 주세요</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* 저학년 (새싹 요원) 선택 */}
                            <div
                                onClick={initiateLowGradeSetup}
                                className="group relative flex flex-col items-center justify-center p-8 bg-green-50 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:bg-green-100 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
                            >
                                <div className="w-20 h-20 bg-green-200 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                                    <FaSeedling />
                                </div>
                                <h2 className="text-2xl font-bold text-green-800 mb-2">새싹 요원</h2>
                                <p className="text-green-600 font-medium mb-1">초등학교 1~2학년</p>
                                <p className="text-sm text-green-600/70 text-center mt-2">터치와 기다림을 통해<br />친구의 마음을 이해해 보아요</p>
                            </div>

                            {/* 고학년 (프리즘 요원) 선택 */}
                            <div
                                onClick={handleSelectHighGrade}
                                className="group relative flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
                            >
                                <div className="w-20 h-20 bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                                    <FaUserSecret />
                                </div>
                                <h2 className="text-2xl font-bold text-indigo-800 mb-2">프리즘 요원</h2>
                                <p className="text-indigo-600 font-medium mb-1">초등학교 3~6학년</p>
                                <p className="text-sm text-indigo-600/70 text-center mt-2">도구를 활용하고 상호 협력하여<br />특별한 친구와 원팀이 되어보아요</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in flex flex-col items-center py-4">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                            <FaSeedling />
                        </div>
                        <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">
                            특수학급 친구 등록
                        </h2>
                        <p className="text-center text-slate-500 mb-8 max-w-sm">
                            새싹 요원이 되어 함께할 친구의 정보를 입력해 주세요.
                        </p>

                        <div className="w-full max-w-sm text-left">
                            <label className="block text-sm font-bold text-slate-700 mb-2">친구의 이름</label>
                            <input
                                type="text"
                                value={npcName}
                                onChange={e => setNpcName(e.target.value)}
                                placeholder="예: 승주"
                                className="w-full px-5 py-4 rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all text-slate-800 mb-6 text-lg font-medium shadow-sm"
                            />

                            <label className="block text-sm font-bold text-slate-700 mb-2">친구의 성별</label>
                            <div className="flex gap-3 mb-8">
                                <button
                                    onClick={() => {
                                        setNpcGender('female');
                                        if (npcName === '성민') setNpcName('승주');
                                    }}
                                    className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all cursor-pointer shadow-sm ${npcGender === 'female' ? 'border-green-500 bg-green-100 text-green-700 scale-105' : 'border-slate-200 text-slate-500 hover:border-green-300 hover:bg-slate-50'}`}
                                >
                                    여학생
                                </button>
                                <button
                                    onClick={() => {
                                        setNpcGender('male');
                                        if (npcName === '승주') setNpcName('성민');
                                    }}
                                    className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all cursor-pointer shadow-sm ${npcGender === 'male' ? 'border-green-500 bg-green-100 text-green-700 scale-105' : 'border-slate-200 text-slate-500 hover:border-green-300 hover:bg-slate-50'}`}
                                >
                                    남학생
                                </button>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLowGradeSetup(false)}
                                    className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                    이전
                                </button>
                                <button
                                    onClick={handleStartLowGrade}
                                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaPlay /> 시작하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
