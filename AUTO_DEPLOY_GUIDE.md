# 자동 배포 가이드 (Auto Deploy Guide)

## 개요
매일 저녁 10시(22:00)에 자동으로 변경사항을 커밋하고 배포하는 시스템입니다.

## 설정된 파일들

### 1. 배포 스크립트
- **경로**: `/Users/gangseungsig/Documents/GitHub/choncance/scripts/auto-deploy-10pm.sh`
- **역할**: 변경사항 확인, 커밋, 푸시, 배포 실행
- **로그 위치**: `/Users/gangseungsig/Documents/GitHub/choncance/logs/auto-deploy-YYYYMMDD.log`

### 2. LaunchD Agent
- **경로**: `/Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist`
- **역할**: 매일 22:00에 자동 실행
- **상태 로그**:
  - 표준 출력: `logs/launchd-out.log`
  - 에러 로그: `logs/launchd-error.log`

## 명령어

### 상태 확인
```bash
# LaunchD 에이전트 상태 확인
launchctl list | grep choncance

# 로그 확인 (실시간)
tail -f /Users/gangseungsig/Documents/GitHub/choncance/logs/launchd-out.log

# 배포 로그 확인
tail -f /Users/gangseungsig/Documents/GitHub/choncance/logs/auto-deploy-$(date +%Y%m%d).log
```

### 수동 실행
```bash
# 자동 배포 스크립트 수동 실행
bash /Users/gangseungsig/Documents/GitHub/choncance/scripts/auto-deploy-10pm.sh
```

### LaunchD 관리
```bash
# LaunchD 에이전트 언로드 (비활성화)
launchctl unload /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist

# LaunchD 에이전트 로드 (활성화)
launchctl load /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist

# LaunchD 에이전트 재시작
launchctl unload /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
launchctl load /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
```

### 실행 시간 변경
1. plist 파일 편집:
```bash
nano /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
```

2. Hour 값 변경 (0-23):
```xml
<key>Hour</key>
<integer>22</integer>  <!-- 원하는 시간으로 변경 -->
```

3. LaunchD 재시작:
```bash
launchctl unload /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
launchctl load /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
```

## 작동 방식

1. **매일 22:00에 자동 실행**
2. **변경사항 확인**: `git status` 실행
3. **변경사항이 있으면**:
   - 모든 변경사항 추가 (`git add .`)
   - 타임스탬프와 함께 커밋 생성
   - 원격 저장소에 푸시
4. **배포 실행**: `deploy.sh` 스크립트 실행
5. **로그 저장**: 모든 작업 내역 로그 파일에 기록
6. **로그 정리**: 7일 이상 된 로그 파일 자동 삭제

## 문제 해결

### 배포가 실행되지 않는 경우
```bash
# LaunchD 상태 확인
launchctl list | grep choncance

# 에러 로그 확인
cat /Users/gangseungsig/Documents/GitHub/choncance/logs/launchd-error.log

# plist 파일 문법 검사
plutil -lint /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
```

### 권한 문제
```bash
# 스크립트 실행 권한 추가
chmod +x /Users/gangseungsig/Documents/GitHub/choncance/scripts/auto-deploy-10pm.sh

# logs 디렉토리 생성
mkdir -p /Users/gangseungsig/Documents/GitHub/choncance/logs
```

### Git 인증 문제
자동 배포에서 Git 푸시가 실패하는 경우, SSH 키 또는 credential helper 설정이 필요할 수 있습니다:
```bash
# SSH 키 설정 확인
ssh -T git@github.com

# 또는 credential helper 사용
git config --global credential.helper osxkeychain
```

## 비활성화 방법
자동 배포를 중지하려면:
```bash
launchctl unload /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
rm /Users/gangseungsig/Library/LaunchAgents/com.choncance.autodeploy.plist
```

## 주의사항
- 자동 배포는 **매일 22:00**에 실행됩니다
- **변경사항이 있을 때만** 커밋과 배포가 실행됩니다
- 로그는 **7일간 보관**됩니다
- 컴퓨터가 **켜져 있어야** 자동 배포가 실행됩니다
- 배포 실패 시 에러 로그를 확인하세요
