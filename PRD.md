# Product Requirements Document (PRD)
# ChonCance (촌캉스) - 농촌 휴가 체험 큐레이션 플랫폼

**문서 버전**: 1.0 (초안)
**작성일**: 2025-10-26
**타겟 런칭**: 2025년 11월 말 (1개월)
**작성자**: Business Analyst (Mary)
**상태**: Draft

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [핵심 기능 묶음 (Epics)](#2-핵심-기능-묶음-epics)
3. [기능 요구사항 (Functional Requirements)](#3-기능-요구사항-functional-requirements)
4. [비기능 요구사항 (Non-Functional Requirements)](#4-비기능-요구사항-non-functional-requirements)
5. [사용자 스토리 (User Stories)](#5-사용자-스토리-user-stories)
6. [데이터 모델](#6-데이터-모델)
7. [기술 스택](#7-기술-스택)
8. [성공 지표](#8-성공-지표)

---

## 1. 제품 개요

### 1.1 제품 비전
ChonCance는 한국 MZ세대를 위한 **농촌 휴가 체험(촌캉스) 큐레이션 플랫폼**입니다. 테마 기반 발견 경험을 통해 진정성 있는 농촌 여행을 제공하며, 호스트 스토리 중심의 콘텐츠로 healing, relaxation, SNS 공유 가치를 추구합니다.

### 1.2 핵심 차별화 전략
- **테마 큐레이션 기반 UI/UX**: 사용자가 감성 태그(#논뷰맛집, #불멍과별멍, #반려동물동반 등)로 숙소를 발견
- **호스트 자율 태그 시스템**: 초기 단계에서는 호스트가 자율적으로 테마 태그를 선택
- **스토리 중심 콘텐츠**: 호스트 내러티브와 사진/동영상을 통한 감성적 접근
- **정직한 불편함 표현**: 농촌 경험의 불편함을 솔직하게 표현하여 신뢰 구축

### 1.3 타겟 사용자
- **주요 타겟**: 한국 MZ세대 (20-30대)
- **세부 세그먼트**: 힐링 여행 추구자, SNS 콘텐츠 크리에이터, 반려동물 동반 여행객, 커플, 친구 그룹

### 1.4 MVP 스코프
이 PRD는 **1개월 내 런칭을 목표로 하는 MVP**를 정의합니다.

**포함 (In Scope)**:
- 사용자 인증 (이메일/비밀번호, 카카오 로그인)
- 테마 기반 숙소 발견 및 검색
- 호스트 등록 및 숙소 관리
- 간단한 예약 시스템 (숙박 + 선택적 경험)
- 토스페이먼츠 결제 연동
- 기본 리뷰 시스템 (텍스트만)

**제외 (Out of Scope)**:
- 모바일 앱
- 실시간 채팅
- 위시리스트
- 사진 업로드 리뷰
- AI 추천 알고리즘
- 다국어 지원

---

## 2. 핵심 기능 묶음 (Epics)

### Epic 1: 사용자 인증 및 회원 관리
**목표**: 사용자가 안전하게 가입하고 로그인하여 서비스를 이용할 수 있다.

**범위**:
- 이메일/비밀번호 회원가입 및 로그인
- 카카오 소셜 로그인 (OAuth)
- 호스트/게스트 역할 구분
- 프로필 관리 (기본 정보 수정)
- 비밀번호 재설정

**우선순위**: P0 (Critical)

---

### Epic 2: 테마 기반 숙소 발견
**목표**: 사용자가 테마/태그를 통해 원하는 촌캉스 숙소를 쉽게 발견할 수 있다.

**범위**:
- 테마 태그 분류 체계 (예: #논뷰맛집, #불멍과별멍, #반려동물동반, #아궁이체험)
- 테마별 숙소 리스팅 페이지
- 숙소 상세 페이지 (사진, 스토리, 편의시설, 불편함 표시)
- 검색 기능 (지역, 날짜, 인원)
- 필터 기능 (가격, 편의시설)

**우선순위**: P0 (Critical - 핵심 차별화)

---

### Epic 3: 호스트 및 숙소 관리
**목표**: 호스트가 자신의 숙소와 경험을 쉽게 등록하고 관리할 수 있다.

**범위**:
- 호스트 계정 등록 (인증 절차 포함)
- 숙소 등록 (기본 정보, 위치, 편의시설, 가격)
- 사진/동영상 업로드
- 호스트 스토리 작성 (자유 양식)
- 테마 태그 선택 (다중 선택)
- 숙소 수정/삭제
- 예약 관리 (예약 확인, 취소 처리)

**우선순위**: P0 (Critical - 공급 확보)

---

### Epic 4: 예약 및 결제 시스템
**목표**: 사용자가 원하는 숙소를 간편하게 예약하고 안전하게 결제할 수 있다.

**범위**:
- 날짜 선택 및 예약 가능 여부 확인
- 예약 정보 입력 (인원, 특이사항)
- 선택적 경험 추가 (호스트가 제공하는 경우)
- 예약 금액 계산 (숙박비 + 경험비 + 수수료)
- 토스페이먼츠 결제 연동
- 예약 확정 및 알림
- 예약 내역 조회
- 취소 및 환불 처리

**우선순위**: P0 (Critical - 수익 모델)

---

### Epic 5: 리뷰 시스템 (간단 버전)
**목표**: 사용자가 숙박 후 후기를 남겨 다른 사용자의 의사결정을 돕는다.

**범위**:
- 숙박 완료 후 리뷰 작성 (텍스트만)
- 별점 평가 (전체 만족도)
- 숙소 상세 페이지에 리뷰 표시
- 호스트 응답 (선택 사항)

**우선순위**: P1 (High - MVP에 포함하되 간소화)

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 사용자 인증 및 계정 관리

#### FR-01: 이메일/비밀번호 회원가입
**설명**: 사용자는 이메일과 비밀번호로 회원가입할 수 있다.
**세부사항**:
- 필수 입력: 이메일, 비밀번호, 비밀번호 확인, 이름, 전화번호
- 이메일 형식 검증
- 비밀번호 강도 검증 (최소 8자, 영문+숫자 조합)
- 개인정보 처리방침 및 이용약관 동의 체크박스
- 중복 이메일 검증
**우선순위**: P0

#### FR-02: 이메일/비밀번호 로그인
**설명**: 사용자는 등록한 이메일과 비밀번호로 로그인할 수 있다.
**세부사항**:
- 이메일/비밀번호 입력
- 로그인 실패 시 에러 메시지 표시
- 세션 유지 (JWT 방식)
- "로그인 상태 유지" 옵션
**우선순위**: P0

#### FR-03: 카카오 소셜 로그인
**설명**: 사용자는 카카오 계정으로 간편하게 가입/로그인할 수 있다.
**세부사항**:
- NextAuth.js Kakao Provider 연동
- 카카오 계정 정보 자동 매핑 (이름, 이메일, 프로필 사진)
- 최초 로그인 시 추가 정보 입력 (전화번호, 약관 동의)
**우선순위**: P0

#### FR-04: 호스트 계정 등록
**설명**: 숙소 제공자는 호스트 계정을 등록할 수 있다.
**세부사항**:
- 일반 회원가입 후 호스트 전환 신청
- 추가 정보: 사업자 정보 (선택), 대표자명, 연락처
- 호스트 승인 프로세스 (운영팀 검토 - 수동)
**우선순위**: P0

#### FR-05: 프로필 관리
**설명**: 사용자는 자신의 프로필 정보를 수정할 수 있다.
**세부사항**:
- 이름, 전화번호, 프로필 사진 수정
- 비밀번호 변경
- 계정 삭제 (탈퇴)
**우선순위**: P1

#### FR-06: 비밀번호 재설정
**설명**: 사용자는 비밀번호를 잊었을 때 이메일을 통해 재설정할 수 있다.
**세부사항**:
- 이메일 주소 입력 → 재설정 링크 발송
- 링크 유효 기간: 24시간
- 새 비밀번호 설정
**우선순위**: P1

---

### 3.2 테마 기반 숙소 발견

#### FR-07: 테마 태그 분류 체계
**설명**: 시스템은 사전 정의된 테마 태그를 제공한다.
**세부사항**:
- 초기 태그 목록 (예시):
  - #논뷰맛집 (벼논 전망)
  - #불멍과별멍 (캠프파이어, 별 관찰)
  - #반려동물동반
  - #아궁이체험
  - #계곡앞
  - #눈꽃여행
  - #전통가옥
  - #농사체험
- 태그는 DB에 저장되며 관리자가 추가 가능
**우선순위**: P0

#### FR-08: 메인 페이지 테마별 큐레이션
**설명**: 메인 페이지에서 테마별로 숙소를 탐색할 수 있다.
**세부사항**:
- 테마 태그 카드 UI (이미지 + 태그명)
- 각 테마 클릭 시 해당 태그가 포함된 숙소 목록으로 이동
- 인기 테마 상단 노출 (클릭 수 기반)
**우선순위**: P0

#### FR-09: 숙소 리스팅 페이지
**설명**: 사용자는 조건에 맞는 숙소 목록을 볼 수 있다.
**세부사항**:
- 카드형 레이아웃 (대표 사진, 숙소명, 위치, 1박 가격, 태그)
- 페이지네이션 (20개씩)
- 정렬 옵션: 추천순, 가격 낮은 순, 가격 높은 순, 최신순
**우선순위**: P0

#### FR-10: 검색 기능
**설명**: 사용자는 지역, 날짜, 인원으로 숙소를 검색할 수 있다.
**세부사항**:
- 검색 필터:
  - 지역 (시/도 선택)
  - 체크인/체크아웃 날짜
  - 인원 (성인/어린이)
- 검색 결과는 리스팅 페이지에 표시
**우선순위**: P0

#### FR-11: 필터 기능
**설명**: 사용자는 추가 필터로 검색 결과를 정제할 수 있다.
**세부사항**:
- 가격 범위 (슬라이더)
- 편의시설 (Wi-Fi, 주차, 취사 가능, 바비큐 등)
- 숙소 유형 (한옥, 펜션, 농가, 글램핑 등)
**우선순위**: P1

#### FR-12: 숙소 상세 페이지
**설명**: 사용자는 숙소의 상세 정보를 확인할 수 있다.
**세부사항**:
- 사진 갤러리 (최대 20장)
- 숙소명, 위치 (지도 표시)
- 호스트 스토리 (자유 형식 텍스트)
- 편의시설 및 특징
- **불편함 표시** (예: "Wi-Fi 불안정", "샤워실 온수 부족 가능")
- 가격 정보 (1박 기준)
- 선택 가능한 경험 (선택 사항)
- 예약 가능 날짜 달력
- 리뷰 섹션
**우선순위**: P0

---

### 3.3 호스트 및 숙소 관리

#### FR-13: 호스트 대시보드
**설명**: 호스트는 자신의 숙소와 예약 현황을 관리할 수 있다.
**세부사항**:
- 등록된 숙소 목록
- 예약 현황 (예정, 완료, 취소)
- 수익 요약 (월별)
**우선순위**: P0

#### FR-14: 숙소 등록
**설명**: 호스트는 새로운 숙소를 등록할 수 있다.
**세부사항**:
- 단계별 입력 폼:
  1. 기본 정보 (숙소명, 유형, 위치, 주소)
  2. 편의시설 (체크박스)
  3. 사진 업로드 (최소 3장, 최대 20장)
  4. 호스트 스토리 작성 (텍스트 에디터)
  5. 테마 태그 선택 (다중 선택)
  6. 가격 설정 (평일/주말 구분 가능)
  7. 불편함 표시 (선택 사항)
  8. 선택적 경험 등록 (예: 농사 체험, 아궁이 체험 등)
- 저장 및 제출
- 운영팀 검토 후 승인
**우선순위**: P0

#### FR-15: 숙소 수정/삭제
**설명**: 호스트는 등록한 숙소 정보를 수정하거나 삭제할 수 있다.
**세부사항**:
- 모든 필드 수정 가능
- 삭제 시 예약이 있는 경우 경고 메시지
**우선순위**: P0

#### FR-16: 예약 관리 (호스트)
**설명**: 호스트는 들어온 예약을 확인하고 관리할 수 있다.
**세부사항**:
- 예약 목록 (날짜, 게스트명, 인원, 금액)
- 예약 상세 정보 (게스트 연락처, 특이사항)
- 예약 취소 (호스트 측 취소)
**우선순위**: P0

#### FR-17: 사진/동영상 업로드
**설명**: 호스트는 숙소 사진과 동영상을 업로드할 수 있다.
**세부사항**:
- 이미지 형식: JPG, PNG (최대 5MB)
- 동영상 형식: MP4 (최대 50MB, 1분 이내)
- 썸네일 자동 생성
- 드래그앤드롭으로 순서 조정
**우선순위**: P0

---

### 3.4 예약 및 결제 시스템

#### FR-18: 날짜 선택 및 예약 가능 확인
**설명**: 사용자는 원하는 날짜의 예약 가능 여부를 확인할 수 있다.
**세부사항**:
- 달력 UI (이미 예약된 날짜는 비활성화)
- 체크인/체크아웃 날짜 선택
- 최소 1박 이상
**우선순위**: P0

#### FR-19: 예약 정보 입력
**설명**: 사용자는 예약에 필요한 정보를 입력한다.
**세부사항**:
- 투숙 인원 (성인/어린이)
- 연락처 (자동 채움, 수정 가능)
- 특이사항/요청사항 (자유 텍스트)
- 선택적 경험 선택 (체크박스)
**우선순위**: P0

#### FR-20: 예약 금액 계산
**설명**: 시스템은 예약 금액을 자동으로 계산한다.
**세부사항**:
- 숙박비 = 1박 가격 × 박수
- 경험비 = 선택한 경험 가격 합계
- 서비스 수수료 (게스트 부담 여부 TBD)
- 총 결제 금액 표시
**우선순위**: P0

#### FR-21: 토스페이먼츠 결제 연동
**설명**: 사용자는 토스페이먼츠를 통해 안전하게 결제할 수 있다.
**세부사항**:
- 결제 수단: 신용카드, 계좌이체, 간편결제
- PG사 연동: 토스페이먼츠 API
- 결제 성공 시 예약 확정
- 결제 실패 시 재시도 또는 예약 취소
**우선순위**: P0

#### FR-22: 예약 확정 및 알림
**설명**: 결제 완료 후 예약이 확정되고 관련자에게 알림이 전송된다.
**세부사항**:
- 게스트: 예약 확정 이메일 발송 (예약 번호, 숙소 정보, 호스트 연락처)
- 호스트: 예약 알림 이메일 발송 (예약 번호, 게스트 정보)
- 예약 내역에 저장
**우선순위**: P0

#### FR-23: 예약 내역 조회
**설명**: 사용자는 자신의 예약 내역을 조회할 수 있다.
**세부사항**:
- 예정된 예약
- 지난 예약
- 취소된 예약
- 각 예약 클릭 시 상세 정보 표시
**우선순위**: P0

#### FR-24: 취소 및 환불 처리
**설명**: 사용자는 예약을 취소하고 환불받을 수 있다.
**세부사항**:
- 취소 정책 (예시):
  - 체크인 7일 전: 전액 환불
  - 체크인 3~7일 전: 50% 환불
  - 체크인 3일 이내: 환불 불가
- 취소 요청 시 정책 표시 및 확인
- 호스트 및 게스트 모두 알림
- 환불 처리 (토스페이먼츠 취소 API)
**우선순위**: P0

---

### 3.5 리뷰 시스템

#### FR-25: 리뷰 작성
**설명**: 사용자는 숙박 완료 후 리뷰를 작성할 수 있다.
**세부사항**:
- 체크아웃 날짜 이후에만 작성 가능
- 별점 (1~5점)
- 리뷰 텍스트 (최소 10자)
- 1회만 작성 가능 (수정 가능)
**우선순위**: P1

#### FR-26: 리뷰 표시
**설명**: 숙소 상세 페이지에 리뷰가 표시된다.
**세부사항**:
- 평균 별점 (숙소 상단에 표시)
- 리뷰 목록 (최신순)
- 리뷰어 이름 (마스킹: 홍*동)
- 작성일
**우선순위**: P1

#### FR-27: 호스트 응답
**설명**: 호스트는 리뷰에 답글을 달 수 있다.
**세부사항**:
- 리뷰 1개당 1개의 호스트 응답 가능
- 응답 텍스트
- 리뷰 아래에 표시
**우선순위**: P2 (선택 사항)

---

### 3.6 관리자 기능

#### FR-28: 호스트 승인/거부
**설명**: 관리자는 호스트 신청을 검토하고 승인/거부할 수 있다.
**세부사항**:
- 호스트 신청 목록
- 신청 정보 확인 (사업자 정보, 연락처)
- 승인/거부 버튼
- 거부 시 사유 입력
**우선순위**: P0

#### FR-29: 숙소 검토 및 승인
**설명**: 관리자는 등록된 숙소를 검토하고 승인/거부할 수 있다.
**세부사항**:
- 숙소 등록 요청 목록
- 숙소 정보 확인 (사진, 스토리, 태그)
- 승인/거부 버튼
- 거부 시 수정 요청 사유 입력
**우선순위**: P0

#### FR-30: 태그 관리
**설명**: 관리자는 테마 태그를 추가/수정/삭제할 수 있다.
**세부사항**:
- 태그 목록
- 태그 추가 (이름, 아이콘/이미지)
- 태그 수정
- 태그 삭제 (해당 태그 사용 중인 숙소 확인)
**우선순위**: P1

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### 4.1 성능 (Performance)

#### NFR-01: 페이지 로딩 시간
**설명**: 모든 페이지는 2초 이내에 로딩되어야 한다.
**측정 기준**:
- First Contentful Paint (FCP) < 1.5초
- Largest Contentful Paint (LCP) < 2.5초
**우선순위**: P0

#### NFR-02: 이미지 최적화
**설명**: 이미지는 WebP 포맷으로 변환되고 적절한 크기로 제공되어야 한다.
**세부사항**:
- Next.js Image 컴포넌트 사용
- 반응형 이미지 (srcset)
- Lazy loading 적용
**우선순위**: P0

#### NFR-03: API 응답 시간
**설명**: 모든 API는 500ms 이내에 응답해야 한다.
**측정 기준**:
- 데이터베이스 쿼리 최적화
- 인덱싱 적용
**우선순위**: P1

#### NFR-04: 동시 접속자 처리
**설명**: 시스템은 최소 1,000명의 동시 접속자를 처리할 수 있어야 한다.
**세부사항**:
- Vercel 인프라 활용
- 데이터베이스 커넥션 풀 관리
**우선순위**: P1

---

### 4.2 보안 (Security)

#### NFR-05: 개인정보 보호법 (PIPA) 준수
**설명**: 시스템은 한국 개인정보 보호법을 준수해야 한다.
**세부사항**:
- 개인정보 처리방침 명시
- 이용약관 동의 절차
- 개인정보 수집/이용 동의 (필수/선택 구분)
- 개인정보 암호화 저장
- 제3자 제공 동의 (결제 정보)
**우선순위**: P0

#### NFR-06: 비밀번호 암호화
**설명**: 사용자 비밀번호는 안전하게 해시화되어 저장되어야 한다.
**세부사항**:
- bcrypt 알고리즘 사용
- Salt 추가
**우선순위**: P0

#### NFR-07: HTTPS 적용
**설명**: 모든 통신은 HTTPS로 암호화되어야 한다.
**세부사항**:
- Vercel 자동 SSL 인증서 적용
- HTTP → HTTPS 리다이렉트
**우선순위**: P0

#### NFR-08: XSS 및 CSRF 방지
**설명**: 시스템은 XSS(Cross-Site Scripting) 및 CSRF(Cross-Site Request Forgery) 공격으로부터 보호되어야 한다.
**세부사항**:
- 사용자 입력 sanitization
- NextAuth.js CSRF 토큰
- Content Security Policy (CSP) 헤더
**우선순위**: P0

#### NFR-09: 결제 정보 보안
**설명**: 결제 정보는 PCI-DSS 기준을 준수해야 한다.
**세부사항**:
- 토스페이먼츠 PG사를 통한 처리 (ChonCance는 카드 정보 직접 저장 안 함)
- 결제 토큰만 저장
**우선순위**: P0

---

### 4.3 확장성 (Scalability)

#### NFR-10: 데이터베이스 확장성
**설명**: 시스템은 최소 10,000개의 숙소와 100,000명의 사용자를 지원할 수 있어야 한다.
**세부사항**:
- PostgreSQL 인덱싱
- 쿼리 최적화
- 필요 시 Read Replica 적용 고려
**우선순위**: P1

#### NFR-11: 이미지 스토리지 확장성
**설명**: 이미지 스토리지는 무제한으로 확장 가능해야 한다.
**세부사항**:
- Vercel Blob 또는 AWS S3 사용
- CDN 연동 (CloudFront, Vercel Edge Network)
**우선순위**: P1

---

### 4.4 사용성 (Usability)

#### NFR-12: 모바일 반응형 디자인
**설명**: 모든 페이지는 모바일, 태블릿, 데스크톱에서 최적화되어 표시되어야 한다.
**세부사항**:
- Tailwind CSS 반응형 유틸리티 사용
- 터치 친화적 UI (버튼 크기 최소 44x44px)
- 모바일 우선 설계 (Mobile-first)
**우선순위**: P0

#### NFR-13: 접근성 (Accessibility)
**설명**: 시스템은 WCAG 2.1 AA 수준의 접근성을 제공해야 한다.
**세부사항**:
- 시맨틱 HTML 사용
- ARIA 라벨 적용
- 키보드 네비게이션 지원
- 색상 대비 4.5:1 이상
- 포커스 인디케이터 표시
**우선순위**: P1

#### NFR-14: 다국어 대응 (향후)
**설명**: MVP에서는 한국어만 지원하지만, 향후 다국어 확장을 고려한 설계를 해야 한다.
**세부사항**:
- i18n 구조 준비 (하드코딩 최소화)
- 언어 파일 분리 고려
**우선순위**: P2

---

### 4.5 신뢰성 (Reliability)

#### NFR-15: 가용성 (Uptime)
**설명**: 시스템은 99% 이상의 가용성을 유지해야 한다.
**측정 기준**:
- 월 downtime < 7.2시간
- Vercel 인프라 활용
**우선순위**: P1

#### NFR-16: 에러 처리 및 로깅
**설명**: 모든 에러는 적절히 처리되고 로깅되어야 한다.
**세부사항**:
- Try-catch 블록으로 에러 처리
- 사용자에게 친화적인 에러 메시지 표시
- Sentry 또는 유사 도구로 에러 추적
**우선순위**: P1

#### NFR-17: 백업 및 복구
**설명**: 데이터베이스는 매일 백업되어야 한다.
**세부사항**:
- Vercel Postgres 자동 백업 활용
- 백업 보관 기간: 7일
**우선순위**: P1

---

### 4.6 유지보수성 (Maintainability)

#### NFR-18: 코드 품질
**설명**: 코드는 TypeScript strict mode를 준수하고 ESLint 규칙을 따라야 한다.
**세부사항**:
- TypeScript strict mode 활성화
- ESLint + Prettier 적용
- 코드 리뷰 프로세스
**우선순위**: P0

#### NFR-19: 문서화
**설명**: 모든 API와 주요 컴포넌트는 문서화되어야 한다.
**세부사항**:
- JSDoc 주석
- README.md 업데이트
- API 문서 (Swagger 또는 유사 도구)
**우선순위**: P1

#### NFR-20: 테스트 커버리지
**설명**: 핵심 기능은 자동화된 테스트로 검증되어야 한다.
**세부사항**:
- E2E 테스트 (Playwright) - 주요 사용자 플로우
- 단위 테스트 (Vitest) - 유틸리티 함수
- 목표 커버리지: 60% 이상 (MVP 단계)
**우선순위**: P2 (시간 여유 시)

---

### 4.7 법적 준수 (Compliance)

#### NFR-21: 전자상거래법 준수
**설명**: 시스템은 한국 전자상거래법을 준수해야 한다.
**세부사항**:
- 사업자 정보 표시
- 취소/환불 정책 명시
- 이용약관 및 개인정보 처리방침
**우선순위**: P0

#### NFR-22: 소비자 보호
**설명**: 결제 취소 및 환불 프로세스는 명확해야 한다.
**세부사항**:
- 취소 정책 명시
- 환불 처리 기한 준수 (영업일 기준 3일 이내)
**우선순위**: P0

---

### 4.8 배포 가이드라인 (Deployment Guidelines)

#### NFR-23: 배포 전 빌드 성공
**설명**: Vercel 배포 전, 로컬 환경에서 반드시 프로덕션 빌드를 성공시켜야 한다.
**세부사항**:
- `npm run build` 명령어를 실행하여 빌드 에러 및 린팅 오류를 사전에 확인한다.
- 빌드 실패 시, 원인을 해결하기 전까지 Git에 푸시하지 않는다.
**우선순위**: P0

#### NFR-24: 환경 변수 동기화
**설명**: Vercel 프로젝트의 환경 변수는 로컬 `.env` 파일과 항상 동기화되어야 한다.
**세부사항**:
- 새로운 환경 변수 추가 시, Vercel 대시보드에도 즉시 반영한다.
- 주요 환경 변수가 누락되지 않도록 주의한다. (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`, `KAKAO_CLIENT_ID`)
**우선순위**: P0

#### NFR-25: 파일명 대소문자 일관성
**설명**: 파일 및 폴더명, 그리고 코드 내 import 구문의 대소문자는 항상 일치해야 한다.
**세부사항**:
- Vercel의 빌드 환경은 대소문자를 구분하는 Linux 기반이므로, 로컬(macOS, Windows)과 동작이 다를 수 있다.
- 예: `import MyComponent from './mycomponent'` 와 같이 파일명과 import 구문의 대소문자가 다르면 배포 실패의 원인이 된다.
**우선순위**: P0

#### NFR-26: 경로 별칭(Path Alias) 사용 주의
**설명**: `tsconfig.json`에 정의된 경로 별칭(`@/*`)이 Vercel 빌드 환경에서 올바르게 해석되지 않을 경우, 상대 경로 사용을 고려한다.
**세부사항**:
- 빌드 시 "Cannot find module" 에러가 발생하면, 우선적으로 경로 별칭 관련 설정을 확인한다.
- 문제 해결이 어려울 경우, `@/` 대신 `../` 와 같은 상대 경로로 수정하여 테스트한다.
**우선순위**: P1

---

## 5. 사용자 스토리 (User Stories)

### Epic 1: 사용자 인증 및 회원 관리

#### User Story 1.1: 일반 사용자 회원가입
```
As a 여행객 (게스트)
I want to 이메일과 비밀번호로 회원가입하다
So that 촌캉스 숙소를 예약할 수 있다

Acceptance Criteria:
- Given: 회원가입 페이지에 접속했을 때
- When: 유효한 이메일, 비밀번호(8자 이상), 이름, 전화번호를 입력하고 약관에 동의한 후 "가입하기" 버튼을 클릭하면
- Then:
  * 계정이 생성되고
  * 가입 완료 메시지가 표시되며
  * 자동으로 로그인되어 메인 페이지로 이동한다

Error Cases:
- 이미 존재하는 이메일: "이미 가입된 이메일입니다" 메시지 표시
- 비밀번호 강도 부족: "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다" 메시지
- 약관 미동의: "이용약관과 개인정보 처리방침에 동의해주세요" 메시지

Priority: P0 (Critical)
Story Points: 5
```

---

#### User Story 1.2: 카카오 소셜 로그인
```
As a 여행객 (게스트)
I want to 카카오 계정으로 간편하게 로그인하다
So that 별도의 회원가입 없이 빠르게 서비스를 이용할 수 있다

Acceptance Criteria:
- Given: 로그인 페이지에 접속했을 때
- When: "카카오로 시작하기" 버튼을 클릭하면
- Then:
  * 카카오 로그인 페이지로 리다이렉트되고
  * 카카오 인증 완료 후 ChonCance로 돌아오며
  * 최초 로그인 시 추가 정보 입력 페이지로 이동 (전화번호, 약관 동의)
  * 재방문 시 자동 로그인되어 메인 페이지로 이동한다

Additional Info:
- 카카오에서 제공하는 정보: 이름, 이메일, 프로필 사진
- 전화번호는 필수 입력 (예약 시 호스트 연락용)

Priority: P0 (Critical)
Story Points: 8
Dependencies: NextAuth.js Kakao Provider 설정
```

---

#### User Story 1.3: 호스트 계정 등록
```
As a 숙소 제공자 (호스트)
I want to 호스트 계정으로 등록하다
So that 내 숙소를 ChonCance에 등록하고 예약을 받을 수 있다

Acceptance Criteria:
- Given: 일반 계정으로 로그인한 상태에서
- When: "호스트 되기" 메뉴를 클릭하고 호스트 정보(대표자명, 연락처, 사업자 정보 선택)를 입력한 후 "신청하기" 버튼을 클릭하면
- Then:
  * 호스트 신청이 접수되고
  * "호스트 신청이 완료되었습니다. 검토 후 승인 결과를 이메일로 보내드립니다" 메시지 표시
  * 관리자 대시보드에 호스트 승인 요청이 표시됨

Approval Flow:
- 관리자가 호스트 신청을 검토
- 승인 시: 호스트에게 이메일 발송, 계정 role이 "host"로 변경, 숙소 등록 가능
- 거부 시: 호스트에게 거부 사유와 함께 이메일 발송

Priority: P0 (Critical)
Story Points: 8
Dependencies: 관리자 승인 기능 (FR-28)
```

---

## 6. 데이터 모델

### 6.1 ERD (Entity Relationship Diagram) 개요

주요 엔티티:
1. **User** - 사용자 (게스트 또는 호스트)
2. **Property** - 숙소
3. **Experience** - 선택적 경험 (숙소에 종속)
4. **Tag** - 테마 태그
5. **Booking** - 예약
6. **Review** - 리뷰
7. **Payment** - 결제 정보

### 6.2 Prisma 스키마 예시

```prisma
// User 모델
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // 소셜 로그인 시 null
  name          String
  phone         String
  role          Role      @default(GUEST)
  profileImage  String?

  // 호스트 전용 필드
  businessInfo  String?
  isHostApproved Boolean  @default(false)

  // OAuth 연동
  accounts      Account[]

  // 관계
  bookings      Booking[]
  reviews       Review[]
  properties    Property[] // 호스트인 경우

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  GUEST
  HOST
  ADMIN
}

// Property 모델
model Property {
  id            String    @id @default(cuid())
  name          String
  description   String    @db.Text
  location      String
  address       String
  propertyType  PropertyType
  pricePerNight Int

  // 편의시설
  amenities     String[]  // ["wifi", "parking", "bbq"]

  // 불편함 표시
  inconveniences String[] // ["wifi_unstable", "hot_water_limited"]

  // 사진/동영상
  images        String[]  // URL 배열
  videos        String[]

  // 호스트 스토리
  hostStory     String    @db.Text

  // 관계
  hostId        String
  host          User      @relation(fields: [hostId], references: [id])
  tags          Tag[]     @relation("PropertyTags")
  experiences   Experience[]
  bookings      Booking[]
  reviews       Review[]

  isApproved    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum PropertyType {
  HANOK
  PENSION
  FARMHOUSE
  GLAMPING
  GUESTHOUSE
}

// Tag 모델
model Tag {
  id          String     @id @default(cuid())
  name        String     @unique // 예: "논뷰맛집"
  slug        String     @unique // 예: "rice-field-view"
  icon        String?    // 아이콘 URL

  properties  Property[] @relation("PropertyTags")

  createdAt   DateTime   @default(now())
}

// Experience 모델
model Experience {
  id          String    @id @default(cuid())
  name        String
  description String
  price       Int
  duration    Int       // 분 단위

  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id])

  bookings    Booking[] @relation("BookingExperiences")

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Booking 모델
model Booking {
  id            String    @id @default(cuid())

  // 예약 정보
  checkIn       DateTime
  checkOut      DateTime
  guests        Int
  specialRequest String?

  // 금액
  accommodationPrice Int
  experiencePrice    Int
  serviceFee         Int
  totalPrice         Int

  // 상태
  status        BookingStatus @default(PENDING)

  // 관계
  userId        String
  user          User      @relation(fields: [userId], references: [id])

  propertyId    String
  property      Property  @relation(fields: [propertyId], references: [id])

  experiences   Experience[] @relation("BookingExperiences")

  payment       Payment?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

// Payment 모델
model Payment {
  id            String    @id @default(cuid())

  amount        Int
  method        String    // "card", "transfer", "easy_pay"

  // 토스페이먼츠 연동
  paymentKey    String    @unique
  orderId       String    @unique
  status        PaymentStatus

  // 관계
  bookingId     String    @unique
  booking       Booking   @relation(fields: [bookingId], references: [id])

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum PaymentStatus {
  READY
  IN_PROGRESS
  DONE
  CANCELED
  FAILED
}

// Review 모델
model Review {
  id          String    @id @default(cuid())

  rating      Int       // 1-5
  comment     String    @db.Text

  // 호스트 응답
  hostReply   String?   @db.Text

  // 관계
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, propertyId]) // 1인 1리뷰
}
```

---

## 7. 기술 스택

### 7.1 Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Forms**: react-hook-form + @hookform/resolvers
- **Validation**: Zod 4.x

### 7.2 Backend
- **API**: Next.js API Routes (App Router)
- **Server Components**: React Server Components
- **Authentication**: NextAuth.js 4.x
  - Providers: Credentials, Kakao OAuth
  - Session: JWT

### 7.3 Database
- **DBMS**: PostgreSQL
- **ORM**: Prisma
- **Hosting**: Vercel Postgres

### 7.4 Payment
- **PG사**: 토스페이먼츠
- **결제 수단**: 신용카드, 계좌이체, 간편결제

### 7.5 Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Image Storage**: Vercel Blob 또는 AWS S3
- **Domain**: TBD

### 7.6 Development Tools
- **Version Control**: Git + GitHub
- **Linting**: ESLint + Prettier
- **Testing**: Playwright (E2E), Vitest (Unit - 선택)
- **CI/CD**: Vercel (자동 배포)

---

## 8. 성공 지표

### 8.1 비즈니스 지표

| 지표 | 목표 (1개월) | 목표 (3개월) | 측정 방법 |
|------|-------------|-------------|----------|
| **호스트 등록 수** | 50개 | 100개 | DB 쿼리 |
| **활성 숙소 수** | 50개 | 80개 | 승인된 숙소 수 |
| **총 예약 건수** | 10건 | 50건 | Booking 테이블 |
| **총 거래액 (GMV)** | 500만원 | 3,000만원 | Payment 합계 |
| **예약 전환율** | 2% | 5% | 예약 / 상세 페이지 조회 |

### 8.2 사용자 지표

| 지표 | 목표 (1개월) | 목표 (3개월) | 측정 방법 |
|------|-------------|-------------|----------|
| **신규 가입자** | 100명 | 500명 | User 테이블 |
| **월간 활성 사용자 (MAU)** | 50명 | 200명 | 로그인 로그 |
| **평균 세션 시간** | 3분 | 5분 | Google Analytics |

### 8.3 제품 지표

| 지표 | 목표 | 측정 방법 |
|------|-----|----------|
| **페이지 로딩 시간** | < 2초 | Lighthouse, Web Vitals |
| **모바일 사용 비율** | > 60% | Google Analytics |
| **테마 클릭률** | > 30% | 테마 클릭 / 메인 페이지 방문 |
| **평균 별점** | > 4.0 | Review 평균 |

### 8.4 운영 지표

| 지표 | 목표 | 측정 방법 |
|------|-----|----------|
| **호스트 승인 시간** | < 24시간 | 수동 측정 |
| **예약 취소율** | < 10% | 취소 건수 / 총 예약 |
| **고객 지원 응답 시간** | < 2시간 | 수동 측정 |

---

## 9. 개발 우선순위 및 마일스톤

### Phase 1: Week 1-2 (핵심 기능)
**목표**: 로그인, 숙소 조회, 호스트 등록 가능

- [x] 프로젝트 초기 설정 (Next.js, Tailwind, Prisma)
- [ ] FR-01, FR-02: 이메일 회원가입/로그인
- [ ] FR-03: 카카오 로그인
- [ ] FR-07, FR-08: 테마 태그 시스템
- [ ] FR-09, FR-12: 숙소 리스팅 및 상세 페이지
- [ ] FR-04, FR-14: 호스트 등록 및 숙소 등록
- [ ] FR-28, FR-29: 관리자 승인 기능

### Phase 2: Week 3 (예약 및 결제)
**목표**: 예약 및 결제 프로세스 완성

- [ ] FR-18, FR-19, FR-20: 예약 프로세스
- [ ] FR-21: 토스페이먼츠 연동
- [ ] FR-22, FR-23: 예약 확정 및 조회
- [ ] FR-24: 취소 및 환불

### Phase 3: Week 4 (마무리 및 테스트)
**목표**: 리뷰, 검색/필터, 테스트, 런칭 준비

- [ ] FR-10, FR-11: 검색 및 필터
- [ ] FR-25, FR-26: 리뷰 시스템
- [ ] NFR-05: PIPA 준수 체크리스트
- [ ] E2E 테스트 (주요 플로우)
- [ ] 버그 수정 및 최적화
- [ ] 런칭

---

## 10. 미결정 사항 및 추후 논의 필요

1. **타겟 고객 세그먼트 구체화**
   - 초기 테마 선정에 영향
   - 마케팅 메시지 결정

2. **호스트 스토리 작성 책임**
   - 호스트 직접 vs 운영팀 대행
   - 템플릿/가이드 제공 수준

3. **수수료 구조**
   - 호스트 수수료율
   - 게스트 서비스 수수료 여부

4. **품질 관리 기준**
   - 호스트 승인 기준 상세화
   - 사진 품질 가이드라인

5. **고객 지원 채널**
   - 카카오톡 채널 vs 이메일 우선순위
   - 운영 시간 정의

---

## 부록 A: 용어 정의

| 용어 | 정의 |
|------|------|
| **촌캉스** | 촌(농촌) + 바캉스의 합성어. 농촌에서의 휴가 |
| **MZ세대** | 밀레니얼 + Z세대 (1980년대~2000년대 초반 출생) |
| **테마 태그** | 숙소의 특징을 나타내는 감성적 키워드 (예: #논뷰맛집) |
| **호스트** | 숙소 및 경험을 제공하는 사업자 |
| **게스트** | 숙소를 예약하고 이용하는 여행객 |
| **경험** | 숙박 외 호스트가 제공하는 추가 활동 (예: 농사 체험) |
| **MVP** | Minimum Viable Product (최소 기능 제품) |

---

## 부록 B: 참고 문서

- **Project-Brief.md**: 프로젝트 목표, 제약, 위험 분석
- **CLAUDE.md**: 개발 가이드라인 및 코딩 표준
- **docs/architecture/tech-stack.md**: 기술 스택 상세 설명
- **docs/architecture/coding-standards.md**: 코딩 표준
- **docs/architecture/source-tree.md**: 소스 트리 구조

---

**문서 히스토리**

| 버전 | 날짜 | 변경 사항 | 작성자 |
|------|------|----------|--------|
| 1.0 (Draft) | 2025-10-26 | 초안 작성 (Project-Brief.md 기반) | Mary (Business Analyst) |

**검토 필요**: PM, Tech Lead, UX Designer, Stakeholders
