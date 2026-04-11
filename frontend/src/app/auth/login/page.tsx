'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { BG_IMAGES } from '@/data/assetMap';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithCode } = useAuth();
  const { setGradeMode } = useGame();
  const [mode, setMode] = useState<'credentials' | 'code'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('아이디와 비밀번호를 입력하세요.'); return; }
    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'admin') {
        router.push('/admin');
      } else if (result.role === 'teacher') {
        router.push('/teacher');
      } else {
        setGradeMode('high_grade');
        router.push('/character');
      }
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode || authCode.length !== 6) { setError('6자리 인증번호를 입력하세요.'); return; }
    setLoading(true);
    setError('');
    const result = await loginWithCode(authCode);
    setLoading(false);
    if (result.success) {
      setGradeMode('high_grade');
      router.push('/character');
    } else {
      setError('인증번호가 유효하지 않습니다.');
    }
  };

  const handleGuestMode = () => {
    setGradeMode('high_grade');
    router.push('/character');
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
      <div className="auth-overlay" />

      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>

        {mode === 'credentials' ? (
          <form onSubmit={handleCredentialLogin}>
            <label className="auth-label">아이디</label>
            <input className="auth-input" type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder="아이디 입력" />

            <label className="auth-label">비밀번호</label>
            <input className="auth-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" />

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeLogin}>
            <label className="auth-label">인증번호 (6자리)</label>
            <input className="auth-input" type="text" value={authCode} maxLength={6}
              onChange={e => setAuthCode(e.target.value.replace(/\D/g, ''))}
              placeholder="숫자 6자리 입력" style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? '확인 중...' : '인증번호 로그인'}
            </button>
          </form>
        )}

        {error && <p className="auth-error">{error}</p>}

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'credentials' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Link href="/auth/register" className="auth-link">회원가입</Link>
                <Link href="/auth/find" className="auth-link">아이디/비밀번호 찾기</Link>
              </div>
              <button onClick={() => setMode('code')} className="auth-btn"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}>
                인증번호 로그인
              </button>
            </>
          ) : (
            <button onClick={() => setMode('credentials')} className="auth-link" style={{ textAlign: 'center' }}>
              ← 아이디/비밀번호 로그인
            </button>
          )}

          <button onClick={handleGuestMode} className="auth-btn"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}>
            비회원으로 진행하기
          </button>
        </div>
      </div>
    </div>
  );
}
