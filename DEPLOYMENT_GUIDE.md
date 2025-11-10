# VINTEE 프로덕션 배포 가이드

## 배포 준비 완료 상태 ✅

**일자**: 2025-11-10
**빌드 상태**: ✅ 성공
**테스트 상태**: ✅ E2E 테스트 설정 완료
**반응형**: ✅ 모바일 최적화 완료

---

## 배포 전 최종 체크리스트

### ✅ 완료된 작업
1. **Playwright E2E 테스트 환경** - 설정 완료, 테스트 파일 작성
2. **성능 최적화** - 프로덕션 빌드 성공, TypeScript 에러 수정
3. **모바일 반응형** - AdvancedSearchBar 모바일 최적화 완료
4. **보안** - Suspense boundary 추가, 빌드 에러 수정

### 📋 배포 준비 상태
- [x] 프로덕션 빌드 성공
- [x] TypeScript 타입 체크 통과
- [x] 모바일 반응형 검증 완료
- [x] E2E 테스트 환경 구축
- [ ] 환경 변수 프로덕션 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 도메인 설정

---

## 다음 단계 권장사항

### 1. 환경 변수 설정 (필수)
프로덕션 배포 전 Vercel 또는 배포 플랫폼에서 환경 변수를 설정하세요:

```bash
# 필수 환경 변수
DATABASE_URL=                          # PostgreSQL 연결 문자열
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=     # Clerk 퍼블릭 키
CLERK_SECRET_KEY=                       # Clerk 시크릿 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=            # Toss Payments 클라이언트 키
TOSS_SECRET_KEY=                        # Toss Payments 시크릿 키
```

### 2. Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 배포
vercel --prod
```

### 3. 데이터베이스 마이그레이션

```bash
# 프로덕션 DB에 마이그레이션 실행
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# 초기 데이터 생성 (태그, 카테고리 등)
DATABASE_URL="your-production-db-url" npm run seed
```

### 4. 배포 후 테스트

프로덕션 배포 후 다음 항목들을 테스트하세요:
- [ ] 홈페이지 로딩
- [ ] 로그인/회원가입
- [ ] 숙소 검색 및 필터링
- [ ] 숙소 상세 페이지
- [ ] 예약 플로우
- [ ] 결제 기능 (테스트 모드)
- [ ] 모바일 반응형

---

## 성능 목표

### Lighthouse 점수
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### Core Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

자세한 배포 가이드는 프로젝트 문서를 참고하세요.
