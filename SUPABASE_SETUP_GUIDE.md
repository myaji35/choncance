# VINTEE Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 대시보드 접속
🔗 **https://supabase.com/dashboard**

- 로그인 (GitHub 계정 권장)

### 1.2 새 프로젝트 생성
1. **"New Project"** 버튼 클릭
2. Organization 선택 (없으면 자동 생성)

### 1.3 프로젝트 정보 입력
```
Name: VINTEE
Database Password: [안전한 비밀번호 설정 - 복사해두세요!]
Region: Northeast Asia (Seoul) - ap-northeast-2
Pricing Plan: Free (시작용)
```

⚠️ **중요**: Database Password는 반드시 안전한 곳에 저장하세요!

### 1.4 프로젝트 생성 완료 대기
- 약 2-3분 소요
- "Setting up project..." 메시지가 사라질 때까지 대기

---

## 2단계: API 설정 정보 수집

프로젝트가 생성되면 다음 정보를 수집해주세요:

### 2.1 API Keys 확인
**위치**: Project Settings → API

다음 정보를 복사하세요:

```
✅ Project URL: https://[PROJECT_ID].supabase.co
✅ anon public key: eyJhbGci... (긴 문자열)
✅ service_role key: eyJhbGci... (긴 문자열) - 선택사항
```

### 2.2 Database 연결 정보 확인
**위치**: Project Settings → Database → Connection String

**Connection string** 섹션에서:
1. **Mode**: "Session" 선택 (중요!)
2. **Connection string** 복사

형식 예시:
```
postgresql://postgres.xfchchvhwciaiwefgjgsg:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

⚠️ `[YOUR-PASSWORD]`를 실제 비밀번호로 교체하세요!

---

## 3단계: 정보 제공

다음 정보를 Claude에게 제공해주세요:

```
PROJECT_URL: https://[PROJECT_ID].supabase.co
ANON_KEY: eyJhbGci...
DATABASE_PASSWORD: [1.3에서 설정한 비밀번호]
```

또는 완성된 DATABASE_URL을 제공해주세요:
```
DATABASE_URL: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

---

## 다음 단계

정보를 제공하시면:
1. ✅ 환경 변수 자동 설정
2. ✅ Prisma 마이그레이션 실행
3. ✅ 초기 데이터 시딩
4. ✅ Supabase Auth 설정
5. ✅ GCP 재배포

모두 자동으로 진행됩니다!

---

## 트러블슈팅

### "Project creation failed"
- 다른 Region 선택 (Northeast Asia → Singapore)
- 브라우저 캐시 삭제 후 재시도

### "Database password too weak"
- 최소 8자 이상
- 대문자, 소문자, 숫자, 특수문자 포함

### "Connection string not found"
- 프로젝트 생성 완료 확인
- 페이지 새로고침

---

**준비되셨으면 위의 정보를 제공해주세요!** 🚀
