#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[서식 5] 멀티미디어 교육자료 목록 CSV 생성 스크립트

frontend/public 아래의 git 추적 자산(= USB media 폴더에 들어가는 것과 동일한
파일 집합)을 스캔해 submission/멀티미디어_교육자료_목록.csv 를 생성한다.
- UTF-8 BOM 으로 저장 → 한글 엑셀에서 바로 열림
- 정렬: 그림 → 사진 → 소리 → 동영상 → 폰트 → 애니메이션 (규정 순서)
- 자료 설명은 파일명 기반 초안이므로 사용자가 다듬어 서식5에 옮겨 적으면 됨
  (파일명의 '승주', '성민'은 게임 캐릭터 이름 — 블라인드와 무관)

사용법: python submission/generate_media_list.py
"""
import csv
import os
import re
import subprocess
import sys

# ---------- git 추적 파일 목록 ----------
REPO_ROOT = subprocess.run(
    ["git", "rev-parse", "--show-toplevel"],
    capture_output=True, text=True, encoding="utf-8",
).stdout.strip()

raw = subprocess.run(
    ["git", "-C", REPO_ROOT, "ls-files", "-z", "--", "frontend/public"],
    capture_output=True,
).stdout
FILES = [p.decode("utf-8") for p in raw.split(b"\0") if p]

# ---------- 분류 규칙 ----------
TYPE_BY_EXT = {
    ".png": "그림", ".webp": "그림", ".ico": "그림",
    ".jpg": "사진", ".jpeg": "사진",
    ".mp3": "소리", ".wav": "소리",
    ".mp4": "동영상", ".webm": "동영상",
    ".gif": "애니메이션",
    # .svg 는 Next.js 템플릿 잔재(소프트웨어 미사용)이므로 목록에서 제외
}
TYPE_ORDER = {"그림": 0, "사진": 1, "소리": 2, "동영상": 3, "폰트": 4, "애니메이션": 5}

FOLDER_CONTEXT = {
    "hiddenpiece": "고학년(3~6학년) 탐험가 모드",
    "sprout": "저학년(1~2학년) 새싹 모드",
    "icons": "공통 UI 아이콘",
}

VOICE_PART = {
    "intro": "도입 안내", "complete": "완료 축하", "card": "카드 활동 안내",
    "squishy": "진정 호흡 활동 안내", "cert": "수료증 안내",
}
BGM_DESC = {
    "intro": "인트로 화면 배경음악",
    "low_grade": "저학년 모드 배경음악",
    "stage1_forest": "스테이지1 숲 배경음악",
    "stage2_sensory": "스테이지2 감각 체험 배경음악",
    "stage3_train": "스테이지3 기차 배경음악",
    "stage4_puzzle": "스테이지4 퍼즐 배경음악",
    "stage5_memory": "스테이지5 기억 배경음악",
    "stage6_finale": "스테이지6 피날레 배경음악",
}

CREDIT_IMAGE = "생성형 AI(Gemini) 직접 제작(개발)"
CREDIT_VOICE = "Typecast AI 보이스(확보, 증명서 참고)"
CREDIT_BGM = "생성형 AI(Gemini, Lyria 3) 직접 제작(개발)"
CREDIT_FONT = "네이버 나눔글꼴(OFL, 무료 사용)"


def describe_image(rel_path: str) -> str:
    """파일명에서 설명 키워드 초안 생성. 예:
    1_CH1_승주_여__기본_정면.png → '승주 여 기본 정면 (고학년(3~6학년) 탐험가 모드 일러스트)'"""
    folder = rel_path.split("/")[2] if rel_path.count("/") >= 2 else ""
    stem = os.path.splitext(os.path.basename(rel_path))[0]
    cleaned = re.sub(r"^\d+_(CH\d+_)?", "", stem)      # 앞쪽 번호·차시 토큰 제거
    cleaned = re.sub(r"[_]+", " ", cleaned).strip()
    context = FOLDER_CONTEXT.get(folder, "")
    suffix = " 아이콘" if folder == "icons" else " 일러스트"
    return f"{cleaned} ({context}{suffix})" if context else cleaned


def describe_sound(rel_path: str) -> str:
    stem = os.path.splitext(os.path.basename(rel_path))[0]
    if "/audio/bgm/" in rel_path:
        return BGM_DESC.get(stem, f"{stem} 배경음악")
    if stem.startswith("voice_"):
        body = stem[len("voice_"):]
        ep = re.match(r"ep(\d)_(\w+)", body)
        if ep:
            part = VOICE_PART.get(ep.group(2), ep.group(2))
            return f"저학년 새싹 모드 에피소드{ep.group(1)} {part} 내레이션 음성"
        ending = re.match(r"ending_(\w+)", body)
        if ending:
            part = VOICE_PART.get(ending.group(1), ending.group(1))
            return f"저학년 새싹 모드 엔딩 {part} 내레이션 음성"
    return f"{stem} 음성"


def credit_for(rel_path: str, mtype: str) -> str:
    if mtype in ("그림", "사진"):
        return CREDIT_IMAGE
    if mtype == "소리":
        return CREDIT_BGM if "/audio/bgm/" in rel_path else CREDIT_VOICE
    return ""


def size_mb(path: str) -> str:
    mb = os.path.getsize(path) / (1024 * 1024)
    return f"{mb:.2f}" if mb >= 0.01 else "0.01"


# ---------- 행 수집 ----------
entries = []  # (type_order, rel_path, mtype, filename, size, desc, credit)
skipped = []
for rel in FILES:
    ext = os.path.splitext(rel)[1].lower()
    mtype = TYPE_BY_EXT.get(ext)
    if mtype is None:
        skipped.append(rel)
        continue
    abspath = os.path.join(REPO_ROOT, rel)
    if not os.path.isfile(abspath):
        print(f"[경고] git 추적 파일이 디스크에 없어 건너뜀: {rel}", file=sys.stderr)
        continue
    desc = describe_sound(rel) if mtype == "소리" else describe_image(rel)
    entries.append((TYPE_ORDER[mtype], rel, mtype, os.path.basename(rel),
                    size_mb(abspath), desc, credit_for(rel, mtype)))

entries.sort(key=lambda e: (e[0], e[1]))

# 파일명(basename) 충돌 시 상위 폴더 포함 표기로 전환
names = [e[3] for e in entries]
dupes = {n for n in names if names.count(n) > 1}
if dupes:
    print(f"[알림] 동일 파일명 존재 → 폴더 포함 표기 사용: {sorted(dupes)}")
    entries = [
        (o, rel, t, "/".join(rel.split("/")[2:]) if n in dupes else n, s, d, c)
        for (o, rel, t, n, s, d, c) in entries
    ]

# ---------- CSV 작성 ----------
OUT = os.path.join(REPO_ROOT, "submission", "멀티미디어_교육자료_목록.csv")
with open(OUT, "w", encoding="utf-8-sig", newline="") as fp:
    w = csv.writer(fp)
    w.writerow(["번호", "자료형태", "파일명", "크기(MB)", "자료 설명(키워드)", "비고(출처 등)"])
    no = 0
    for _, rel, mtype, name, size, desc, credit in entries:
        no += 1
        w.writerow([no, mtype, name, size, desc, credit])
    # 폰트 (웹폰트 CDN 로드 — 파일로는 포함되지 않음)
    for font_name, font_desc in [
        ("나눔고딕", "화면 전체 본문·제목 글꼴(웹폰트)"),
        ("나눔고딕코딩", "타이핑·코드 연출용 글꼴(웹폰트)"),
    ]:
        no += 1
        w.writerow([no, "폰트", font_name, "-", font_desc, CREDIT_FONT])

# ---------- 요약 ----------
by_type = {}
for _, _, mtype, *_ in entries:
    by_type[mtype] = by_type.get(mtype, 0) + 1
print(f"생성 완료: {OUT}")
for t, cnt in sorted(by_type.items(), key=lambda kv: TYPE_ORDER[kv[0]]):
    print(f"   {t}: {cnt}개")
print(f"   폰트: 2개 (나눔고딕, 나눔고딕코딩)")
print(f"   총 {no}행 (자산 {len(entries)}개 + 폰트 2개)")
if skipped:
    print(f"   목록 제외(미사용 svg 등): {len(skipped)}개 → {', '.join(os.path.basename(s) for s in skipped)}")
