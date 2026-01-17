# 📌 기능 설계 문서

📌 운영 원칙
PR 태그에 체크한 항목만 details 열고 나머지는 삭제
리뷰 시 필요한 부분만 펼쳐서 확인 가능


# 🧠 Feature Design & Operation Specification — <ApplyText Page>
> 텍스트 민원 신청 페이지 (ApplyText.tsx)

---

## 0️⃣ 문서 통제 정보 (Document Control)

### 문서 기본 정보
- 문서 ID: GEN-003
- 기능명: 텍스트 기반 민원 신청 (Text Application)
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
- 사용자가 구체적인 텍스트 서술을 통해 상세한 민원을 제기할 수 있는 표준 채널 제공.
- 텍스트 내용을 AI가 분석하여 자동으로 카테고리와 담당 부서를 배정, 행정 효율성 증대.

### 1.2 사용자 관점 가치
- 자신의 상황을 글로 상세히 설명할 수 있음.
- AI가 자동으로 분류해주므로 복잡한 행정 부서를 알 필요가 없음.

---

## 2️⃣ 문제 정의 (Problem Statement)

### 2.1 발생 배경
- 단순 키워드 검색이나 수동 카테고리 선택 방식은 사용자 오류가 많음.
- 민원 내용 오분류로 인한 이관 처리 비용 발생.

---

## 3️⃣ 요구사항 정의 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 |
|---|--------|--------|
| FR-1 | 민원 제목과 내용을 입력받아야 하며, 내용은 최소 8자, 최대 1000자로 제한한다. | Must |
| FR-2 | 'AI 분석하기' 버튼을 통해 입력된 텍스트를 분석하고 결과를 표시해야 한다. | Must |
| FR-3 | 선택적으로 참조 이미지를 첨부할 수 있어야 한다(5MB 이하). | Should |
| FR-4 | 지도/주소 검색을 통해 발생 위치를 지정해야 한다. | Must |
| FR-5 | AI 분석이 선행되어야만 접수가 가능하도록 제어해야 한다. | Must |

---

## 4️⃣ 기능 책임 및 경계 (Responsibility & Boundary)

### 4.1 책임 범위
- 텍스트 입력 폼 관리, 글자 수 제한, 파일 첨부 관리, AI 분석 결과 바인딩.

### 4.2 경계 명확화 이유
- 텍스트 분석 알고리즘(NLP)은 백엔드/AI 모델의 책임.

---

## 5️⃣ 시스템 아키텍처 상세 (Architecture)

### 5.1 논리 아키텍처
- `ApplyText.tsx` -> `api.ts` (analyzeText, createComplaint)
- `daum.Postcode` (Address Search)
- `kakao.maps` (Visualization)

### 5.4 기술 스택 (Technology Stack)
- React, Axios, Kakao API

---

## 6️⃣ End-to-End 처리 흐름 (E2E Flow)

```text
[User Input Title/Content]
  ↓
[User Click 'AI Analyze']
  ↓
[Call POST /api/ai/analyze-text]
  ↓
[Display Result (Category, Agency)]
  ↓
[User Select Location]
  ↓
[User Click Submit]
  ↓
[Call POST /api/complaints]
  ↓
[Server: Save Data & File]
  ↓
[Redirect to List]
```

---

## 7️⃣ 상세 설계 (Detailed Design)

### 7.1 내부 상태 머신 (State Machine)
- **Steps**:
  1. 제목 입력
  2. 내용 작성 (min 8 chars)
  3. AI 분석 (Result: null -> {category, agency})
  4. 위치 선택
  5. 접수 완료

### 7.2 핵심 비즈니스 로직 및 산출 공식 (Core Business Logic & Formulas)
- **유효성 검사**:
  ```javascript
  if (content.length < 8) alert('8자 이상 입력하세요');
  if (!aiResult) alert('AI 분석을 진행해주세요');
  ```
- **파일 처리**: 선택적 첨부. 업로드 시 미리보기 제공 및 삭제 기능.

### 7.4 인터페이스 및 API 설계 (Interface & API Design)
1.  **POST `/api/ai/analyze-text`**
    -   Input: `{ content: string }`
    -   Output: `{ category: string, agency_name: string, agency_code: string }`
2.  **POST `/api/complaints`**
    -   Input: `FormData` (JSON string + File binary)

---

## 8️⃣ 예외·오류 처리 설계 (Exception & Error Handling)

### 8.1 오류 분류
- **분석 실패**: 텍스트가 너무 짧거나(8자 미만) 무의미한 경우.
- **접수 실패**: 필수 항목 누락.

### 8.2 사용자 메시지
- "민원 내용을 8자 이상 입력해주세요."
- "AI 분석에 실패했습니다: [Server Message]"

---

## 1️⃣7️⃣ 문서 연계 (Documentation Linkage)
- 관련 파일: `ApplyText.tsx`
