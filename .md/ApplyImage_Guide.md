# 📌 기능 설계 문서

📌 운영 원칙
PR 태그에 체크한 항목만 details 열고 나머지는 삭제
리뷰 시 필요한 부분만 펼쳐서 확인 가능


# 🧠 Feature Design & Operation Specification — <ApplyImage Page>
> 이미지 민원 신청 페이지 (ApplyImage.tsx)

---

## 0️⃣ 문서 통제 정보 (Document Control)

### 문서 기본 정보
- 문서 ID: GEN-002
- 기능명: 이미지 기반 민원 신청 (Image Application)
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
- 현장 사진 촬영/업로드만으로 복잡한 민원 내용을 AI가 자동으로 분석하여 입력 과정을 최소화.
- 텍스트 입력이 어려운 상황이나 고령층 사용자에게 편의성 제공.

### 1.2 사용자 관점 가치
- "사진 한 장이면 민원 접수 끝"이라는 간편함.
- 정확한 위치 및 시각 정보 기록.

### 1.3 성공 기준 (Business Success Criteria)
- 이미지 분석 성공률 > 90%
- 민원 접수 완료율 증가

---

## 2️⃣ 문제 정의 (Problem Statement)

### 2.1 발생 배경
- 텍스트로 상황을 묘사하기 어려운 경우(시설물 파손, 불법 주정차 등) 사진이 더 효율적임.
- 모바일 환경에서의 긴 글 작성 불편함 해소.

---

## 3️⃣ 요구사항 정의 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 |
|---|--------|--------|
| FR-1 | 이미지 파일(jpg, png 등) 업로드 및 미리보기를 제공해야 한다. | Must |
| FR-2 | 5MB 이하의 파일만 허용하며, 비 이미지 파일은 차단해야 한다. | Must |
| FR-3 | 업로드된 이미지를 AI가 분석하여 민원 유형 및 담당 기관을 도출해야 한다. | Must |
| FR-4 | 지도(Kakao Map) 및 주소 검색(Daum Postcode)을 통해 위치를 지정할 수 있어야 한다. | Must |
| FR-5 | 작성 단계(Step)를 시각적으로 보여주고 완료 시 자동 이동해야 한다. | Should |

---

## 4️⃣ 기능 책임 및 경계 (Responsibility & Boundary)

### 4.1 책임 범위
- 이미지 유효성 검사, 업로드, AI 분석 요청 트리거, 최종 민원 데이터 취합 및 전송.

### 4.2 경계 명확화 이유
- 실제 이미지 분석 로직은 백엔드/AI 모델 서버에 위임 (Frontend는 결과만 표시).

---

## 5️⃣ 시스템 아키텍처 상세 (Architecture)

### 5.1 논리 아키텍처
- `ApplyImage.tsx` -> `api.ts` (analyzeImage, uploadImage, createComplaint)
- `Modal.tsx` (Alert/Confirm)
- External: Kakao Maps API, Daum Postcode Service

### 5.4 기술 스택 (Technology Stack)
- UI: React, Inline Styles
- Map: Kakao Maps SDK
- API: Axios (via utils/api)

---

## 6️⃣ End-to-End 처리 흐름 (E2E Flow)

```text
[User Select Image]
  ↓
[Validation (Size/Type)] --(Fail)--> [Alert]
  ↓
[Display Preview]
  ↓
[Call AI Analysis API]
  ↓
[Receive Analysis Result (Type, Agency)]
  ↓
[Auto-fill Content Field]
  ↓
[User Select Location (Map/Search)]
  ↓
[Submit Form]
  ↓
[Server: Upload Image & Save Data]
  ↓
[Success Alert & Redirect]
```

---

## 7️⃣ 상세 설계 (Detailed Design)

### 7.1 내부 상태 머신 (State Machine)
- **Step 1**: 제목 입력 대기
- **Step 2**: 이미지 업로드 대기 (업로드 시 AI 분석 상태 `isAnalyzing=true` -> `false`)
- **Step 3**: 위치 선택 대기
- **Step 4**: 접수 완료 대기 (Loading)

### 7.2 핵심 비즈니스 로직 및 산출 공식 (Core Business Logic & Formulas)
- **이미지 검증 로직**:
  ```javascript
  if (!file.type.startsWith('image/')) return Error;
  if (file.size > 5 * 1024 * 1024) return Error;
  ```
- **단계 자동 진행**: `useEffect`를 통해 입력 필드(`formData.title`, `selectedImage`, `location`) 상태를 감지하여 `currentStep` 자동 업데이트.

### 7.4 인터페이스 및 API 설계 (Interface & API Design)
1.  **POST `/api/ai/analyze-image`**
    -   Input: `FormData(image)`
    -   Output: `{ type: string, agency: string, summary: string }`
2.  **POST `/api/complaints/image` (Upload)**
    -   Input: `FormData(file)`
    -   Output: `{ imagePath: string }`
3.  **POST `/api/complaints` (Create)**
    -   Input: `FormData(complaint: JSON, file: File)` (이미지는 경로로 대체 가능)

---

## 8️⃣ 예외·오류 처리 설계 (Exception & Error Handling)

### 8.1 오류 분류
- **이미지 업로드 실패**: 용량 초과, 네트워크 오류.
- **AI 분석 실패**: 서버 타임아웃, 분석 불가 이미지.
- **API 인증 실패**: 토큰 만료 (로그인 리다이렉트).

### 8.2 사용자 메시지
- "이미지 용량은 5MB 이하만 업로드 가능합니다."
- "AI 분석이 완료되지 않았습니다. 잠시 후 다시 시도해주세요."
- "로그인이 필요합니다."

---

## 9️⃣ 성능 설계 (Performance Design)
- **이미지 미리보기**: `URL.createObjectURL` 사용하여 브라우저 메모리상에서 즉시 렌더링 (지연 없음).
- **Map Loading**: `useEffect`로 SDK 지연 로딩 처리.

---

## 1️⃣1️⃣ 보안 설계 (Security Design)
- JWT 토큰 기반 인증 (`getToken` 체크).
- 이미지 파일 업로드 시 클라이언트 측 타입 검증 수행.

---

## 1️⃣7️⃣ 문서 연계 (Documentation Linkage)
- 관련 파일: `ApplyImage.tsx`, `api.ts`
