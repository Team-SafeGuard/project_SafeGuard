# 📌 기능 설계 문서

📌 운영 원칙
PR 태그에 체크한 항목만 details 열고 나머지는 삭제
리뷰 시 필요한 부분만 펼쳐서 확인 가능


# 🧠 Feature Design & Operation Specification — <MyPage>
> 마이페이지 (MyPage.tsx)

---

## 0️⃣ 문서 통제 정보 (Document Control)

### 문서 기본 정보
- 문서 ID: GEN-011
- 기능명: 회원 정보 관리 및 활동 내역 (User Profile & Activity)
- 시스템명: SafeGuard Frontend
- 작성자: AI Agent
- 검토자: Tech Lead
- 승인자: PM

### 문서 이력 관리
| 버전 | 날짜 | 변경 요약 | 작성자 |
|----|----|---------|------|
| 1.0 | 2026-01-17 | 최초 작성 | AI Agent |

### 문서 상태
- [ ] Draft
- [x] In Review
- [ ] Approved
- [ ] Deprecated

---

## 1️⃣ 비즈니스 컨텍스트 (Business Context)

### 1.1 비즈니스 목적
- 사용자가 자신의 민원 처리 현황을 한곳에서 모니터링하고, 개인 정보를 스스로 최신화할 수 있도록 지원.
- 회원 탈퇴 권리 보장.

---

## 3️⃣ 요구사항 정의 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 |
|---|--------|--------|
| FR-1 | 사용자의 이름, 주소, 연락처 등 기본 정보를 조회하고 수정할 수 있어야 한다. | Must |
| FR-2 | 비밀번호 변경 기능을 제공하며, 현재 비밀번호 확인 및 새 비밀번호 검증을 수행해야 한다. | Must |
| FR-3 | 내가 작성한 민원 목록을 상태별(전체/미처리/처리중/완료)로 필터링하여 볼 수 있어야 한다. | Must |
| FR-4 | 회원 탈퇴 기능을 제공해야 하며, 탈퇴 시 경고 문구를 표시해야 한다. | Must |

---

## 4️⃣ 기능 책임 및 경계 (Responsibility & Boundary)

### 4.1 책임 범위
- 개인정보 보호(마스킹 등 UI 처리), 수정 폼 렌더링, 본인 데이터 조회 권한 제어.

---

## 5️⃣ 시스템 아키텍처 상세 (Architecture)

### 5.1 논리 아키텍처
- `MyPage.tsx` -> `usersAPI` (Profile CRUD), `complaintsAPI` (My List)

### 5.4 기술 스택 (Technology Stack)
- React Hooks
- Daum Postcode API (Address Search)

---

## 7️⃣ 상세 설계 (Detailed Design)

### 7.2 핵심 비즈니스 로직 및 산출 공식 (Core Business Logic & Formulas)
- **통계 카드 계산**: API로 가져온 전체 민원 리스트에서 `filter` 메소드를 사용해 각 상태별 개수(Count)를 클라이언트 사이드에서 계산.
- **주소 검색**: Daum Postcode API 팝업을 띄워 선택된 도로명/지번 주소를 폼 상태에 반영.

### 7.4 인터페이스 및 API 설계 (Interface & API Design)
1.  **GET `/api/users/me`**: 내 정보 조회.
2.  **PATCH `/api/users/profile`**: 정보 수정.
3.  **PATCH `/api/users/password`**: 비번 변경.
4.  **DELETE `/api/users/me`**: 계정 삭제.
5.  **GET `/api/complaints/my`**: 내 민원 목록.

---

## 8️⃣ 예외·오류 처리 설계 (Exception & Error Handling)

### 8.1 오류 분류
- **비밀번호 불일치**: "새 비밀번호가 일치하지 않습니다."
- **인증 만료**: 정보 수정 중 토큰 만료 시 로그인 페이지로 이동 처리 (Axios Interceptor 레벨 권장).

---

## 1️⃣7️⃣ 문서 연계 (Documentation Linkage)
- 관련 파일: `MyPage.tsx`
