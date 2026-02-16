import { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { FaUserSecret, FaMars, FaVenus, FaPlay } from 'react-icons/fa6';
import { BG_IMAGES } from '../assetMap';

export default function Prologue() {
    const { state, dispatch, setStage } = useGame();
    const [playerName, setPlayerName] = useState(state.player.name === '나' ? '' : state.player.name);
    const [playerGender, setPlayerGender] = useState(state.player.gender);
    const [npcName, setNpcName] = useState(state.npc.name);
    const [npcGender, setNpcGender] = useState(state.npc.gender);
    const [phase, setPhase] = useState('intro');
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    // 매트릭스 이진 코드 애니메이션
    useEffect(() => {
        if (phase !== 'intro') { cancelAnimationFrame(animRef.current); return; }
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const cols = Math.floor(canvas.width / 18);
        const drops = Array(cols).fill(0).map(() => Math.random() * canvas.height / 18);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6366f1';
            ctx.font = '14px monospace';
            for (let i = 0; i < cols; i++) {
                const char = Math.random() > 0.5 ? '1' : '0';
                ctx.fillStyle = `rgba(99, 102, 241, ${0.3 + Math.random() * 0.5})`;
                ctx.fillText(char, i * 18, drops[i] * 18);
                if (drops[i] * 18 > canvas.height && Math.random() > 0.95) drops[i] = 0;
                drops[i]++;
            }
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, [phase]);

    const handleNpcGenderChange = (gender) => {
        setNpcGender(gender);
        const currentDefault = npcGender === 'female' ? '승주' : '성민';
        if (!npcName || npcName === currentDefault || npcName === '승주' || npcName === '성민') {
            setNpcName(gender === 'female' ? '승주' : '성민');
        }
    };

    const start = () => {
        const finalPlayerName = playerName.trim() || '나';
        const finalNpcName = npcName.trim() || (npcGender === 'female' ? '승주' : '성민');
        dispatch({ type: 'SET_PLAYER', payload: { name: finalPlayerName, gender: playerGender } });
        dispatch({ type: 'SET_NPC', payload: { name: finalNpcName, gender: npcGender } });
        setStage('stage-1');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
            {/* 배경 이미지 */}
            <img src={BG_IMAGES.dataworld} alt="데이터 세상" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-indigo-950/70" />
            {/* 매트릭스 애니메이션 Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

            {phase === 'intro' ? (
                <div className="bg-black/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-indigo-500/30 animate-fade-in z-10">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl mb-4">
                            <FaUserSecret className="text-indigo-400 text-2xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">히든 피스</h1>
                        <p className="text-indigo-300 text-sm mt-1">우리 반의 비밀 요원</p>
                    </div>
                    <div className="bg-indigo-950/50 rounded-2xl p-5 mb-6 border border-indigo-500/20">
                        <p className="text-indigo-100 text-base leading-relaxed">
                            "우리 반에는 조금 특별한 OS(운영체제)를 가진 친구가 있다. 보통의 방법으로는 접속할 수 없는 이 친구... 과연 우리는 '원팀'이 될 수 있을까?"
                        </p>
                    </div>
                    <button onClick={() => setPhase('setup')}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer">
                        접속 시작 ▸
                    </button>
                </div>
            ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-indigo-100 animate-fade-in max-h-[90vh] overflow-y-auto z-10">
                    <div className="text-center mb-4">
                        <p className="text-sm text-slate-500 mb-1">System</p>
                        <p className="text-base text-slate-700 font-medium">"비밀 요원 등록을 시작합니다. 당신과 파트너의 정보를 입력해 주세요."</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">나의 이름</label>
                            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="이름을 입력하세요 (비우면 '나')"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-all text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">나의 성별</label>
                            <div className="flex gap-3">
                                <button onClick={() => setPlayerGender('male')} className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer ${playerGender === 'male' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-400'}`}>
                                    <FaMars className="inline mr-1" /> 남학생
                                </button>
                                <button onClick={() => setPlayerGender('female')} className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer ${playerGender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-500 hover:border-pink-400'}`}>
                                    <FaVenus className="inline mr-1" /> 여학생
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">파트너(NPC) 이름</label>
                            <input type="text" value={npcName} onChange={e => setNpcName(e.target.value)} placeholder="이름을 입력하세요"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-all text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">파트너 성별</label>
                            <div className="flex gap-3">
                                <button onClick={() => handleNpcGenderChange('male')} className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer ${npcGender === 'male' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-400'}`}>
                                    <FaMars className="inline mr-1" /> 남학생
                                </button>
                                <button onClick={() => handleNpcGenderChange('female')} className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer ${npcGender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-500 hover:border-pink-400'}`}>
                                    <FaVenus className="inline mr-1" /> 여학생
                                </button>
                            </div>
                        </div>
                        <button onClick={start} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mt-4 cursor-pointer">
                            <FaPlay className="inline mr-2" />접속하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
