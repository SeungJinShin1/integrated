'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BG_IMAGES } from '@/data/assetMap';

const INTRO_SLIDES = [
  { image: BG_IMAGES.dataworld, text: '어딘가에, 특별한 세상이 있습니다...' },
  { image: BG_IMAGES.classroom, text: '우리 반에는 조금 특별한 친구가 있어요.' },
  { image: BG_IMAGES.breaktime, text: '그 친구는 나와 다른 방식으로 세상을 느끼고 있답니다.' },
  { image: BG_IMAGES.playground, text: '과연 우리는 서로를 이해하고 "원팀"이 될 수 있을까요?' },
];

export default function IntroPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide((prev) => {
          if (prev >= INTRO_SLIDES.length - 1) {
            router.push('/start');
            return prev;
          }
          return prev + 1;
        });
        setFadeIn(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  const handleSkip = () => {
    router.push('/start');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#020617' }}>
      {/* Background Image */}
      <img
        src={INTRO_SLIDES[currentSlide].image}
        alt="인트로"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      {/* Text */}
      <div style={{
        position: 'absolute', bottom: 120, left: 0, right: 0,
        textAlign: 'center', padding: '0 32px',
        opacity: fadeIn ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '20px 40px',
          maxWidth: 700,
        }}>
          <p style={{
            color: '#e2e8f0', fontSize: 20, fontWeight: 700, lineHeight: 1.6,
            fontFamily: "'Nanum Gothic', sans-serif",
          }}>
            {INTRO_SLIDES[currentSlide].text}
          </p>
        </div>
      </div>

      {/* Progress Dots */}
      <div style={{
        position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8,
      }}>
        {INTRO_SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === currentSlide ? 24 : 8, height: 8,
            borderRadius: 4,
            background: i === currentSlide ? '#6366f1' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Skip Button */}
      <button className="skip-btn" onClick={handleSkip}>
        건너뛰기 &gt;&gt;
      </button>
    </div>
  );
}
