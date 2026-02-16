import { useState, useRef, useEffect } from 'react';
import { useGame } from '../GameContext';
import { FaBook, FaRotateLeft } from 'react-icons/fa6';
import { BG_IMAGES, getNpcImage, getPlayerImage } from '../assetMap';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import html2canvas from 'html2canvas';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const SYSTEM_PROMPT = `You are a friendly AI researcher at the "Prism Lab" in a Korean educational game about understanding autism spectrum disorder (ASD) for elementary school students (5th grade).

RULES:
- Answer ONLY questions related to: autism, disabilities, inclusion, empathy, understanding differences, and how to help friends with ASD.
- Use simple Korean appropriate for 10-11 year old students.
- Be warm, encouraging, and educational.
- If a student asks unrelated questions (e.g., homework help, games, personal problems), gently redirect: "그건 제 전문 분야가 아니에요. 😊 승주 같은 친구들에 대해 궁금한 건 뭐든 물어보세요!"
- Never use medical jargon. Explain concepts through relatable examples.
- Always emphasize that autism is not a disease, but a different way of experiencing the world.
- Keep responses under 150 words.`;

export default function Stage6({ onShowEncyclopedia }) {
    const { state, resetGame } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [phase, setPhase] = useState('journal'); // 'journal' | 'chat' | 'report'
    const [journal, setJournal] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', text: `축하합니다! 서로 다른 조각이 맞춰져 완벽한 '프리즘 팀'이 되었군요. 오늘 ${N}와의 하루는 어땠나요?` }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const chatEndRef = useRef(null);
    const reportRef = useRef(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    const npcImg = getNpcImage(state.npc.gender, 'happy');
    const playerImg = getPlayerImage(state.player.gender, 'talk');

    // Gemini API 호출
    const callGemini = async (userMessage) => {
        if (!apiKey) return '⚠️ Gemini API 키가 설정되지 않았습니다. 프로젝트 루트의 .env 파일에 VITE_GEMINI_API_KEY를 설정해 주세요.';
        try {
            const history = chatMessages.slice(1).map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    contents: [
                        ...history,
                        { role: 'user', parts: [{ text: userMessage }] }
                    ]
                })
            });
            const data = await res.json();
            if (data.error) {
                console.error('Gemini API error:', data.error);
                return `⚠️ API 오류: ${data.error.message}`;
            }
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '답변을 생성하지 못했어요. 다시 질문해 주세요!';
        } catch (err) {
            console.error('Gemini fetch error:', err);
            return '🔌 연결 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
        }
    };

    const sendMessage = async () => {
        const msg = chatInput.trim();
        if (!msg || loading) return;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
        setLoading(true);
        const reply = await callGemini(msg);
        if (reply) setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
        setLoading(false);
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    const generateReport = () => {
        setPhase('report');
    };

    // html2canvas 이미지 저장 — Blob 방식으로 PC/모바일 모두 지원
    const handleSaveImage = async () => {
        if (!reportRef.current || saving) return;
        setSaving(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#1e1b4b',
                scale: 2,
                useCORS: true,
                logging: false,
            });
            if (canvas.toBlob) {
                canvas.toBlob((blob) => {
                    if (!blob) { setSaving(false); return; }
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `프리즘_보고서_${P}.png`;
                    link.href = url;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        setSaving(false);
                    }, 100);
                }, 'image/png');
            } else {
                // fallback for older browsers
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `프리즘_보고서_${P}.png`;
                link.href = dataUrl;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    setSaving(false);
                }, 100);
            }
        } catch (err) {
            console.error('Image save error:', err);
            alert('이미지 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
            setSaving(false);
        }
    };

    const stats = state.stats;
    const prismScore = Math.round((stats.understanding + stats.trust + stats.communication + stats.patience) / 4);
    const accuracy = state.logs.tool_attempts > 0 ? Math.round((state.logs.tool_accuracy / state.logs.tool_attempts) * 100) : 100;
    const grade = prismScore >= 80 ? '🏆 S등급 - 프리즘 마스터' : prismScore >= 60 ? '🥇 A등급 - 프리즘 요원' : prismScore >= 40 ? '🥈 B등급 - 프리즘 수습생' : '🥉 C등급 - 프리즘 입문자';

    const badges = [];
    if (state.usedTools.includes('aac')) badges.push('🏅 소통의 배지');
    if (state.usedTools.includes('headset')) badges.push('🛡️ 배려의 방패');
    if (state.usedTools.includes('timer')) badges.push('⏰ 약속의 시계');
    if (state.usedTools.includes('pecs')) badges.push('💡 협력의 전구');
    if (state.usedTools.includes('ribbon') || state.usedTools.includes('map')) badges.push('🌈 프리즘 팀');

    // 레이더 차트 데이터
    const radarData = {
        labels: ['이해', '신뢰', '소통', '인내'],
        datasets: [{
            label: '역량',
            data: [stats.understanding, stats.trust, stats.communication, stats.patience],
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            borderColor: 'rgba(99, 102, 241, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            pointRadius: 4,
        }]
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { tooltip: { enabled: false } },
        scales: {
            r: {
                min: 0,
                max: 100,
                ticks: { stepSize: 20, display: false },
                pointLabels: { font: { size: 13, weight: 'bold' }, color: '#475569' },
                grid: { color: 'rgba(100, 116, 139, 0.15)' },
                angleLines: { color: 'rgba(100, 116, 139, 0.15)' },
            }
        }
    };

    const suggestions = [
        '자폐는 병이야?',
        '왜 눈을 안 마주쳐?',
        '내가 어떻게 도와주면 돼?',
        `${N}는 왜 소리에 예민해?`,
    ];

    return (
        <div className="flex flex-col h-full relative">
            <img src={BG_IMAGES.exit} alt="프리즘 연구소" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" />

            <div className="relative z-10 flex flex-col h-full p-4">
                <div className="text-center mb-3">
                    <h1 className="text-xl font-bold text-white drop-shadow-lg">🔬 Stage 6: 프리즘 연구소</h1>
                    <p className="text-sm text-indigo-200">AI 회고 & 공유</p>
                </div>

                {/* ── Phase 1: 일지 작성 ── */}
                {phase === 'journal' && (
                    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                        <div className="bg-white/95 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="flex gap-3 items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">🔬</div>
                                <div>
                                    <p className="text-sm text-slate-500">AI 연구원</p>
                                    <p className="text-slate-700">"오늘 {N}(이)와 함께하며 느낀 점은?"</p>
                                </div>
                            </div>
                            <textarea value={journal} onChange={e => setJournal(e.target.value)} placeholder={`오늘 알게 된 ${N}의 특징이나, 내가 잘한 점을 적어보세요.`}
                                className="w-full h-32 p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none resize-none text-slate-800 text-sm" />
                            <button onClick={() => { if (journal.trim()) setPhase('chat'); }}
                                disabled={!journal.trim()}
                                className={`w-full mt-3 py-3 rounded-xl font-bold transition-all cursor-pointer ${journal.trim() ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                📝 일지 저장 & 다음
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Phase 2: AI 챗봇 ── */}
                {phase === 'chat' && (
                    <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
                        {!apiKey && (
                            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-2 text-sm text-amber-800">
                                ⚠️ <code>.env</code> 파일에 <code>VITE_GEMINI_API_KEY</code>를 설정해 주세요. 설정 후 서버를 재시작하세요.
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-3 mb-3 rounded-2xl bg-white/90 backdrop-blur-sm p-4">
                            {chatMessages.map((m, i) => (
                                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-white shadow">
                                        {m.role === 'ai' ? <span className="text-lg">🔬</span> : <img src={playerImg} alt={P} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'ai' ? 'bg-indigo-50 text-slate-700' : 'bg-indigo-600 text-white'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">🔬</div>
                                    <div className="bg-indigo-50 rounded-2xl px-4 py-2.5 text-sm text-slate-400 animate-pulse">생각 중...</div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {chatMessages.length <= 2 && (
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {suggestions.map((s, i) => (
                                    <button key={i} onClick={() => { setChatInput(s); }}
                                        className="px-3 py-1.5 bg-white/80 text-slate-600 rounded-full text-xs border border-white/50 hover:bg-white transition-all cursor-pointer">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder={`${N} 같은 친구에 대해 궁금한 점을 물어보세요...`}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-white/50 bg-white/90 backdrop-blur-sm text-slate-800 focus:border-indigo-500 focus:outline-none text-sm" />
                            <button onClick={sendMessage} disabled={loading || !chatInput.trim()}
                                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer">➤</button>
                        </div>
                        <button onClick={generateReport}
                            className="mt-2 w-full py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-medium hover:bg-white/30 transition-all cursor-pointer">
                            📊 결과 카드 확인 & 엔딩
                        </button>
                    </div>
                )}

                {/* ── Phase 3: 결과 카드 ── */}
                {phase === 'report' && (
                    <div className="flex-1 overflow-y-auto animate-fade-in">
                        <div ref={reportRef} className="bg-white/95 rounded-2xl p-6 max-w-md mx-auto shadow-2xl">
                            <h2 className="text-lg font-bold text-slate-800 mb-1 text-center">🌈 프리즘 결과 카드</h2>
                            <p className="text-xs text-slate-400 text-center mb-4">Hidden Piece: The Secret Agent of Our Class</p>

                            {/* 캐릭터 */}
                            <div className="flex gap-4 justify-center mb-4">
                                <div className="text-center">
                                    <div className="w-16 h-20 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border"><img src={playerImg} alt={P} className="h-full object-contain" /></div>
                                    <p className="text-xs text-slate-600 mt-1">{P}</p>
                                </div>
                                <div className="text-2xl self-center">🤝</div>
                                <div className="text-center">
                                    <div className="w-16 h-20 rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden border"><img src={npcImg} alt={N} className="h-full object-contain" /></div>
                                    <p className="text-xs text-slate-600 mt-1">{N}</p>
                                </div>
                            </div>

                            {/* 등급 */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-3 text-center text-white mb-4">
                                <p className="text-sm opacity-80">프리즘 점수: {prismScore}</p>
                                <p className="text-lg font-bold">{grade}</p>
                            </div>

                            {/* 레이더 차트 */}
                            <div className="mb-4 flex justify-center">
                                <div style={{ width: 220, height: 220 }}>
                                    <Radar data={radarData} options={radarOptions} />
                                </div>
                            </div>

                            {/* 4대 역량 수치 */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[
                                    { label: '이해', val: stats.understanding, emoji: '💡' },
                                    { label: '신뢰', val: stats.trust, emoji: '🤝' },
                                    { label: '소통', val: stats.communication, emoji: '💬' },
                                    { label: '인내', val: stats.patience, emoji: '🧘' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500">{s.emoji} {s.label}</p>
                                        <p className="text-lg font-bold text-indigo-600">{s.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* 일지 */}
                            <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                                <p className="text-sm font-medium text-amber-800 mb-1">📝 나의 탐구 일지</p>
                                <p className="text-sm text-amber-700 whitespace-pre-wrap">{journal}</p>
                            </div>

                            {/* AI 대화 요약 */}
                            {chatMessages.length > 1 && (
                                <div className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-200">
                                    <p className="text-sm font-medium text-indigo-800 mb-2">🤖 AI 멘토링 요약</p>
                                    {chatMessages.slice(1).map((m, i) => (
                                        <p key={i} className={`text-xs mb-1 ${m.role === 'user' ? 'text-indigo-600' : 'text-slate-600'}`}>
                                            <span className="font-medium">{m.role === 'user' ? P : 'AI'}:</span> {m.text.slice(0, 80)}{m.text.length > 80 ? '...' : ''}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* 배지 */}
                            {badges.length > 0 && (
                                <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-200">
                                    <p className="text-sm font-medium text-amber-800 mb-2">🎖️ 획득한 배지</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {badges.map((b, i) => (
                                            <span key={i} className="px-3 py-1 bg-amber-100 rounded-full text-sm text-amber-800">{b}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 상세 통계 */}
                            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm">
                                <div className="flex justify-between mb-1"><span className="text-slate-500">⏳ 기다려준 횟수</span><span className="font-bold text-slate-700">{state.logs.waiting_count}회</span></div>
                                <div className="flex justify-between mb-1"><span className="text-slate-500">🎯 도구 정확도</span><span className="font-bold text-slate-700">{accuracy}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">🧰 사용한 도구</span><span className="font-bold text-slate-700">{state.usedTools.length}개</span></div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-3 text-center mb-4">
                                <p className="text-sm font-bold text-indigo-700">"우리는 서로 달라서, 서로에게 필요한 존재입니다."</p>
                            </div>
                        </div>

                        {/* 버튼들 (캡처 영역 밖) */}
                        <div className="max-w-md mx-auto mt-4 space-y-2 pb-4">
                            <button onClick={handleSaveImage} disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50">
                                {saving ? '⏳ 저장 중...' : '📸 이미지로 저장'}
                            </button>
                            <p className="text-xs text-indigo-200 text-center">저장된 이미지를 선생님이 안내해주신 패들렛/띠커벨에 올려서 친구들과 공유하세요.</p>
                            <div className="flex gap-3">
                                <button onClick={onShowEncyclopedia}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all cursor-pointer">
                                    <FaBook className="inline mr-2" />도감 보기
                                </button>
                                <button onClick={resetGame}
                                    className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-all cursor-pointer">
                                    <FaRotateLeft className="inline mr-2" />다시 시작
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
