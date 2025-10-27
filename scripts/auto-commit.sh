#!/bin/bash

# ChonCance 자동 커밋 스크립트
# 사용법: ./scripts/auto-commit.sh [morning|afternoon|evening]

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")/.." || exit 1

# 시간대 인자 받기
TIME_PERIOD="${1:-auto}"

# 현재 시간 기반으로 시간대 자동 결정
if [ "$TIME_PERIOD" == "auto" ]; then
    HOUR=$(date +%H)
    if [ "$HOUR" -lt 12 ]; then
        TIME_PERIOD="morning"
    elif [ "$HOUR" -lt 18 ]; then
        TIME_PERIOD="afternoon"
    else
        TIME_PERIOD="evening"
    fi
fi

# 시간대에 따른 이모지와 메시지
case $TIME_PERIOD in
    morning)
        EMOJI="🌅"
        TIME_MSG="오전"
        ;;
    afternoon)
        EMOJI="☀️"
        TIME_MSG="오후"
        ;;
    evening)
        EMOJI="🌙"
        TIME_MSG="저녁"
        ;;
    *)
        EMOJI="💻"
        TIME_MSG="작업"
        ;;
esac

# 날짜 가져오기
DATE=$(date +"%Y-%m-%d")
DATETIME=$(date +"%Y-%m-%d %H:%M")

# Git 상태 확인
if [ -z "$(git status --porcelain)" ]; then
    echo "변경사항이 없습니다."
    exit 0
fi

# 변경된 파일 목록 가져오기
CHANGED_FILES=$(git status --short | head -n 10)
FILE_COUNT=$(git status --short | wc -l | tr -d ' ')

# 커밋 메시지 생성
COMMIT_MSG="${EMOJI} chore: ${DATE} ${TIME_MSG} 작업 커밋

작업 시간: ${DATETIME}
변경된 파일: ${FILE_COUNT}개

주요 변경사항:
${CHANGED_FILES}

🤖 Generated with Auto-commit Script"

echo "===== Git 자동 커밋 ====="
echo "시간대: ${TIME_MSG}"
echo "날짜: ${DATE}"
echo "변경된 파일: ${FILE_COUNT}개"
echo ""

# Git add all
echo "📝 파일 추가 중..."
git add .

# Git commit
echo "💾 커밋 생성 중..."
git commit -m "$COMMIT_MSG"

# Git push 여부 확인
read -p "🚀 원격 저장소에 푸시하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 푸시 중..."
    git push
    echo "✅ 푸시 완료!"
else
    echo "⏸️  푸시를 건너뛰었습니다."
    echo "   나중에 'git push'로 푸시할 수 있습니다."
fi

echo ""
echo "✨ 자동 커밋 완료!"
