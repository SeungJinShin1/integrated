#!/usr/bin/env bash
# ============================================================
# 블라인드 최종 검사 스크립트 (제20회 디지털교육연구대회)
#
# USB 산출물 전체에서 개인 식별 흔적(성명·학교명·지역명·계정 흔적)을
# 파일 내용 + 파일/폴더명 양쪽에서 검색한다.
#
# 사용법:  bash submission/check_blind.sh [검사대상폴더]
#          대상 생략 시 저장소 밖 ../USB_SUBMISSION 검사
#
# 개인 키워드는 submission/blind_keywords.txt 에서 읽는다.
#  - 이 파일은 .gitignore 에 등록되어 커밋되지 않는다 (키워드를
#    스크립트에 하드코딩해 커밋하면 그 자체가 블라인드 위반이므로).
#  - blind_keywords.example.txt 를 복사해 실제 값으로 채울 것.
# ============================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TARGET_INPUT="${1:-$REPO_ROOT/../USB_SUBMISSION}"
if [ ! -d "$TARGET_INPUT" ]; then
  echo "[중단] 검사 대상 폴더가 없습니다: $TARGET_INPUT"
  echo "       먼저 bash submission/package_usb.sh 를 실행하세요."
  exit 1
fi
TARGET="$(cd "$TARGET_INPUT" && pwd)"
echo "== 블라인드 검사 대상: $TARGET"

FAIL=0

# ---------- 1. 개인 키워드 로드 ----------
KEYFILE="$SCRIPT_DIR/blind_keywords.txt"
KEYWORDS=()
if [ -f "$KEYFILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    [ -n "$line" ] && KEYWORDS+=("$line")
  done < "$KEYFILE"
  echo "== 개인 키워드 ${#KEYWORDS[@]}개 로드 (blind_keywords.txt)"
else
  echo "[경고] $KEYFILE 이 없습니다 — 내장 일반 패턴만 검사합니다."
  echo "       blind_keywords.example.txt 를 blind_keywords.txt 로 복사해"
  echo "       출품자 성명·학교명·지역명 등을 채운 뒤 다시 실행하세요."
fi

# ---------- 2. 내장 일반 패턴 (배포·계정 흔적 — 커밋해도 안전한 패턴만) ----------
BUILTIN='vercel\.app|onrender\.com|github\.com|githubusercontent\.com|@gmail\.com|@naver\.com|@daum\.net|@hanmail\.net|@kakao\.com'

# 알려진 무해 매치: npm 패키지 메타데이터·공식 문서 링크 (개인 식별 정보 아님)
# → FAIL 로 치지 않고 INFO 로만 보고
ALLOW_LINE_RE='source/frontend/(package-lock\.json|README\.md|\.gitignore):'

# ---------- 3. 파일 내용 검사 (텍스트 파일만, 바이너리 자동 제외) ----------
echo
echo "== [1/2] 파일 내용 검사"

BUILTIN_HITS="$(grep -rInEI "$BUILTIN" "$TARGET" 2>/dev/null || true)"
BENIGN_HITS=""
REAL_HITS=""
if [ -n "$BUILTIN_HITS" ]; then
  BENIGN_HITS="$(printf '%s\n' "$BUILTIN_HITS" | grep -E "$ALLOW_LINE_RE" || true)"
  REAL_HITS="$(printf '%s\n' "$BUILTIN_HITS" | grep -vE "$ALLOW_LINE_RE" || true)"
fi
if [ -n "$REAL_HITS" ]; then
  echo "[발견] 배포·계정 흔적 패턴:"
  printf '%s\n' "$REAL_HITS"
  FAIL=1
fi
if [ -n "$BENIGN_HITS" ]; then
  n="$(printf '%s\n' "$BENIGN_HITS" | wc -l | tr -d ' ')"
  echo "[정보] 알려진 무해 매치 ${n}건 제외됨"
  echo "       (source/frontend/package-lock.json·README.md·.gitignore 안의"
  echo "        npm 메타데이터/공식 문서 링크 — 개인 식별 정보 아님)"
fi

if [ "${#KEYWORDS[@]}" -gt 0 ]; then
  GREP_ARGS=()
  for k in "${KEYWORDS[@]}"; do GREP_ARGS+=(-e "$k"); done
  KW_HITS="$(grep -rInFI "${GREP_ARGS[@]}" "$TARGET" 2>/dev/null || true)"
  if [ -n "$KW_HITS" ]; then
    echo "[발견] 개인 키워드:"
    printf '%s\n' "$KW_HITS"
    FAIL=1
  fi
fi

# ---------- 4. 파일·폴더명 검사 ----------
# 주의 1: 로컬 상위 경로(예: /c/Users/사용자명/...)가 키워드와 겹치는 오탐을
#         막기 위해 USB 폴더 기준 상대 경로로 검사한다.
# 주의 2: 이 환경의 grep 은 한글 패턴에 -i 를 붙이면 비정상 종료하므로
#         키워드 검사는 대소문자를 구분한다 (필요한 표기 변형은 키워드
#         파일에 각각 추가할 것).
echo
echo "== [2/2] 파일·폴더명 검사 (USB 폴더 기준 상대 경로)"

REL_NAMES="$(find "$TARGET" -mindepth 1 | sed "s|^$TARGET/||")"

NAME_BUILTIN="$(printf '%s\n' "$REL_NAMES" | grep -iE "$BUILTIN" || true)"
if [ -n "$NAME_BUILTIN" ]; then
  echo "[발견] 파일/폴더명에 배포·계정 흔적:"
  printf '%s\n' "$NAME_BUILTIN"
  FAIL=1
fi

if [ "${#KEYWORDS[@]}" -gt 0 ]; then
  NAME_KW="$(printf '%s\n' "$REL_NAMES" | grep -F "${GREP_ARGS[@]}" || true)"
  if [ -n "$NAME_KW" ]; then
    echo "[발견] 파일/폴더명에 개인 키워드:"
    printf '%s\n' "$NAME_KW"
    FAIL=1
  fi
fi

# ---------- 5. 결과 ----------
echo
if [ "$FAIL" -eq 0 ]; then
  echo "PASS — 개인 식별 흔적이 발견되지 않았습니다."
  exit 0
else
  echo "FAIL — 위 항목을 확인·제거한 뒤 다시 검사하세요."
  exit 1
fi
