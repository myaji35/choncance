# 호스트 로그인 및 숙소 수정 가이드

## 시골할매 민박 호스트 정보

### 호스트 계정 정보
- **호스트 이름**: 김촌장
- **이메일**: `host@choncance.com`
- **숙소 ID**: `cmha6xjwi000igfvxwk9g4907`
- **숙소 이름**: 시골할매 민박

## 숙소 수정 방법 (3가지)

### 방법 1: 정상적인 로그인 흐름 (권장)

1. **홈페이지 접속**
   ```
   http://localhost:3010
   ```

2. **로그인 버튼 클릭**
   - 우측 상단의 "로그인" 버튼 클릭

3. **Clerk 로그인 화면에서 로그인**
   - 이메일: `host@choncance.com`
   - 비밀번호: Clerk에서 설정한 비밀번호 입력

   > 💡 **비밀번호를 모르는 경우:**
   > - "비밀번호를 잊으셨나요?" 클릭
   > - 또는 Clerk Dashboard에서 비밀번호 재설정

4. **호스트 대시보드로 이동**
   ```
   http://localhost:3010/host/dashboard
   ```

5. **숙소 목록에서 "시골할매 민박" 찾기**
   - "숙소 관리" 섹션에서 해당 숙소 확인

6. **편집 버튼 클릭**
   - 숙소 카드의 "편집" 버튼 클릭

### 방법 2: 직접 URL 접속 (빠른 방법)

로그인 후 직접 편집 페이지로 이동:
```
http://localhost:3010/host/properties/cmha6xjwi000igfvxwk9g4907/edit
```

### 방법 3: Admin으로 직접 수정

관리자 권한이 있다면:
```
http://localhost:3010/admin
```

## Clerk 비밀번호 확인/재설정 방법

### Clerk Dashboard에서 직접 확인

1. **Clerk Dashboard 접속**
   ```
   https://dashboard.clerk.com
   ```

2. **프로젝트 선택**
   - ChonCance 프로젝트 선택

3. **Users 메뉴**
   - 좌측 메뉴에서 "Users" 클릭

4. **호스트 사용자 찾기**
   - `host@choncance.com` 검색

5. **비밀번호 재설정**
   - 사용자 상세 페이지에서 "..." 메뉴
   - "Reset password" 선택

### 개발 환경에서 비밀번호 확인

현재 Clerk를 사용 중이므로, 비밀번호는 Clerk에서 관리됩니다.
개발 중이라면 Clerk Dashboard에서 확인하거나, 새로운 비밀번호로 재설정하세요.

## 스크립트로 호스트 정보 확인

언제든지 다음 명령어로 호스트 정보를 확인할 수 있습니다:

```bash
npx tsx scripts/find-host-info.ts
```

## 숙소 편집 페이지에서 수정 가능한 항목

- ✅ 숙소 이름
- ✅ 숙소 설명
- ✅ 주소 (주소, 시/도, 시/군/구)
- ✅ 가격 (1박 요금)
- ✅ **할인율 및 할인가** (새로 추가됨!)
- ✅ 최대 숙박 인원
- ✅ 반려동물 동반 가능 여부
- ✅ 최소/최대 숙박일수
- ✅ 이미지 (썸네일 및 추가 이미지)
- ✅ 호스트 스토리
- ✅ 편의시설
- ✅ 숙소 이용규칙
- ✅ 체크인/체크아웃 시간
- ✅ 태그 (테마 선택)

## 문제 해결

### 로그인이 안 되는 경우

1. **Clerk 인증 상태 확인**
   ```bash
   # 개발 서버 재시작
   pkill -f "next dev"
   npm run dev
   ```

2. **환경 변수 확인**
   ```bash
   # .env.local 파일에서 Clerk 키 확인
   cat .env.local | grep CLERK
   ```

### 권한 오류가 발생하는 경우

호스트 프로필이 제대로 연결되어 있는지 확인:
```bash
npx tsx scripts/find-host-info.ts
```

### 직접 데이터베이스에서 수정하려면

```bash
# Prisma Studio 실행
npx prisma studio

# 브라우저에서 http://localhost:5555 접속
# Property 테이블에서 "시골할매 민박" 검색 후 수정
```

## 추가 정보

- 호스트 가이드: `docs/HOST_GUIDE.md` (있다면)
- API 문서: 호스트 API는 `/api/host/properties/[id]` 엔드포인트 사용
- 할인 기능: 최근 추가된 기능으로 할인율(%)과 할인가를 설정할 수 있습니다

## 문의

문제가 지속되면:
1. 개발 서버 로그 확인 (`npm run dev` 실행 중인 터미널)
2. 브라우저 콘솔 확인 (F12 개발자 도구)
3. Clerk Dashboard에서 사용자 상태 확인
