# 📌 기능 설계 문서

📌 운영 원칙
PR 태그에 체크한 항목만 details 열고 나머지는 삭제
리뷰 시 필요한 부분만 펼쳐서 확인 가능


# 🧠 Feature Design & Operation Specification — <Reset Password Page>
> 비밀번호 재설정 페이지 (ResetPassword.tsx)

---

## 0️⃣ 문서 통제 정보 (Document Control)

### 문서 기본 정보
- 문서 ID: GEN-013
- 기능명: 비밀번호 재설정 (Password Reset)
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
- 본인 인증(이전 단계)을 완료한 사용자가 안전하게 새 비밀번호를 설정하여 계정에 다시 접근할 수 있도록 함.

---

## 3️⃣ 요구사항 정의 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 |
|---|--------|--------|
| FR-1 | 이전 단계에서 전달받은 식별 정보(ID, Phone, BirthDate)가 없으면 접근을 차단해야 한다. | Must |
| FR-2 | 새 비밀번호 입력 시 복잡도 정책(8자 이상, 특수문자, 공백 불가)을 검증해야 한다. | Must |
| FR-3 | 변경 완료 시 로그인 페이지로 리다이렉트되어야 한다. | Must |

---

## 4️⃣ 기능 책임 및 경계 (Responsibility & Boundary)

### 4.1 책임 범위
- 보안 체크(직접 URL 접근 방지), 비밀번호 유효성 검증, 최종 변경 API 호출.

---

## 5️⃣ 시스템 아키텍처 상세 (Architecture)

### 5.1 논리 아키텍처
- `ResetPassword.tsx` -> `authAPI.updatePassword`
- State: `useLocation().state` (이전 페이지에서 전달된 데이터 수신)

### 5.4 기술 스택 (Technology Stack)
- React Router (`useLocation`, `useNavigate`)

---

## 7️⃣ 상세 설계 (Detailed Design)

### 7.2 핵심 비즈니스 로직 및 산출 공식 (Core Business Logic & Formulas)
- **접근 제어**:
  ```javascript
  if (!userId || !phone || !birthDate) {
      // 잘못된 접근 처리 (FindAccount로 리다이렉트 유도)
  }
  ```

### 7.4 인터페이스 및 API 설계 (Interface & API Design)
- **POST `/api/auth/reset-password`** (or `updatePassword`)
  - Input: `{ userId, phone, birthDate, newPassword }`
  - Output: Success Message

---

## 8️⃣ 예외·오류 처리 설계 (Exception & Error Handling)

### 8.1 오류 분류
- **필수 정보 누락**: "잘못된 접근입니다." 표시.

---

## 1️⃣7️⃣ 문서 연계 (Documentation Linkage)
- 관련 파일: `ResetPassword.tsx`, `FindAccount.tsx`
