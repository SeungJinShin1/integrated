'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '@/data/assetMap';
import Icon from '@/components/ui/Icon';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);
ChartJS.defaults.font.family = "'Nanum Gothic', sans-serif";

const Radar = dynamic(() => import('react-chartjs-2').then(mod => mod.Radar), { ssr: false });

const SYSTEM_PROMPT = `You are a friendly AI guide in the Korean educational game "히든피스: 우리 반 보물찾기" (Hidden Piece: Our Class Treasure Hunt) about understanding autism spectrum disorder (ASD) for elementary school students (5th grade).
RULES:
- Answer ONLY questions related to: autism, disabilities, inclusion, empathy, understanding differences, and how to help friends with ASD.
- Use simple Korean appropriate for 10-11 year old students.
- Be warm, encouraging, and educational.
- If a student asks unrelated questions, gently redirect: "그건 제 전문 분야가 아니에요. 승주 같은 친구들에 대해 궁금한 건 뭐든 물어보세요!"
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
    { role: 'ai', text: `축하합니다! 서로 다른 히든피스들이 맞춰져 「빛나는 우리 반」이 완성되었어요. 오늘 ${N}와의 하루는 어땠나요?` }
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
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>「빛나는 우리 반」 잠금</h1>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>1~5단계를 모두 완료해야 「빛나는 우리 반」을 완성할 수 있어요!</p>
            <button onClick={() => router.push('/high')} style={{
              padding: '12px 32px', background: '#6366f1', color: 'white', borderRadius: 12,
              border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>보물찾기 지도로 돌아가기</button>
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('AI API error:', res.status, errorData);
        return `서버 오류(${res.status}): ${errorData.detail || '알 수 없는 오류가 발생했습니다.'}`;
      }
      const data = await res.json();
      return data.reply || '답변을 생성하지 못했어요. 다시 질문해 주세요!';
    } catch (err) {
      console.error('AI fetch error:', err);
      return '서버가 잠에서 깨어나는 중이거나 연결 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
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
  const empathyScore = Math.round(((stats.understanding || 0) + (stats.trust || 0) + (stats.communication || 0) + (stats.patience || 0)) / 4);
  const logs = state.logs || { tool_attempts: 0, tool_accuracy: 0, waiting_count: 0 };
  const accuracy = logs.tool_attempts > 0 ? Math.round((logs.tool_accuracy / logs.tool_attempts) * 100) : 100;
  const grade = empathyScore >= 80 ? 'S등급 — 히든피스 마스터' : empathyScore >= 60 ? 'A등급 — 히든피스 탐험가' : empathyScore >= 40 ? 'B등급 — 히든피스 수습생' : 'C등급 — 히든피스 입문자';

  const usedTools = state.usedTools || [];
  const badges: string[] = [];
  if (usedTools.includes('aac')) badges.push('소통의 배지');
  if (usedTools.includes('headset')) badges.push('배려의 방패');
  if (usedTools.includes('timer')) badges.push('약속의 시계');
  if (usedTools.includes('pecs')) badges.push('협력의 전구');
  if (usedTools.includes('ribbon') || usedTools.includes('map')) badges.push('다빛 팀');

  const radarData = {
    labels: ['이해', '신뢰', '소통', '인내'],
    datasets: [{ label: '역량', data: [stats.understanding, stats.trust, stats.communication, stats.patience], backgroundColor: 'rgba(99,102,241,0.25)', borderColor: 'rgba(99,102,241,0.8)', borderWidth: 2, pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 1, pointRadius: 4 }]
  };

  const radarOptions = { responsive: true, maintainAspectRatio: true, plugins: { tooltip: { enabled: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false }, pointLabels: { font: { size: 13, weight: 'bold' as const, family: "'Nanum Gothic', sans-serif" }, color: '#475569' }, grid: { color: 'rgba(100,116,139,0.15)' }, angleLines: { color: 'rgba(100,116,139,0.15)' } } } };

  const suggestions = ['자폐는 병이야?', '왜 눈을 안 마주쳐?', '내가 어떻게 도와주면 돼?', `${N}는 왜 소리에 예민해?`];

  const downloadCard = async () => {
    const cardEl = document.getElementById('hiddenpiece-result-card');
    if (!cardEl) return;
    try {
      const canvas = await html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `히든피스결과카드_${P}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download card', err);
      alert('결과 카드 저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area">
        {/* Background Image Layer */}
        <div style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${BG_IMAGES.exit})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }} />
        {/* Dark overlay on background */}
        <div style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(30,27,75,0.55)',
          zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 10, padding: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>6단계: 빛나는 우리 반</h1>
            <p style={{ fontSize: 14, color: '#a5b4fc' }}>히든피스 완성 & 다빛 규칙</p>
          </div>

          {/* Phase 1: Journal */}
          {phase === 'journal' && (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: 24, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, color: '#4f46e5', letterSpacing: 0.5,
                    boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                  }}>AI</div>
                  <div>
                    <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>AI 길잡이</p>
                    <p style={{ color: '#334155', fontSize: 15, lineHeight: 1.5 }}>&quot;오늘 {N}(이)와 함께하며 느낀 점은?&quot;</p>
                  </div>
                </div>
                <textarea value={journal} onChange={e => setJournal(e.target.value)} placeholder={`오늘 알게 된 ${N}의 특징이나, 내가 잘한 점을 적어보세요.`}
                  style={{ width: '100%', height: 140, padding: 14, borderRadius: 14, border: '2px solid #e2e8f0', resize: 'none', fontSize: 15, color: '#334155', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.2s' }} 
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button onClick={() => { if (journal.trim()) setPhase('chat'); }}
                  disabled={!journal.trim()}
                  style={{
                    width: '100%', marginTop: 14, padding: 16, borderRadius: 14, border: 'none',
                    background: journal.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#e2e8f0',
                    color: journal.trim() ? 'white' : '#94a3b8', fontSize: 16, fontWeight: 800, cursor: journal.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: journal.trim() ? '0 8px 24px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                  일지 저장 & 다음
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: AI Chat */}
          {phase === 'chat' && (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Chat Messages */}
              <div style={{ 
                flex: 1, overflowY: 'auto', 
                background: 'rgba(255,255,255,0.92)', 
                backdropFilter: 'blur(12px)',
                borderRadius: 20, padding: 20, marginBottom: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                minHeight: 200,
                maxHeight: 'calc(100vh - 340px)',
              }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', border: '2px solid', borderColor: m.role === 'ai' ? '#c7d2fe' : '#a5b4fc',
                      flexShrink: 0, background: m.role === 'ai' ? '#eef2ff' : '#f5f3ff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                      {m.role === 'ai'
                        ? <span style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', letterSpacing: 0.3 }}>AI</span>
                        : <img src={playerImg} alt={P} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ 
                      maxWidth: '75%', borderRadius: m.role === 'ai' ? '4px 18px 18px 18px' : '18px 4px 18px 18px', 
                      padding: '12px 18px', fontSize: 14, lineHeight: 1.7, 
                      background: m.role === 'ai' ? '#eef2ff' : 'linear-gradient(135deg, #6366f1, #818cf8)', 
                      color: m.role === 'ai' ? '#334155' : 'white',
                      boxShadow: m.role === 'ai' ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 12px rgba(99,102,241,0.3)',
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #c7d2fe', fontSize: 12, fontWeight: 800, color: '#4f46e5', letterSpacing: 0.3 }}>AI</div>
                    <div style={{ background: '#eef2ff', borderRadius: '4px 18px 18px 18px', padding: '12px 18px', fontSize: 14, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="animate-pulse">생각 중...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions */}
              {chatMessages.length <= 2 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setChatInput(s)} style={{
                      padding: '8px 14px', background: 'rgba(255,255,255,0.85)', color: '#4f46e5',
                      borderRadius: 20, fontSize: 13, border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer',
                      fontWeight: 600, transition: 'all 0.2s', backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = '#eef2ff'; (e.target as HTMLElement).style.borderColor = '#6366f1'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.85)'; (e.target as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
                    >{s}</button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`${N} 같은 친구에 대해 궁금한 점을 물어보세요...`}
                  style={{ 
                    flex: 1, padding: '14px 18px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.4)', 
                    background: 'rgba(255,255,255,0.92)', color: '#334155', fontSize: 15, outline: 'none',
                    backdropFilter: 'blur(8px)', transition: 'border-color 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                />
                <button onClick={sendMessage} disabled={loading || !chatInput.trim()} style={{
                  padding: '14px 22px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                  borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer',
                  opacity: loading || !chatInput.trim() ? 0.5 : 1,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                  transition: 'all 0.2s', fontSize: 14, letterSpacing: 0.3,
                }}>전송</button>
              </div>

              {/* Proceed to Report Button */}
              <button onClick={() => { completeStage('stage-6'); setPhase('report'); }}
                style={{ 
                  marginTop: 12, width: '100%', padding: 16, 
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                  backdropFilter: 'blur(12px)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, 
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.35))'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))'; }}
              >
                결과 카드 확인 & 엔딩
              </button>
            </div>
          )}

          {/* Phase 3: Report */}
          {phase === 'report' && (
            <div className="animate-fade-in" style={{ paddingBottom: 48 }}>
              <div id="hiddenpiece-result-card" style={{
                background: '#ffffff', borderRadius: 24, padding: 28, maxWidth: 480, margin: '0 auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: 4 }}>히든피스 결과 카드</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>Hidden Piece: Our Class Treasure Hunt</p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 68, height: 84, borderRadius: 14, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}>
                      <img src={playerImg} alt={P} style={{ height: '100%', objectFit: 'contain' }} />
                    </div>
                    <p style={{ fontSize: 12, color: '#475569', marginTop: 6, fontWeight: 700 }}>{P}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, color: '#94a3b8', fontSize: 22, fontWeight: 800 }}>&amp;</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 68, height: 84, borderRadius: 14, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(251,191,36,0.15)' }}>
                      <img src={npcImg} alt={N} style={{ height: '100%', objectFit: 'contain' }} />
                    </div>
                    <p style={{ fontSize: 12, color: '#475569', marginTop: 6, fontWeight: 700 }}>{N}</p>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 14, padding: 14, textAlign: 'center', color: 'white', marginBottom: 20, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                  <p style={{ fontSize: 13, opacity: 0.9 }}>공감 점수: {empathyScore}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{grade}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ width: 220, height: 220 }}><Radar ref={chartRef} data={radarData} options={radarOptions} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                  {[{ l: '이해', v: stats.understanding }, { l: '신뢰', v: stats.trust }, { l: '소통', v: stats.communication }, { l: '인내', v: stats.patience }].map(s => (
                    <div key={s.l} style={{ background: '#f8fafc', borderRadius: 10, padding: 10, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.l}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5' }}>{s.v}</p>
                    </div>
                  ))}
                </div>

                {journal && (
                  <div style={{ background: '#fffbeb', borderRadius: 14, padding: 16, border: '1px solid #fde68a', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>나의 탐구 일지</p>
                    <p style={{ fontSize: 14, color: '#b45309', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{journal}</p>
                  </div>
                )}

                {badges.length > 0 && (
                  <div style={{ background: '#fffbeb', borderRadius: 14, padding: 14, border: '1px solid #fde68a', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>획득한 배지</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      {badges.map((b, i) => <span key={i} style={{ padding: '5px 14px', background: '#fef3c7', borderRadius: 20, fontSize: 13, color: '#92400e', fontWeight: 600 }}>{b}</span>)}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f8fafc', borderRadius: 14, padding: 14, fontSize: 14, marginBottom: 16, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#64748b' }}>기다려준 횟수</span><span style={{ fontWeight: 700, color: '#334155' }}>{logs.waiting_count || 0}회</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#64748b' }}>도구 정확도</span><span style={{ fontWeight: 700, color: '#334155' }}>{accuracy}%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>사용한 도구</span><span style={{ fontWeight: 700, color: '#334155' }}>{usedTools.length}개</span></div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f3e8ff)', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#4338ca', lineHeight: 1.6 }}>&quot;우리는 서로 달라서, 서로에게 필요한 존재입니다.&quot;</p>
                </div>
              </div>

              {/* Download & Reset Buttons */}
              <div style={{ maxWidth: 480, margin: '20px auto', display: 'flex', gap: 12, paddingBottom: 24 }}>
                <button onClick={downloadCard}
                  style={{ 
                    flex: 1, padding: 16, 
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                    color: 'white', border: 'none', borderRadius: 14, 
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <Icon name="download" alt="다운로드" /> 히든피스 카드 내려받기
                </button>
                <button onClick={() => { resetGame(); router.push('/start'); }}
                  style={{ 
                    flex: 1, padding: 16, 
                    background: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(8px)',
                    color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, 
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
                >
                  <Icon name="back" alt="다시 시작" /> 다시 시작
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
