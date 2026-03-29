'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BG_IMAGES } from '@/data/assetMap';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !email) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPw) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!email.includes('@')) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    setLoading(true);
    const result = await register(username, password, email);
    setLoading(false);

    if (result.success) {
      setAuthCode(result.message);
      setSuccess('회원가입이 완료되었습니다!');
    } else {
      setError(result.message);
    }
  };

  if (success && authCode) {
    return (
      <div className="auth-container" style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
        <div className="auth-overlay" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 className="auth-title">가입 완료!</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            아래 인증번호를 학생들에게 배포하세요.
          </p>
          <div style={{
            background: 'rgba(0, 245, 212, 0.1)',
            border: '2px solid #00f5d4',
            borderRadius: 16, padding: '20px',
            marginBottom: 24,
          }}>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>학급 인증번호</p>
            <p style={{
              fontSize: 36, fontWeight: 800, letterSpacing: 8,
              color: '#00f5d4'
            }}>
              {authCode}
            </p>
          </div>
          <button className="auth-btn" onClick={() => router.push('/auth/login')}>
            로그인 하러 가기 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
      <div className="auth-overlay" />
      <div className="auth-card">
        <h1 className="auth-title">교사 회원가입</h1>
        <form onSubmit={handleRegister}>
          <label className="auth-label">아이디</label>
          <input className="auth-input" type="text" value={username}
            onChange={e => setUsername(e.target.value)} placeholder="아이디 입력" />

          <label className="auth-label">비밀번호 (영문+숫자 8자 이상)</label>
          <input className="auth-input" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" />

          <label className="auth-label">비밀번호 확인</label>
          <input className="auth-input" type="password" value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)} placeholder="비밀번호 다시 입력" />

          <label className="auth-label">이메일</label>
          <input className="auth-input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="이메일 주소 입력" />

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/auth/login" className="auth-link">← 로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
