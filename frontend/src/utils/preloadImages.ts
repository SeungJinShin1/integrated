// 대화창 캐릭터 스프라이트가 수 MB짜리 PNG라 처음 등장할 때
// 다운로드+디코딩 때문에 0.2~0.3초 늦게 나타납니다.
// 스테이지에 들어가기 전에 브라우저 캐시를 미리 데워서 팝인을 없앱니다.
// (게임 중 어차피 내려받을 이미지들이라 총 데이터 사용량은 동일합니다.)

const warmed = new Set<string>();

export function preloadImages(urls: readonly string[]): void {
  if (typeof window === 'undefined') return;
  const fresh = urls.filter(u => !!u && !warmed.has(u));
  if (fresh.length === 0) return;
  fresh.forEach(u => warmed.add(u));

  const load = () => {
    fresh.forEach(url => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    });
  };

  // 화면 렌더를 방해하지 않도록 브라우저가 한가할 때 시작
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load, { timeout: 2000 });
  } else {
    setTimeout(load, 300);
  }
}
