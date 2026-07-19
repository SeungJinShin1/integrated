'use client';

/**
 * 멀티미디어 자료 출처 표기 (화면 하단 중앙 고정).
 * 연구대회 규정: 화면에서 멀티미디어 자료의 출처가 확인 가능해야 함.
 * pointerEvents: 'none' — 화면 클릭 진행 UX를 방해하지 않음.
 */
export default function CreditNotice() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', bottom: 8, left: 0, right: 0, zIndex: 1000,
        pointerEvents: 'none', textAlign: 'center',
      }}
    >
      <span style={{
        display: 'inline-block', maxWidth: '92vw',
        background: 'rgba(10, 15, 30, 0.45)',
        borderRadius: 10, padding: '4px 12px',
        color: 'rgba(255, 255, 255, 0.75)', fontSize: 11, lineHeight: 1.5,
      }}>
        이미지·배경음악: 생성형 AI로 직접 제작 | 음성: Typecast AI 보이스(라이선스 확보) | 폰트: 나눔고딕(OFL)
      </span>
    </div>
  );
}
