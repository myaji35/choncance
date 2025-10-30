# Trello 연동 설정 가이드

## 🚀 빠른 설정 (5분)

### 1단계: Trello API 키 발급

1. **Trello Power-Ups 페이지 방문**
   - https://trello.com/power-ups/admin 접속

2. **새 Power-Up 생성**
   - "New" 버튼 클릭
   - 이름: "ChonCance Integration" (또는 원하는 이름)

3. **API Key 복사**
   - 생성된 Power-Up에서 API Key 확인 및 복사

4. **Token 생성**
   - "Token" 링크 클릭
   - "Allow" 버튼 클릭하여 권한 승인
   - 생성된 Token 복사

### 2단계: 환경 변수 설정

`.env.local` 파일에 다음 추가:

```bash
# Trello API 인증
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here
TRELLO_BOARD_ID=XYvc0OFq  # 촌캉스 보드 ID
```

### 3단계: List ID 확인

터미널에서 실행:

```bash
npm run trello:setup
```

출력된 List ID들을 `.env.local`에 복사하여 추가:

```bash
# 예약 관리 List IDs
TRELLO_NEW_BOOKINGS_LIST_ID=list_id_1
TRELLO_CONFIRMED_LIST_ID=list_id_2
TRELLO_CHECKED_IN_LIST_ID=list_id_3
TRELLO_COMPLETED_LIST_ID=list_id_4
TRELLO_CANCELLED_LIST_ID=list_id_5
```

### 4단계: 연동 테스트

```bash
npm run trello:test
```

테스트 카드가 생성되고 URL이 출력되면 성공! 🎉

---

## 📋 Trello 보드 구조 권장사항

### 예약 관리용 리스트

다음 리스트들을 Trello 보드에 생성하는 것을 추천합니다:

1. **새 예약** (New Bookings)
   - 새로 들어온 예약 요청
   - 자동으로 카드 생성됨

2. **확정됨** (Confirmed)
   - 호스트가 승인한 예약
   - 결제 완료된 예약

3. **체크인 완료** (Checked In)
   - 고객이 체크인한 예약
   - 현재 진행 중인 숙박

4. **완료** (Completed)
   - 체크아웃 완료
   - 리뷰 대기 중

5. **취소됨** (Cancelled)
   - 취소 또는 환불된 예약

### 개발 작업 관리용 리스트 (선택사항)

1. **Backlog** - 향후 작업 목록
2. **To Do** - 이번 주 작업
3. **In Progress** - 진행 중인 작업
4. **Review** - 리뷰 대기
5. **Done** - 완료된 작업

---

## 🔍 작동 확인

### 예약 생성 시

1. 사용자가 예약 생성
2. 자동으로 Trello 카드 생성
3. 카드 내용:
   - 제목: `[예약ID 8자리] 숙소명`
   - 설명: 예약 상세 정보 (게스트, 날짜, 금액 등)
   - Due Date: 체크인 날짜
   - 라벨: 금액대별 색상
     - 빨강: 50만원 이상
     - 주황: 30만원 이상
     - 노랑: 15만원 이상
     - 초록: 15만원 미만

### 예약 상태 변경 시

예약 상태가 변경되면 자동으로 해당 리스트로 카드 이동:
- `PENDING` → 새 예약
- `CONFIRMED` → 확정됨
- `CHECKED_IN` → 체크인 완료
- `COMPLETED` → 완료
- `CANCELLED` → 취소됨

---

## ⚙️ 추가 설정 (선택사항)

### 개발 작업을 Trello에 동기화

```bash
# IMPROVEMENT_PLAN.md의 작업들을 Trello 카드로 생성
npm run dev
# 그 다음 애플리케이션 코드에서 syncImprovementPlanToTrello() 호출
```

### Webhook으로 양방향 동기화

Trello에서 카드 이동 → ChonCance DB 업데이트 (추후 구현 예정)

---

## 🔧 문제 해결

### "Unauthorized" 오류
- API Key와 Token이 정확한지 확인
- `.env.local` 파일 위치 확인 (프로젝트 루트)
- 서버 재시작 (`npm run dev`)

### "Board not found" 오류
- TRELLO_BOARD_ID 확인
- 보드 URL에서 ID 확인: `https://trello.com/b/BOARD_ID/board-name`

### 카드가 생성되지 않음
- 환경 변수가 모두 설정되었는지 확인
- List ID가 정확한지 확인 (`npm run trello:setup` 재실행)
- 서버 로그에서 에러 메시지 확인

### 예약은 되지만 Trello 카드가 안 생성됨
- 정상 동작입니다! Trello 연동 실패가 예약에 영향을 주지 않습니다.
- 서버 로그에서 "Trello sync failed" 에러 확인
- 환경 변수를 설정하고 서버 재시작

---

## 📚 더 알아보기

- 전체 가이드: [TRELLO_INTEGRATION_GUIDE.md](./TRELLO_INTEGRATION_GUIDE.md)
- Trello API 문서: https://developer.atlassian.com/cloud/trello/
- 결제 시스템 가이드: [PAYMENT_SYSTEM_SUMMARY.md](./PAYMENT_SYSTEM_SUMMARY.md)

---

## ✅ 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] Trello API Key 발급 완료
- [ ] Trello Token 생성 완료
- [ ] `.env.local`에 TRELLO_API_KEY 추가
- [ ] `.env.local`에 TRELLO_TOKEN 추가
- [ ] `.env.local`에 TRELLO_BOARD_ID 추가
- [ ] `npm run trello:setup` 실행하여 List ID 확인
- [ ] List ID들을 `.env.local`에 추가
- [ ] `npm run trello:test` 실행하여 연동 테스트
- [ ] 테스트 카드가 Trello 보드에 생성되었는지 확인
- [ ] 서버 재시작 (`npm run dev`)

모든 항목이 체크되면 Trello 연동 완료! 🎊

---

**마지막 업데이트:** 2025-10-30
**Trello 보드:** https://trello.com/b/XYvc0OFq/촌캉스choncance
