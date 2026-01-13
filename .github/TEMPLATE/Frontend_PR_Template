```text
# ✅ Frontend PR Template (React / Vite / Tailwind) — Enterprise-Grade
> PR 제목은 항상 한국어로 작성한다.

> 목적: UI 변경사항, 사용자 플로우, API 연동, 성능/접근성/호환성/리스크/롤백까지 한 번에 확인 가능한 PR 템플릿입니다.
> 사용법: 아래 템플릿을 그대로 PR 본문에 붙여넣고, 각 항목을 채워주세요.

---

## 0) 메타 정보 (Meta)
- PR 유형(Type): `feat | fix | refactor | perf | chore | ui | docs | test | hotfix`
- 관련 이슈(Links): `#이슈번호` / Jira / Notion / Figma
- 담당자(Owner):
- 리뷰어(Reviewers):
- 목표 릴리즈(Target Release): `vX.Y.Z` (선택)
- 영향 범위(Env): `local | dev | stage | prod`

---

## 1) 배경/목표 (Context)
> 어떤 UX/기능 문제를 해결하나요? 사용자가 어떤 불편을 겪었고, 무엇이 개선되나요?

- 현상(Problem):
- 사용자 영향(User Impact):
- 목표(Goal):
- 범위(Scope): (포함/제외)
  - 포함:
  - 제외:

---

## 2) 변경 요약 (Executive Summary)
> 리뷰어가 30초 안에 이해할 수 있도록 3~7줄로 요약합니다.

- 
- 
- 

---

## 3) 변경 파일 목록 (Changed Files)
> “어떤 파일을 왜 바꿨는지” 한 눈에 보이도록 표로 작성합니다.

| 구분 | 파일 경로 | 변경 유형 | 변경 요약 | 영향(High/Med/Low) |
|---|---|---|---|---|
| FE | `src/pages/...` | Add/Mod/Del | 예: 민원 목록 화면 필터 UI 추가 | High |
| FE | `src/components/...` | Add/Mod/Del | 예: 공통 EmptyState 컴포넌트 추가 | Med |
| FE | `src/routes/...` | Mod | 예: 라우팅/가드 로직 변경 | Med |
| FE | `src/utils/api.ts` | Mod | 예: API 에러 처리/인터셉터 개선 | Med |
| FE | `src/styles/...` | Mod | 예: 반응형 레이아웃/간격 수정 | Low |
| FE | `src/assets/...` | Add/Del | 예: 아이콘 교체/정리 | Low |

---

## 4) 상세 변경 내역 (Detailed Changes)

### 4.1 화면/라우팅 (Screens & Routing)
> 사용자 플로우 관점으로 작성합니다.

- 신규 화면:
- 수정 화면:
- 제거 화면:
- 라우팅 변경:
  - Before:
  - After:
- 권한/접근 제어(Route Guard):
  - 대상:
  - 조건:

---

### 4.2 UI/UX 변경 (UI/UX)
- UI 변경 포인트(핵심 3개):
  1)
  2)
  3)
- 반응형(Responsive): (O/X)
  - 확인 해상도: (예: 1920, 1440, 1024, 768, 390)
- 접근성(A11y):
  - [ ] ARIA 속성 적용/검토
  - [ ] 키보드 탭 이동 가능
  - [ ] 포커스 스타일 확인
  - [ ] 대비/가독성(텍스트/버튼) 확인
- 상태 UI 처리:
  - [ ] Loading (Skeleton/Spinner)
  - [ ] Empty State
  - [ ] Error State (Fallback + 사용자 메시지)

---

### 4.3 API 연동 / 상태관리 (API & State)
- 연동 API 목록:
  - `GET /api/v1/...` (설명)
  - `POST /api/v1/...` (설명)
- 상태관리 방식:
  - useState/useReducer/zustand/redux/react-query 등
- 에러 처리 정책:
  - 사용자 메시지 노출 기준:
  - 재시도(retry) 여부:
  - 토스트/모달/인라인 에러 표시:
- 인증/토큰 처리:
  - 토큰 저장 위치(localStorage/cookie 등):
  - 만료/갱신 처리:

---

### 4.4 성능 고려 (Performance)
> 대기업 기준에서 “렌더링/번들/리스트/차트” 이슈를 체크합니다.

- 렌더링 최적화:
  - [ ] 불필요 re-render 제거
  - [ ] memo/useMemo/useCallback 적용 검토
  - [ ] 의존성 배열 정확성 점검
- 대용량 리스트:
  - [ ] pagination 적용
  - [ ] virtualization 적용(필요 시)
- 차트/대시보드:
  - [ ] 데이터 가공 비용 최소화
  - [ ] interval/refetch 빈도 적절
- 번들 영향:
  - 신규 라이브러리 도입 여부: (O/X)
  - 대체 가능 라이브러리 검토: (O/X)

---

## 5) 호환성 및 영향도 (Compatibility & Impact)
- 브라우저 호환:
  - [ ] Chrome
  - [ ] Edge
  - [ ] Safari (필요 시)
  - [ ] Firefox (필요 시)
- 환경 영향:
  - env 변경 필요 여부: (O/X)
  - baseURL 변경 여부: (O/X)
- 백엔드 영향(스펙 변경 수반 여부): 있음/없음
  - 있으면: 연관 PR/커밋 링크

---

## 6) 테스트 및 검증 (Verification)

### 6.1 실행
```bash
npm install
npm run dev
```

### 6.2 재현 가능한 테스트 시나리오
1.
2.
3.

### 6.3 테스트 결과
- [ ] 로컬에서 정상 동작
- [ ] 콘솔 에러 없음
- [ ] 라우팅 정상
- [ ] API 연동 정상
- [ ] 로딩/빈상태/에러상태 정상

---

## 7) 증빙 (Evidence)
- Before (스크린샷/영상):
- After (스크린샷/영상):
- 네트워크 탭(요청/응답) 캡처:
- 기타(로그/성능 비교):

---

## 8) 리스크 & 롤백 (Risk & Rollback)
- 리스크:
- 롤백:
  - [ ] 이전 배포 버전으로 롤백 가능
  - [ ] Feature Flag/Toggle 적용 여부: (O/X)

---

## 9) 릴리즈 노트 (Release Notes)
- 사용자 영향:
- 관리자 영향(관리자 UI 변경 시):
- 공지 필요 여부: (O/X)

---

## 10) 리뷰 포인트 (Review Focus)
> 리뷰어가 특히 집중해서 봐야 할 부분을 작성합니다.

- 
- 

---

## ✅ Checklist
- [ ] eslint / prettier 통과
- [ ] 타입 에러 없음(TypeScript 사용 시)
- [ ] UI 깨짐 없음(반응형/브라우저)
- [ ] 접근성/상태 UI 처리 완료
- [ ] 하드코딩 제거(상수화)
- [ ] env/baseURL 정리
- [ ] 불필요 파일 정리(미사용 컴포넌트/asset)
```