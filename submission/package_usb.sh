#!/usr/bin/env bash
# ============================================================
# USB 제출 폴더 생성 스크립트 (제20회 디지털교육연구대회)
#
# 사용법:  bash submission/package_usb.sh [출력경로]
#          출력경로 생략 시 저장소 밖 ../USB_SUBMISSION 에 생성
#
# 원칙:
#  - source/ 는 `git archive HEAD` 로 "git이 추적하는 파일만" 추출
#    → .env, 로컬 실험 파일, 메모 등이 구조적으로 섞일 수 없고
#      USB의 source가 배포본(GitHub)과 정확히 일치함이 보장됨
#  - media/ 는 git 추적 자산만 복사 (서식5 목록과 1:1 일치)
#  - document/ 는 사용자가 직접 채우는 폴더 (재실행해도 보존됨)
#  - 원본 저장소는 어떤 경우에도 수정하지 않음 (밖으로 복사만 수행)
# ============================================================
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

DEST_INPUT="${1:-$REPO_ROOT/../USB_SUBMISSION}"
mkdir -p "$DEST_INPUT"
DEST="$(cd "$DEST_INPUT" && pwd)"

# 출력 폴더가 저장소 내부면 중단 (원본 훼손·재귀 복사 방지)
case "$DEST/" in
  "$REPO_ROOT"/*)
    echo "[중단] 출력 폴더는 저장소 밖이어야 합니다: $DEST"
    exit 1;;
esac

echo "== USB 제출 폴더 생성 시작 → $DEST"
echo

# ---------- 0. 사전 점검 ----------
# 0-1. 커밋되지 않은 변경 경고 (source/는 HEAD 기준으로 추출되므로)
if [ -n "$(git status --porcelain)" ]; then
  echo "[경고] 커밋되지 않은 변경이 있습니다. source/ 는 HEAD(마지막 커밋) 기준입니다:"
  git status --short
  echo
fi

# 0-2. git 추적 파일 중 자격증명 의심 파일 검사 → 발견 시 즉시 중단·보고
SUSPECT="$(git ls-files | grep -iE 'service.?account.*\.json|credential|secret|\.pem$|\.key$|(^|/)\.env' || true)"
if [ -n "$SUSPECT" ]; then
  echo "=================================================================="
  echo "[보안 경고] git에 자격증명 의심 파일이 추적되고 있습니다!"
  echo "$SUSPECT"
  echo "공개 저장소 보안 사고일 수 있습니다. 즉시 확인하세요. 패키징을 중단합니다."
  echo "=================================================================="
  exit 1
fi

# ---------- 1. 폴더 구조 ----------
# document/ 는 보존, 나머지는 항상 새로 생성
rm -rf "$DEST/media" "$DEST/program" "$DEST/source"
mkdir -p "$DEST/document" \
         "$DEST/media/image" "$DEST/media/movie" "$DEST/media/sound" \
         "$DEST/program" "$DEST/source"

# document/ 안내문 — 폴더가 완전히 비어 있을 때만 생성.
# 사용자가 document/ 를 직접 관리하기 시작한 뒤에는 일절 손대지 않는다.
if [ -z "$(ls -A "$DEST/document" 2>/dev/null)" ]; then
cat > "$DEST/document/_여기에_넣을_것.txt" <<'EOF'
[document 폴더에 직접 넣어야 하는 파일]

1. 연구보고서 4종
   - 연구보고서.hwp / 연구보고서.pdf
   - 블라인드본.hwp / 블라인드본.pdf (시도명·학교명·직위·성명 삭제본)

2. 주요 화면 스크린샷
   - 작품명-1.jpg ~ 작품명-N.jpg
   - 해상도 1024×768 이상

※ 이 안내문 파일은 USB에 최종 복사하기 전에 삭제하세요.
EOF
fi

# ---------- 2. media/image : git 추적 이미지 (frontend/public/assets 하위) ----------
# 소프트웨어가 실제 사용하는 git 추적 이미지만 복사 (하위폴더 구조 유지)
IMG_COUNT=0
while IFS= read -r -d '' f; do
  case "$f" in
    *.png|*.webp|*.ico) ;;
    *) continue ;;
  esac
  if [ ! -f "$f" ]; then
    echo "[경고] git 추적 파일이 디스크에 없어 건너뜁니다: $f"
    continue
  fi
  rel="${f#frontend/public/assets/}"
  mkdir -p "$DEST/media/image/$(dirname "$rel")"
  cp "$f" "$DEST/media/image/$rel"
  IMG_COUNT=$((IMG_COUNT + 1))
done < <(git ls-files -z -- frontend/public/assets)

# ---------- 3. media/sound : git 추적 mp3 (음성 + BGM) ----------
# 평탄화 복사하되 파일명 충돌 시 중단
SND_COUNT=0
while IFS= read -r -d '' f; do
  case "$f" in
    *.mp3) ;;
    *) continue ;;
  esac
  if [ ! -f "$f" ]; then
    echo "[경고] git 추적 파일이 디스크에 없어 건너뜁니다: $f"
    continue
  fi
  base="$(basename "$f")"
  if [ -e "$DEST/media/sound/$base" ]; then
    echo "[중단] media/sound 파일명 충돌: $base"
    exit 1
  fi
  cp "$f" "$DEST/media/sound/$base"
  SND_COUNT=$((SND_COUNT + 1))
done < <(git ls-files -z -- frontend/public)

# media/movie : 동영상 자산 없음 — 권고 폴더 구조 유지를 위한 빈 폴더

# ---------- 4. program/ : 실행 런처 ----------
cp "$REPO_ROOT/submission/launcher/index.html" "$DEST/program/index.html"

# ---------- 5. source/ : git 추적 파일만 추출 ----------
git archive HEAD | tar -x -C "$DEST/source"

# 제출 제외 파일 제거 (개발 보조 문서·패키징 산출물 — 실행 코드 아님)
rm -f "$DEST/source/frontend/CLAUDE.md" \
      "$DEST/source/frontend/AGENTS.md" \
      "$DEST/source/frontend/ts_out.txt" \
      "$DEST/source/frontend/ts_error.txt"
rm -rf "$DEST/source/submission"

# 로컬 실행 가이드를 source 최상위에 포함 (런처에서 안내하는 문서)
cp "$REPO_ROOT/submission/README_실행방법.md" "$DEST/source/README_실행방법.md"

# ---------- 6. 자체 검증 ----------
echo
echo "== 자체 검증"
if find "$DEST" -name '.env*' | grep -q .; then
  echo "[실패] .env 파일이 포함되었습니다:"
  find "$DEST" -name '.env*'
  exit 1
fi
if find "$DEST" -type d -name '.git' | grep -q .; then
  echo "[실패] .git 디렉토리가 포함되었습니다."
  exit 1
fi
for excluded in frontend/CLAUDE.md frontend/AGENTS.md frontend/ts_out.txt frontend/ts_error.txt submission; do
  if [ -e "$DEST/source/$excluded" ]; then
    echo "[실패] 제외 대상이 남아 있습니다: source/$excluded"
    exit 1
  fi
done
echo "  .env 없음 / .git 디렉토리 없음 / 제외 목록 적용 확인 — 통과"

# ---------- 7. 요약 ----------
echo
echo "== 생성 완료: $DEST"
for d in document media/image media/movie media/sound program source; do
  n="$(find "$DEST/$d" -type f | wc -l | tr -d ' ')"
  printf '   %-13s %5s개 파일\n' "$d" "$n"
done
echo "   (media/image ${IMG_COUNT}개, media/sound ${SND_COUNT}개 복사됨)"
echo "   총 용량: $(du -sh "$DEST" | cut -f1)"
echo
echo "[남은 일 1] document/ 폴더에 연구보고서(HWP·PDF, 블라인드본 포함)와"
echo "            작품명-N.jpg 스크린샷(1024×768 이상)을 직접 넣으세요."
echo "[남은 일 2] program/index.html 의 심사용 계정 자리표시자를 채웠는지 확인하세요."
echo "[남은 일 3] bash submission/check_blind.sh 로 블라인드 검사를 실행하세요."
