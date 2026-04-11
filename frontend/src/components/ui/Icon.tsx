'use client';

import { ICON_IMAGES } from '@/data/assetMap';
import { CSSProperties } from 'react';

export type IconName = keyof typeof ICON_IMAGES;

interface IconProps {
  name: IconName;
  size?: number;
  alt?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * 자체 생성한 아이콘 PNG를 표시하는 단순 래퍼.
 * react-icons 등 외부 아이콘 라이브러리를 모두 대체합니다.
 */
export default function Icon({ name, size = 20, alt, style, className }: IconProps) {
  const src = ICON_IMAGES[name];
  return (
    <img
      src={src}
      alt={alt ?? name}
      width={size}
      height={size}
      draggable={false}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        objectFit: 'contain',
        verticalAlign: 'middle',
        userSelect: 'none',
        ...style,
      }}
      className={className}
    />
  );
}
