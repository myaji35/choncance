# Git 자동 커밋 스크립트 사용 가이드

## 📝 개요

하루 오전/오후 작업을 자동으로 Git에 커밋하는 스크립트입니다.

## 🚀 수동 실행

### 기본 사용법

```bash
# 현재 시간에 따라 자동으로 시간대 결정
./scripts/auto-commit.sh

# 특정 시간대 지정
./scripts/auto-commit.sh morning    # 오전 작업
./scripts/auto-commit.sh afternoon  # 오후 작업
./scripts/auto-commit.sh evening    # 저녁 작업
```

### 실행 과정

1. 변경된 파일을 자동으로 `git add`
2. 시간대와 변경 파일 정보가 포함된 커밋 메시지 생성
3. 커밋 생성
4. 푸시 여부 확인 (선택)

## ⏰ 자동 스케줄링 설정 (macOS/Linux)

### cron을 사용한 자동 실행

1. **crontab 편집**
   ```bash
   crontab -e
   ```

2. **스케줄 추가** (아래 내용 복사하여 붙여넣기)

```bash
# ChonCance 자동 커밋 스케줄
# 월~금 오전 11시 (오전 작업 마무리)
0 11 * * 1-5 cd /Users/gangseungsig/Documents/GitHub/choncance && ./scripts/auto-commit.sh morning && git push

# 월~금 오후 6시 (오후 작업 마무리)
0 18 * * 1-5 cd /Users/gangseungsig/Documents/GitHub/choncance && ./scripts/auto-commit.sh afternoon && git push

# 월~금 저녁 10시 (저녁 작업 마무리) - 선택사항
# 0 22 * * 1-5 cd /Users/gangseungsig/Documents/GitHub/choncance && ./scripts/auto-commit.sh evening && git push
```

3. **cron 형식 설명**
   ```
   분 시 일 월 요일 명령어
   0 11 * * 1-5  → 월~금 오전 11시
   0 18 * * 1-5  → 월~금 오후 6시
   ```

4. **저장 및 종료**
   - vim: `ESC` → `:wq` → `Enter`
   - nano: `Ctrl+X` → `Y` → `Enter`

### cron 확인

```bash
# 현재 설정된 cron 작업 확인
crontab -l

# cron 로그 확인 (macOS)
log show --predicate 'process == "cron"' --last 1h
```

### cron 삭제

```bash
# 모든 cron 작업 삭제
crontab -r

# 특정 작업만 삭제하려면 crontab -e로 편집 후 해당 라인 삭제
```

## 🔔 macOS 알림 추가 (선택사항)

커밋 시 macOS 알림을 받으려면 스크립트 끝에 추가:

```bash
# auto-commit.sh 파일 끝에 추가
osascript -e 'display notification "Git 자동 커밋이 완료되었습니다" with title "ChonCance"'
```

## 🍎 macOS 자동화 앱 사용 (GUI 방식)

### Automator를 사용한 스케줄링

1. **Automator 앱 열기**
   - Spotlight (⌘+Space) → "Automator" 검색

2. **새로운 Calendar Alarm 생성**
   - File → New
   - "Calendar Alarm" 선택

3. **셸 스크립트 액션 추가**
   - "Run Shell Script" 액션 드래그
   - Shell: `/bin/bash`
   - 스크립트 내용:
     ```bash
     cd /Users/gangseungsig/Documents/GitHub/choncance
     ./scripts/auto-commit.sh morning && git push
     ```

4. **저장 및 스케줄 설정**
   - File → Save
   - 캘린더 앱에서 반복 일정 설정

## 🪟 Windows 작업 스케줄러 (Windows 사용자)

### PowerShell 스크립트 생성

`scripts/auto-commit.ps1` 파일 생성:

```powershell
# ChonCance Auto Commit (Windows)
cd "C:\Users\YourUsername\Documents\GitHub\choncance"

$timeOfDay = if ((Get-Date).Hour -lt 12) { "morning" }
             elseif ((Get-Date).Hour -lt 18) { "afternoon" }
             else { "evening" }

bash -c "./scripts/auto-commit.sh $timeOfDay && git push"
```

### 작업 스케줄러 설정

1. "작업 스케줄러" 열기 (Windows 검색)
2. "기본 작업 만들기" 클릭
3. 트리거: 매일, 오전 11시 / 오후 6시
4. 동작: PowerShell 스크립트 실행

## 📊 커밋 메시지 형식

자동 생성되는 커밋 메시지 예시:

```
🌅 chore: 2025-10-28 오전 작업 커밋

작업 시간: 2025-10-28 11:00
변경된 파일: 15개

주요 변경사항:
M  src/app/api/bookings/route.ts
M  src/components/booking/booking-widget.tsx
A  src/app/booking/success/page.tsx
A  src/app/api/payments/confirm/route.ts
...

🤖 Generated with Auto-commit Script
```

## ⚙️ 커스터마이징

### 푸시 없이 커밋만 하기

```bash
# auto-commit.sh 수정
# read -p 부분을 주석 처리하고
# git push 라인 삭제
```

### 특정 파일 제외하기

`.gitignore`에 제외할 파일 추가:

```
# .gitignore
.env.local
*.log
node_modules/
```

### 커밋 메시지 커스터마이징

`auto-commit.sh` 파일의 `COMMIT_MSG` 변수 수정

## 🐛 문제 해결

### Permission denied 에러
```bash
chmod +x scripts/auto-commit.sh
```

### cron이 실행되지 않음
```bash
# cron 서비스 상태 확인 (Linux)
sudo service cron status

# macOS는 기본적으로 cron 활성화되어 있음
```

### Git 인증 문제
```bash
# SSH 키 설정 또는 Personal Access Token 사용
git config --global credential.helper osxkeychain  # macOS
```

## 📚 참고 자료

- [Cron 표현식 생성기](https://crontab.guru/)
- [Git 커밋 메시지 컨벤션](https://www.conventionalcommits.org/)
- [macOS Automator 가이드](https://support.apple.com/guide/automator/)

## 💡 팁

1. **테스트 먼저**: 스케줄 설정 전에 수동으로 몇 번 실행해보세요
2. **푸시 확인**: 자동 푸시 전에 항상 코드 리뷰하는 습관을 들이세요
3. **브랜치 전략**: 자동 커밋은 개발 브랜치에서만 사용하는 것을 권장합니다
4. **백업**: 중요한 변경사항은 수동으로도 커밋하세요

---

**작성일**: 2025-10-28
**업데이트**: 토스페이먼츠 결제 연동 완료 후 추가됨
