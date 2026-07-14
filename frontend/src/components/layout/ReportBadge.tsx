'use client';

/**
 * 연구대회 제출용 표기 배지 (화면 우상단 고정).
 * 연구보고서 제목과 대상학년을 표시한다.
 * 제목이 이미 h1으로 크게 표시되는 화면(/start)에서는
 * showTitle={false}로 대상학년만 표시한다.
 * pointerEvents: 'none' — 화면 아무 곳 클릭으로 진행하는 UX를 방해하지 않음.
 */
export default function ReportBadge({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', top: 16, right: 16, zIndex: 1000,
        pointerEvents: 'none',
        background: 'rgba(10, 15, 30, 0.55)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 12, padding: '8px 14px',
        textAlign: 'right',
      }}
    >
      {showTitle && (
        <div style={{
          color: 'rgba(255, 255, 255, 0.92)', fontSize: 13, fontWeight: 800,
          marginBottom: 3, letterSpacing: 0.5,
        }}>
          히든피스: 우리 반 보물찾기
        </div>
      )}
      <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12, fontWeight: 700 }}>
        대상: 초등학교 1~6학년
      </div>
    </div>
  );
}
