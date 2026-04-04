'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '@/data/assetMap';
import { FaRotateLeft } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const Radar = dynamic(() => import('react-chartjs-2').then(mod => mod.Radar), { ssr: false });

const SYSTEM_PROMPT = `You are a friendly AI researcher at the "Prism Lab" in a Korean educational game about understanding autism spectrum disorder (ASD) for elementary school students (5th grade).
RULES:
- Answer ONLY questions related to: autism, disabilities, inclusion, empathy, understanding differences, and how to help friends with ASD.
- Use simple Korean appropriate for 10-11 year old students.
- Be warm, encouraging, and educational.
- If a student asks unrelated questions, gently redirect: "그건 제 전문 분야가 아니에요. 😊 승주 같은 친구들에 대해 궁금한 건 뭐든 물어보세요!"
- Never use medical jargon. Explain concepts through relatable examples.
- Always emphasize that autism is not a disease, but a different way of experiencing the world.
- Keep responses under 150 words.`;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LabPage() {
  const router = useRouter();
  const { state, resetGame, completeStage } = useGame();
  const N = state.npc.name;
  const P = state.player.name;
  const [phase, setPhase] = useState<'journal' | 'chat' | 'report'>('journal');
  const [journal, setJournal] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: `축하합니다! 서로 다른 조각이 맞춰져 완벽한 '프리즘 팀'이 되었군요. 오늘 ${N}와의 하루는 어땠나요?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // Check if stages 1-5 are all complete safely
  const completedStages = state.completedStages || [];
  const allComplete = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5']
    .every(s => completedStages.includes(s));

  if (!allComplete) {
    return (
      <>
        <TopNavBar />
        <div className="game-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>프리즘 연구소 잠금</h1>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>1~5단계를 모두 완료해야 프리즘 연구소에 입장할 수 있어요!</p>
            <button onClick={() => router.push('/high')} style={{
              padding: '12px 32px', background: '#6366f1', color: 'white', borderRadius: 12,
              border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>월드맵으로 돌아가기</button>
          </div>
        </div>
      </>
    );
  }

  const npcImg = getNpcImage(state.npc.gender, 'happy');
  const playerImg = getPlayerImage(state.player.gender, 'talk');

  const callAI = async (userMessage: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, systemPrompt: SYSTEM_PROMPT }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      return data.reply || '답변을 생성하지 못했어요. 다시 질문해 주세요!';
    } catch {
      return '🔌 서버가 잠에서 깨어나는 중이거나 연결 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
    }
  };

  const sendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || loading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    const reply = await callAI(msg);
    setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  const stats = state.stats || { understanding: 0, trust: 0, communication: 0, patience: 0 };
  const prismScore = Math.round(((stats.understanding || 0) + (stats.trust || 0) + (stats.communication || 0) + (stats.patience || 0)) / 4);
  const logs = state.logs || { tool_attempts: 0, tool_accuracy: 0, waiting_count: 0 };
  const accuracy = logs.tool_attempts > 0 ? Math.round((logs.tool_accuracy / logs.tool_attempts) * 100) : 100;
  const grade = prismScore >= 80 ? '🏆 S등급 - 프리즘 마스터' : prismScore >= 60 ? '🥇 A등급 - 프리즘 요원' : prismScore >= 40 ? '🥈 B등급 - 프리즘 수습생' : '🥉 C등급 - 프리즘 입문자';

  const usedTools = state.usedTools || [];
  const badges: string[] = [];
  if (usedTools.includes('aac')) badges.push('🏅 소통의 배지');
  if (usedTools.includes('headset')) badges.push('🛡️ 배려의 방패');
  if (usedTools.includes('timer')) badges.push('⏰ 약속의 시계');
  if (usedTools.includes('pecs')) badges.push('💡 협력의 전구');
  if (usedTools.includes('ribbon') || usedTools.includes('map')) badges.push('🌈 프리즘 팀');

  const radarData = {
    labels: ['이해', '신뢰', '소통', '인내'],
    datasets: [{ label: '역량', data: [stats.understanding, stats.trust, stats.communication, stats.patience], backgroundColor: 'rgba(99,102,241,0.25)', borderColor: 'rgba(99,102,241,0.8)', borderWidth: 2, pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 1, pointRadius: 4 }]
  };

  const radarOptions = { responsive: true, maintainAspectRatio: true, plugins: { tooltip: { enabled: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false }, pointLabels: { font: { size: 13, weight: 'bold' as const }, color: '#475569' }, grid: { color: 'rgba(100,116,139,0.15)' }, angleLines: { color: 'rgba(100,116,139,0.15)' } } } };

  const suggestions = ['자폐는 병이야?', '왜 눈을 안 마주쳐?', '내가 어떻게 도와주면 돼?', `${N}는 왜 소리에 예민해?`];

  const downloadCard = async () => {
    const cardEl = document.getElementById('prism-result-card');
    if (!cardEl) return;
    try {
      const canvas = await html2canvas(cardEl, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `프리즘결과카드_${P}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download card', err);
      alert('결과 카드 저장에 실패했습니다.');
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{ 
        position: 'relative', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundImage: `linear-gradient(rgba(30,27,75,0.6), rgba(30,27,75,0.6)), url(${BG_IMAGES.exit})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'local'
      }}>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1, padding: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>🔬 6단계: 프리즘 연구소</h1>
            <p style={{ fontSize: 13, color: '#a5b4fc' }}>AI 회고 & 공유</p>
          </div>

          {/* Phase 1: Journal */}
          {phase === 'journal' && (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, maxWidth: 440, width: '100%' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔬</div>
                  <div><p style={{ fontSize: 13, color: '#94a3b8' }}>AI 연구원</p><p style={{ color: '#334155' }}>&quot;오늘 {N}(이)와 함께하며 느낀 점은?&quot;</p></div>
                </div>
                <textarea value={journal} onChange={e => setJournal(e.target.value)} placeholder={`오늘 알게 된 ${N}의 특징이나, 내가 잘한 점을 적어보세요.`}
                  style={{ width: '100%', height: 128, padding: 12, borderRadius: 12, border: '2px solid #e2e8f0', resize: 'none', fontSize: 14, color: '#334155', fontFamily: "'Nanum Gothic', sans-serif", outline: 'none' }} />
                <button onClick={() => { if (journal.trim()) setPhase('chat'); }}
                  disabled={!journal.trim()}
                  style={{
                    width: '100%', marginTop: 12, padding: 14, borderRadius: 12, border: 'none',
                    background: journal.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#e2e8f0',
                    color: journal.trim() ? 'white' : '#94a3b8', fontSize: 15, fontWeight: 800, cursor: journal.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: "'Nanum Gothic', sans-serif",
                  }}>
                  📝 일지 저장 & 다음
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: AI Chat */}
          {phase === 'chat' && (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                      {m.role === 'ai' ? <span style={{ fontSize: 18 }}>🔬</span> : <img src={playerImg} alt={P} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ maxWidth: '75%', borderRadius: 16, padding: '10px 16px', fontSize: 14, lineHeight: 1.6, background: m.role === 'ai' ? '#eef2ff' : '#6366f1', color: m.role === 'ai' ? '#334155' : 'white' }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔬</div><div style={{ background: '#eef2ff', borderRadius: 16, padding: '10px 16px', fontSize: 14, color: '#94a3b8' }}>생각 중...</div></div>}
                <div ref={chatEndRef} />
              </div>

              {chatMessages.length <= 2 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setChatInput(s)} style={{
                      padding: '6px 12px', background: 'rgba(255,255,255,0.8)', color: '#475569',
                      borderRadius: 20, fontSize: 12, border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer',
                      fontFamily: "'Nanum Gothic', sans-serif",
                    }}>{s}</button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`${N} 같은 친구에 대해 궁금한 점을 물어보세요...`}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', color: '#334155', fontSize: 14, outline: 'none', fontFamily: "'Nanum Gothic', sans-serif" }} />
                <button onClick={sendMessage} disabled={loading || !chatInput.trim()} style={{
                  padding: '12px 20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                  borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', opacity: loading || !chatInput.trim() ? 0.5 : 1,
                }}>➤</button>
              </div>
              <button onClick={() => { completeStage('stage-6'); setPhase('report'); }}
                style={{ marginTop: 8, width: '100%', padding: 14, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nanum Gothic', sans-serif" }}>
                📊 결과 카드 확인 & 엔딩
              </button>
            </div>
          )}

          {/* Phase 3: Report */}
          {phase === 'report' && (
            <div className="animate-fade-in" style={{ flex: 1, overflowY: 'visible' }}>
              <div id="prism-result-card" style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, maxWidth: 440, margin: '0 auto' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: 4 }}>🌈 프리즘 결과 카드</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 16 }}>Hidden Piece: The Secret Agent of Our Class</p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ textAlign: 'center' }}><div style={{ width: 64, height: 80, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={playerImg} alt={P} style={{ height: '100%', objectFit: 'contain' }} /></div><p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{P}</p></div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 24 }}>🤝</div>
                  <div style={{ textAlign: 'center' }}><div style={{ width: 64, height: 80, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={npcImg} alt={N} style={{ height: '100%', objectFit: 'contain' }} /></div><p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{N}</p></div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 12, padding: 12, textAlign: 'center', color: 'white', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, opacity: 0.8 }}>프리즘 점수: {prismScore}</p>
                  <p style={{ fontSize: 18, fontWeight: 800 }}>{grade}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ width: 200, height: 200 }}><Radar ref={chartRef} data={radarData} options={radarOptions} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {[{ l: '💡 이해', v: stats.understanding }, { l: '🤝 신뢰', v: stats.trust }, { l: '💬 소통', v: stats.communication }, { l: '🧘 인내', v: stats.patience }].map(s => (
                    <div key={s.l} style={{ background: '#f8fafc', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: '#64748b' }}>{s.l}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>{s.v}</p>
                    </div>
                  ))}
                </div>

                {journal && (
                  <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>📝 나의 탐구 일지</p>
                    <p style={{ fontSize: 14, color: '#b45309', whiteSpace: 'pre-wrap' }}>{journal}</p>
                  </div>
                )}

                {badges.length > 0 && (
                  <div style={{ background: '#fffbeb', borderRadius: 12, padding: 12, border: '1px solid #fde68a', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>🎖️ 획득한 배지</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      {badges.map((b, i) => <span key={i} style={{ padding: '4px 12px', background: '#fef3c7', borderRadius: 20, fontSize: 13, color: '#92400e' }}>{b}</span>)}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: '#64748b' }}>⏳ 기다려준 횟수</span><span style={{ fontWeight: 700, color: '#334155' }}>{logs.waiting_count || 0}회</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: '#64748b' }}>🎯 도구 정확도</span><span style={{ fontWeight: 700, color: '#334155' }}>{accuracy}%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>🧰 사용한 도구</span><span style={{ fontWeight: 700, color: '#334155' }}>{usedTools.length}개</span></div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f3e8ff)', borderRadius: 12, padding: 12, textAlign: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#4338ca' }}>&quot;우리는 서로 달라서, 서로에게 필요한 존재입니다.&quot;</p>
                </div>
              </div>

              <div style={{ maxWidth: 440, margin: '16px auto', display: 'flex', gap: 12, paddingBottom: 16 }}>
                <button onClick={downloadCard}
                  style={{ flex: 1, padding: 14, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nanum Gothic', sans-serif" }}>
                  💾 프리즘 카드 내려받기
                </button>
                <button onClick={() => { resetGame(); router.push('/start'); }}
                  style={{ flex: 1, padding: 14, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nanum Gothic', sans-serif" }}>
                  <FaRotateLeft style={{ display: 'inline', marginRight: 8 }} />다시 시작
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
