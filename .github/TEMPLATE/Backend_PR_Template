```text
# ✅ Backend PR Template (Spring Boot / MyBatis / Oracle/PostgreSQL) — Enterprise-Grade

> 목적: 변경 이유/범위/검증/리스크/롤백/운영 영향까지 한 번에 파악 가능하도록 “대기업 실무 표준”에 맞춘 PR 템플릿입니다.  
> 사용법: 아래 템플릿을 그대로 PR 본문에 붙여넣고, 각 항목을 채워주세요.

---

## 0) 메타 정보 (Meta)
- PR 유형(Type): `feat | fix | refactor | perf | chore | docs | test | hotfix`
- 관련 이슈(Links): `#이슈번호` / Jira / Notion
- 담당자(Owner):
- 리뷰어(Reviewers):
- 목표 릴리즈(Target Release): `vX.Y.Z` (선택)
- 영향 범위(Env): `local | dev | stage | prod`

---

## 1) 배경/문제 정의 (Context)
> 왜 이 변경이 필요한가요? 현재 어떤 문제가 있었고, 이 PR이 어떤 상태를 “개선/해결”하나요?

- 현상(Problem):
- 원인 가설/분석(Root cause):
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
| Backend | `src/main/java/...` | Add/Mod/Del | 예: 민원 조회 API 필터 로직 추가 | Med |
| Backend | `src/main/resources/...` | Mod | 예: actuator prometheus 노출 설정 | Low |
| DB | `db/migration/...` | Add/Mod | 예: 인덱스 추가(조회 성능 개선) | High |

---

## 4) 상세 변경 내역 (Detailed Changes)

### 4.1 API / Controller (엔드포인트 단위)
| Method | Path | 변경 내용 | Request/Response 변화 | Auth(권한) | 비고 |
|---|---|---|---|---|---|
| GET | `/api/v1/...` | 예: 필터 파라미터 추가 | Req: `status` 추가 | USER/ADMIN |  |
| POST | `/api/v1/...` | 예: 검증 강화 | Res: 에러코드 추가 | ADMIN |  |

- 입력값 검증(Validation): (추가/수정/없음)
- API 문서 업데이트 여부: (O/X)
- Swagger/OpenAPI 업데이트 여부: (O/X)

---

### 4.2 Service / Business Logic
- 변경된 규칙(Before → After):
  - Before:
  - After:
- 트랜잭션:
  - `@Transactional` 적용: (O/X)
  - 전파/격리 수준:
  - 롤백 조건:

---

### 4.3 DB / Mapper / Query (MyBatis 기준)
- 변경 대상 테이블:
- DDL 변경 여부: (O/X)
  - 변경 스크립트/마이그레이션 파일:
- Query 영향:
  - [ ] Full Scan 위험 없음
  - [ ] 인덱스 검토 완료
  - [ ] 정렬/페이징 영향 검토 완료
  - [ ] N+1 위험 없음
  - [ ] 락/경합 위험 검토 완료

---

### 4.4 Exception / CommonResponse
- 공통 응답 포맷 변경 여부: (O/X)
- 에러코드 표준 준수: (O/X)
- 기존 클라이언트 호환성(Backward compatibility): 유지/깨짐
- 예외 로그 적재 여부(DB/로그): (O/X)

---

### 4.5 Security / Auth
- 인증/인가 변경:
- POST 차단/필터링:
- 민감정보 로그 노출 없음 확인: (O/X)
- 권한 우회 가능성 점검 완료: (O/X)

---

## 5) 호환성 및 영향도 (Compatibility & Impact)
- 하위 호환: 유지/깨짐
- 프론트 영향: 있음/없음
  - 영향 시 수정 필요 항목:
- 배포 영향:
  - [ ] 무중단 가능
  - [ ] 설정 변경 필요
  - [ ] 마이그레이션 필요
- 운영 영향:
  - 로그 포맷 변경: (O/X)
  - 메트릭/모니터링 변경: (O/X)

---

## 6) 테스트 및 검증 (Verification)

### 6.1 빌드/테스트
```bash
./gradlew clean build
./gradlew test
```

### 6.2 재현 Steps
1. 
2. 
3. 

### 6.3 증빙(Evidence)
- Response JSON:
- 로그:
- 스크린샷:
- (선택) 성능/응답시간 비교:

---

## 7) 리스크 & 롤백 (Risk & Rollback)
- 리스크:
- 롤백:
  - [ ] 이전 이미지 태그로 롤백 가능
  - [ ] DB 롤백 가능/불가

---

## 8) 릴리즈 노트 (Release Notes)
- 사용자 영향:
- 관리자 영향:
- 공지 필요 여부: (O/X)

---

## ✅ Checklist
- [ ] 컨벤션 준수
- [ ] 예외 처리 표준화
- [ ] 권한/검증 확인
- [ ] 문서 업데이트
```