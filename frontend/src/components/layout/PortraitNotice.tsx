'use client';

/**
 * Shows a "rotate to landscape" prompt when a touch device (tablet/phone)
 * is held in portrait orientation. Hidden by CSS media queries on desktops
 * and on tablets already in landscape, so this component is safe to render
 * globally from the root layout.
 */
export default function PortraitNotice() {
  return (
    <div className="portrait-notice" aria-hidden="true">
      <div className="portrait-notice-inner">
        <div className="portrait-notice-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tablet body */}
            <rect
              x="22"
              y="12"
              width="76"
              height="96"
              rx="8"
              stroke="#fbbf24"
              strokeWidth="4"
              fill="rgba(251, 191, 36, 0.08)"
            />
            <circle cx="60" cy="100" r="3" fill="#fbbf24" />
            {/* Rotation arrow */}
            <path
              d="M 42 58 A 18 18 0 1 1 78 58"
              stroke="#fde68a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 78 58 L 74 52 M 78 58 L 84 56"
              stroke="#fde68a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <h2>화면을 가로로 돌려 주세요</h2>
        <p>이 학습은 태블릿을 가로로 놓았을 때 가장 잘 보여요.</p>
      </div>
    </div>
  );
}
