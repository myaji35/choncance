# ChonCance 로컬 개발 서버 정보

## 프로젝트 식별
- **프로젝트명**: ChonCance (촌캉스)
- **프로젝트 경로**: `/Users/gangseungsig/Documents/GitHub/choncance`
- **포트**: `3000`

## 로컬 개발 서버

### 시작 명령어
```bash
cd /Users/gangseungsig/Documents/GitHub/choncance
npm run dev
```

### 접속 URL
- **로컬**: http://localhost:3000
- **네트워크**: http://0.0.0.0:3000

## 프로덕션 서버
- **URL**: https://choncance-646626710380.asia-northeast3.run.app
- **플랫폼**: Google Cloud Run
- **프로젝트 ID**: dauntless-gate-476607-b7
- **리전**: asia-northeast3

## 데이터베이스
- **로컬**: PostgreSQL (로컬 개발 DB)
- **프로덕션**: Cloud SQL (choncance-db)
- **비밀번호**: socdnjs!00

## 주요 경로
- 홈: http://localhost:3000/
- 숙소 탐색: http://localhost:3000/explore
- 호스트 되기: http://localhost:3000/become-a-host
- 로그인: http://localhost:3000/login
- 회원가입: http://localhost:3000/signup

## 확인 방법
터미널에서 현재 실행 중인 포트 확인:
```bash
lsof -i :3000
```

ChonCance 프로젝트 디렉토리 확인:
```bash
pwd
# 출력: /Users/gangseungsig/Documents/GitHub/choncance
```

## 다른 프로젝트와 구분
1. **디렉토리 경로 확인**: 반드시 `/choncance` 디렉토리에서 작업
2. **package.json 확인**: `"name": "choncance"`
3. **포트 중복 방지**: 다른 프로젝트가 3000번 포트 사용 시 종료 필요

---
**⚠️ 중요**: 항상 ChonCance 프로젝트 디렉토리에서 작업하고 있는지 확인하세요!
