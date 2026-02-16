import { useGame } from '../GameContext';
import { FaBook, FaRotateLeft } from 'react-icons/fa6';
import { BG_IMAGES } from '../assetMap';

export default function Ending({ onShowEncyclopedia }) {
    const { state, resetGame } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const s = state.stats;
    const prismScore = Math.round((s.understanding + s.trust + s.communication + s.patience) / 4);
    const accuracy = state.logs.tool_attempts > 0 ? Math.round((state.logs.tool_accuracy / state.logs.tool_attempts) * 100) : 100;
    const grade = prismScore >= 80 ? '🏆 S' : prismScore >= 60 ? '🥇 A' : prismScore >= 40 ? '🥈 B' : '🥉 C';

    const badges = [];
    if (state.usedTools.includes('aac')) badges.push('🏅 소통의 배지');
    if (state.usedTools.includes('headset')) badges.push('🛡️ 배려의 방패');
    if (state.usedTools.includes('timer')) badges.push('⏰ 약속의 시계');
    if (state.usedTools.includes('pecs')) badges.push('💡 협력의 전구');
    if (state.usedTools.includes('ribbon') || state.usedTools.includes('map')) badges.push('🌈 프리즘 팀');

    return (
        <div className="h-full flex items-center justify-center relative text-white p-6 animate-fade-in overflow-y-auto">
            {/* 배경 */}
            <img src={BG_IMAGES.exit} alt="출구" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-indigo-900/70" />
            <div className="text-center max-w-md w-full relative z-10">
                <div className="text-6xl mb-4 animate-float">🌈</div>
                <h1 className="text-3xl font-bold mb-2">미션 완료!</h1>
                <p className="text-indigo-200 mb-2">서로 다른 조각이 맞춰져 완성된 프리즘 팀</p>
                <p className="text-indigo-300 text-sm mb-6 italic">
                    {`"우리는 '프리즘 팀'이거든요! ${P === '나' ? '제' : P}가 작전을 짰고, ${N}(이)가 길을 찾았어요."`}
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <div className="text-5xl font-black mb-2">{grade}</div>
                    <div className="text-2xl font-bold text-amber-300 mb-4">프리즘 점수: {prismScore}점</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/10 rounded-xl p-3"><div className="text-indigo-300">💡 이해</div><div className="font-bold text-lg">{s.understanding}</div></div>
                        <div className="bg-white/10 rounded-xl p-3"><div className="text-indigo-300">🤝 신뢰</div><div className="font-bold text-lg">{s.trust}</div></div>
                        <div className="bg-white/10 rounded-xl p-3"><div className="text-indigo-300">💬 소통</div><div className="font-bold text-lg">{s.communication}</div></div>
                        <div className="bg-white/10 rounded-xl p-3"><div className="text-indigo-300">🧘 인내</div><div className="font-bold text-lg">{s.patience}</div></div>
                    </div>
                </div>
                {badges.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                        <h3 className="text-sm font-bold text-amber-300 mb-2">🎖️ 획득한 배지</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {badges.map((b, i) => (
                                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{b}</span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 text-sm">
                    <div className="flex justify-between mb-2"><span className="text-indigo-300">⏳ 기다려준 횟수</span><span className="font-bold">{state.logs.waiting_count}회</span></div>
                    <div className="flex justify-between mb-2"><span className="text-indigo-300">🎯 도구 정확도</span><span className="font-bold">{accuracy}%</span></div>
                    <div className="flex justify-between"><span className="text-indigo-300">🧰 사용한 도구</span><span className="font-bold">{state.usedTools.length}개</span></div>
                </div>
                <div className="flex gap-3 justify-center">
                    <button onClick={onShowEncyclopedia} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all cursor-pointer">
                        <FaBook className="inline mr-2" />도감 보기
                    </button>
                    <button onClick={resetGame} className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all cursor-pointer">
                        <FaRotateLeft className="inline mr-2" />다시 시작
                    </button>
                </div>
            </div>
        </div>
    );
}
