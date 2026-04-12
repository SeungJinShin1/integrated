'use client';

import { useEffect } from 'react';

interface BadgePopupProps {
  badgeSrc: string;
  label: string;
  onClose: () => void;
}

/**
 * 스테이지 클리어 시 획득한 배지를 화면 가운데에 크게 보여주는 팝업.
 * 배경 딤 + 배지 이미지(160px) + 「~의 배지를 획득하였습니다!」 문구 + 닫기 버튼.
 */
export default function BadgePopup({ badgeSrc, label, onClose }: BadgePopupProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          animation: 'successScale 0.5s ease',
        }}
      >
        {/* 배지 이미지 — 크고 뚜렷하게 */}
        <img
          src={badgeSrc}
          alt={label}
          style={{
            width: 'clamp(140px, 22vw, 200px)',
            height: 'clamp(140px, 22vw, 200px)',
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 40px rgba(99, 102, 241, 0.55))',
          }}
          draggable={false}
        />

        {/* 라벨 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: 22,
            padding: '18px 36px',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(20px, 2.8vw, 28px)',
              fontWeight: 900,
              color: '#1e293b',
              lineHeight: 1.4,
            }}
          >
            {label}를 획득하였습니다!
          </p>
        </div>

        {/* 계속 버튼 */}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 8,
            padding: '14px 40px',
            borderRadius: 30,
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: 'white',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            fontFamily: "'Nanum Gothic', sans-serif",
          }}
        >
          계속하기
        </button>
      </div>
    </div>
  );
}
