# 카카오 알림톡 템플릿

카카오 비즈니스 메시지 API를 통해 전송할 알림톡 템플릿입니다.
각 템플릿은 카카오 비즈니스 센터에서 등록하고 승인받아야 합니다.

## 템플릿 등록 방법

1. **카카오톡 채널 생성**
   - https://center-pf.kakao.com/ 접속
   - 채널 생성 (VINTEE)
   - 채널 검색 허용 설정

2. **카카오 비즈니스 계정 연동**
   - https://business.kakao.com/ 접속
   - 채널 연동
   - 결제 수단 등록

3. **알림톡 템플릿 등록**
   - 카카오 비즈니스 > 메시지 > 알림톡 관리
   - 템플릿 등록 (아래 템플릿 복사)
   - 검수 요청 및 승인 대기 (보통 1-2일)

4. **API 키 발급**
   - 카카오 개발자 센터 (https://developers.kakao.com/)
   - 애플리케이션 생성
   - REST API 키 복사
   - 발신 프로필 키 확인

---

## 1. 예약 확정 템플릿

**템플릿 코드**: `BOOKING_CONFIRMED`
**템플릿 이름**: 예약 확정 알림

### 템플릿 내용

```
#{guest_name}님, 예약이 확정되었습니다! 🎉

■ 숙소 정보
- 숙소명: #{property_name}
- 체크인: #{check_in}
- 체크아웃: #{check_out}
- 인원: #{guests}명

■ 결제 금액
- 총 금액: #{total_amount}원

호스트가 예약을 확정했습니다.
즐거운 촌캉스 되세요!

VINTEE 드림
```

### 템플릿 변수
- `#{guest_name}`: 예약자 이름
- `#{property_name}`: 숙소 이름
- `#{check_in}`: 체크인 날짜 (예: 2025-01-15)
- `#{check_out}`: 체크아웃 날짜 (예: 2025-01-17)
- `#{guests}`: 인원 수
- `#{total_amount}`: 총 금액 (쉼표 포함)

### 버튼
- **예약 확인하기** (WL) - `/bookings/{bookingId}`

---

## 2. 예약 거절 템플릿

**템플릿 코드**: `BOOKING_REJECTED`
**템플릿 이름**: 예약 거절 알림

### 템플릿 내용

```
#{guest_name}님, 예약 요청이 거절되었습니다.

■ 숙소 정보
- 숙소명: #{property_name}
- 체크인: #{check_in}
- 체크아웃: #{check_out}

호스트 사정으로 예약이 거절되었습니다.
다른 멋진 숙소를 찾아보세요.

VINTEE 드림
```

### 템플릿 변수
- `#{guest_name}`: 예약자 이름
- `#{property_name}`: 숙소 이름
- `#{check_in}`: 체크인 날짜
- `#{check_out}`: 체크아웃 날짜

### 버튼
- **다른 숙소 찾기** (WL) - `/explore`

---

## 3. 예약 취소 템플릿

**템플릿 코드**: `BOOKING_CANCELLED`
**템플릿 이름**: 예약 취소 알림

### 템플릿 내용

```
#{guest_name}님, 예약이 취소되었습니다.

■ 숙소 정보
- 숙소명: #{property_name}
- 체크인: #{check_in}
- 체크아웃: #{check_out}

■ 환불 금액
- 환불 금액: #{refund_amount}원
- 환불은 3-5 영업일 내에 완료됩니다.

VINTEE 드림
```

### 템플릿 변수
- `#{guest_name}`: 예약자 이름
- `#{property_name}`: 숙소 이름
- `#{check_in}`: 체크인 날짜
- `#{check_out}`: 체크아웃 날짜
- `#{refund_amount}`: 환불 금액 (쉼표 포함)

---

## 4. 결제 완료 템플릿

**템플릿 코드**: `PAYMENT_SUCCESS`
**템플릿 이름**: 결제 완료 알림

### 템플릿 내용

```
#{guest_name}님, 결제가 완료되었습니다! ✅

■ 결제 정보
- 숙소명: #{property_name}
- 결제 금액: #{amount}원
- 결제 수단: #{payment_method}

예약 확정을 기다리고 있습니다.
호스트가 예약을 확정하면 알려드릴게요.

VINTEE 드림
```

### 템플릿 변수
- `#{guest_name}`: 예약자 이름
- `#{property_name}`: 숙소 이름
- `#{amount}`: 결제 금액 (쉼표 포함)
- `#{payment_method}`: 결제 수단

### 버튼
- **예약 확인하기** (WL) - `/bookings/{bookingId}`

---

## 5. 체크인 리마인더 템플릿

**템플릿 코드**: `CHECKIN_REMINDER`
**템플릿 이름**: 체크인 리마인더

### 템플릿 내용

```
#{guest_name}님, 내일 체크인입니다! 🏡

■ 숙소 정보
- 숙소명: #{property_name}
- 체크인: #{check_in}
- 체크인 시간: #{check_in_time}

■ 숙소 위치
#{property_address}

■ 호스트 연락처
#{host_phone}

즐거운 촌캉스 되세요!

VINTEE 드림
```

### 템플릿 변수
- `#{guest_name}`: 예약자 이름
- `#{property_name}`: 숙소 이름
- `#{check_in}`: 체크인 날짜
- `#{check_in_time}`: 체크인 시간 (예: 15:00)
- `#{property_address}`: 숙소 주소
- `#{host_phone}`: 호스트 전화번호

### 버튼
- **예약 확인하기** (WL) - `/bookings/{bookingId}`
- **길찾기** (WL) - 카카오맵 길찾기

---

## 템플릿 등록 시 주의사항

1. **변수 형식**
   - 변수는 `#{변수명}` 형식으로 작성
   - 변수명은 영문 소문자와 언더스코어(_)만 사용
   - 예: `#{guest_name}`, `#{check_in}`

2. **버튼 타입**
   - WL (Web Link): 웹 URL 링크
   - AL (App Link): 앱 링크
   - DS (배송 조회): 배송 조회 링크
   - BK (Bot Keyword): 봇 키워드 전송
   - MD (Message Delivery): 메시지 전달

3. **템플릿 검수**
   - 광고성 내용 금지
   - 명확한 발신자 표기 필요 (VINTEE 드림)
   - 수신 거부 방법 안내 (선택적)
   - 승인까지 1-2 영업일 소요

4. **비용**
   - 알림톡: 건당 약 7-9원
   - 친구톡: 건당 약 5원 (채널 친구만 가능)
   - SMS 대체 발송: 건당 약 15-20원 (알림톡 실패 시)

---

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Kakao AlimTalk
KAKAO_ALIMTALK_ENABLED=true
KAKAO_ALIMTALK_API_KEY=your_rest_api_key_here
KAKAO_ALIMTALK_SENDER_KEY=your_sender_key_here
```

### 키 발급 방법

1. **REST API 키**
   - https://developers.kakao.com/ 접속
   - 내 애플리케이션 > 앱 설정 > 앱 키
   - REST API 키 복사

2. **발신 프로필 키 (Sender Key)**
   - https://business.kakao.com/ 접속
   - 메시지 > 알림톡 관리 > 발신 프로필 관리
   - 프로필 키 복사

---

## 테스트 방법

1. **개발 환경 테스트**
   ```bash
   # .env.local에서 KAKAO_ALIMTALK_ENABLED=false 설정
   # 로그만 출력하고 실제 전송하지 않음
   ```

2. **실제 전송 테스트**
   ```bash
   # .env.local에서 KAKAO_ALIMTALK_ENABLED=true 설정
   # 본인 전화번호로 테스트 예약 생성 후 확정
   ```

3. **로그 확인**
   ```bash
   # 서버 로그에서 [AlimTalk] 태그 확인
   [AlimTalk] Message sent successfully: {...}
   [AlimTalk] Send failed: {...}
   ```

---

## 문의

카카오 비즈니스 고객센터: 1544-4293
이메일: 1:1 문의 (카카오 비즈니스 센터 내)
