# 📌 기능 설계 문서

📌 운영 원칙
PR 태그에 체크한 항목만 details 열고 나머지는 삭제
리뷰 시 필요한 부분만 펼쳐서 확인 가능


# 🧠 Feature Design & Operation Specification — <Map View Page>
> 지도 보기 및 핫스팟 분석 페이지 (MapView.tsx)

---

## 0️⃣ 문서 통제 정보 (Document Control)

### 문서 기본 정보
- 문서 ID: GEN-010
- 기능명: 민원 지도 및 핫스팟 (Complaint Map & Hotspots)
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
- 지역별 민원 분포를 시각화하여 특정 구역에 집중된 문제(핫스팟)를 식별.
- 리스트 형태보다 직관적으로 주변 민원 현황을 파악하고 교통/안전 등 카테고리별 패턴 분석을 돕음.

---

## 3️⃣ 요구사항 정의 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 |
|---|--------|--------|
| FR-1 | Kakao Maps API를 사용하여 민원 위치를 마커로 표시해야 한다. | Must |
| FR-2 | 마커가 많을 경우 클러스터링(Clustering)하여 가시성을 확보해야 한다. | Must |
| FR-3 | '핫스팟 모드' 전환 시 밀집 구역을 폴리곤이나 히트맵 형태로 시각화해야 한다. | Should |
| FR-4 | 지도를 이동하거나 축소/확대할 때마다(idle 이벤트) 해당 영역의 데이터를 다시 로드해야 한다. | Must |
| FR-5 | 마커 클릭 시 사이드바에서 해당 민원의 요약 정보를 확인할 수 있어야 한다. | Must |

---

## 4️⃣ 기능 책임 및 경계 (Responsibility & Boundary)

### 4.1 책임 범위
- 지도 SDK 초기화, 마커/폴리곤 오버레이 렌더링, 사이드바 데이터 바인딩.

## 5️⃣ 시스템 아키텍처 상세 (Architecture)

### 5.1 논리 아키텍처
- `MapView.tsx` -> `complaintsAPI` (getMapItems, getHotspots)
- 3rd Party: Kakao Maps SDK (MarkerClusterer, Polygon)

### 5.4 기술 스택 (Technology Stack)
- React Hooks (`useRef`, `useLayoutEffect` for DOM manipulation)
- Kakao Maps JavaScript API

---

## 7️⃣ 상세 설계 (Detailed Design)

### 7.2 핵심 비즈니스 로직 및 산출 공식 (Core Business Logic & Formulas)
- **Bounds Query**: `map.getBounds()`를 호출하여 SW(남서), NE(북동) 좌표를 백엔드로 전송.
- **핫스팟 컬러 스펙트럼**: 민원 수에 따라 파랑(낮음) -> 초록 -> 노랑 -> 주황 -> 빨강(높음)으로 색상 매핑.
- **마커 이미지 SVG 생성**: 상태(처리중/미처리)에 따라 색상이 다른 SVG를 Data URI로 동적 생성하여 마커 이미지로 사용.

### 7.4 인터페이스 및 API 설계 (Interface & API Design)
1.  **GET `/api/complaints/map`**
    -   Input: `{ swLat, swLng, neLat, neLng, zoom }`
    -   Output: `[{ lat, lng, complaintNo, status, category, ... }]`
2.  **GET `/api/complaints/hotspots`**
    -   Input: `{ swLat, swLng, neLat, neLng, zoom }`
    -   Output: `[{ count: 10, points: [{lat, lng}, ...] }]` (Polygon Data)

---

## 8️⃣ 예외·오류 처리 설계 (Exception & Error Handling)

### 8.1 오류 분류
- **API 키 누락**: 화면 중앙에 "카카오 맵 API 키가 필요합니다" 안내 메시지 표시.
- **좌표 오류**: 유효하지 않은 위경도 데이터는 렌더링에서 제외.

---

## 1️⃣7️⃣ 문서 연계 (Documentation Linkage)
- 관련 파일: `MapView.tsx`
