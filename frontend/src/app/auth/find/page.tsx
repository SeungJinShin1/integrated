'use client';

import { useState } from 'react';
import { BG_IMAGES } from '@/data/assetMap';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FindAccountPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('올바른 이메일을 입력해 주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/find-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.detail || '해당 이메일로 가입된 계정이 없습니다.');
      }
    } catch {
      setError('서버 연결 오류');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
      <div className="auth-overlay" />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {sent ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
            <h1 className="auth-title">이메일 발송 완료</h1>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>
              {email}으로 아이디와 임시 비밀번호를 보내드렸습니다.<br />
              이메일을 확인해 주세요.
            </p>
            <Link href="/auth/login" className="auth-btn" style={{ display: 'block', textDecoration: 'none' }}>
              로그인 하러 가기
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">아이디/비밀번호 찾기</h1>
            <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
              가입 시 등록한 이메일을 입력하면<br />아이디와 임시 비밀번호를 보내드립니다.
            </p>
            <form onSubmit={handleSubmit}>
              <label className="auth-label">이메일</label>
              <input className="auth-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="가입 이메일 입력" />

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? '전송 중...' : '이메일로 보내기'}
              </button>
            </form>
            {error && <p className="auth-error">{error}</p>}
            <div style={{ marginTop: 16 }}>
              <Link href="/auth/login" className="auth-link">← 로그인으로 돌아가기</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
