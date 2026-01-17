# SafeGuard Dashboard Guide

## 1. 개요 (Overview)
Dashboard는 관리자가 민원 접수 및 처리 현황을 **실시간**으로 모니터링하고, 데이터 기반의 의사결정을 내릴 수 있도록 돕는 **중앙 관제 및 통계/분석 센터**입니다.
30초 주기의 자동 데이터 갱신, 직관적인 KPI 카드, 그리고 다양한 심층 분석 차트(Chart)를 통해 프로젝트의 핵심 현황을 시각화합니다.

---

## 2. 파일 구조 (File Structure)
대시보드는 메인 페이지 컴포넌트(`Dashboard.tsx`)와 데이터를 시각화하는 다수의 하위 차트 컴포넌트로 구성됩니다.

```
frontend/src/
├── pages/
│   └── Dashboard.tsx               # [Main] 대시보드 메인 레이아웃 및 상태 관리
└── components/
    └── Charts/
        ├── ComplaintTrendChart.tsx       # 민원 추이 및 회귀 분석 (Line Chart)
        ├── ComplaintCategoryChart.tsx    # 분야별 민원 분포 (Donut Chart)
        ├── ComplaintGrowthTrendChart.tsx # 접수/완료 증가량 비교 (Bar Chart)
        ├── DistrictBottleneckChart.tsx   # 자치구별 병목 현황 분석 (Bar Chart)
        ├── AgeGroupChart.tsx             # 민원인 연령대 분포 (Bar Chart)
        └── RegionStatsChart.tsx          # (Optional) 지역별 통계
```

---

## 3. 기술 스택 (Technical Stack)

| 구분 | 기술 / 라이브러리 | 설명 및 용도 |
| :--- | :--- | :--- |
| **Template** | **TailAdmin Free (React)** | 대시보드 전체 레이아웃 및 컬러 팔레트(`boxdark`, `strokedark` 등) 기반 |
| **Framework** | React 19, Tailwind CSS | UI 컴포넌트 구조화 및 유틸리티 기반 스타일링 |
| **Styling** | Hybrid (Tailwind + CSS) | 기본 레이아웃은 Tailwind, 복잡한 커스텀 디자인은 In-Component `<style>` 사용 |
| **Visualization** | ApexCharts.js | 반응형 인터랙티브 차트 (Line, Bar, Donut) 구현 |
| **Icons** | Lucide React | 현대적이고 깔끔한 UI 아이콘 사용 (Download, Help 등) |
| **State Mgmt** | React Hooks (useState) | 실시간 데이터 동기화(`refreshKey`) 및 타이머 상태 관리 |

> **참고**: 본 대시보드는 **TailAdmin**의 모던한 디자인 시스템(Dark Mode 호환 컬러, 카드 UI 등)을 차용하여 개발 생산성과 심미성을 높였습니다.

---

## 4. 디자인 시스템 및 스타일링 (Design & Styling)

### 4.1. TailAdmin 컬러 팔레트
`tailwind.config.js`에 정의된 커스텀 컬러를 사용하여 통일감 있는 UI를 제공합니다.
- **Primary**: `#3C50E0` (브랜드 메인 컬러)
- **BoxDark**: `#24303F` (다크모드 대응 배경색)
- **StrokeDark**: `#2E3A47` (경계선 및 디바이더)

### 4.2. 하이브리드 스타일링 전략
Tailwind CSS만으로 구현하기 힘든 복잡한 애니메이션이나 레이아웃은 컴포넌트 내부의 `<style>` 태그를 활용합니다.
- **예시**: `.animate-pulse-red` (지연 민원 강조 애니메이션)
- **장점**: 컴포넌트 단위로 스타일이 격리(Scoped)되어 유지보수가 용이합니다.

---

## 5. 핵심 컴포넌트 상세 (Component Details)

### 5.1. `Dashboard.tsx` (Main Container)
- **30초 자동 갱신**: `setInterval`을 통해 30초마다 `refreshKey`를 업데이트하여 하위 컴포넌트의 데이터 재조회를 트리거합니다.
- **SLA 툴팁**: `react-dom.createPortal`을 사용하여 메인 레이아웃의 `overflow` 속성에 영향을 받지 않고 최상위에 툴팁을 렌더링합니다.

### 5.2. 차트 컴포넌트 (`components/Charts/`)
각 차트는 독립적으로 데이터를 Fetching 하지만, 상위에서 전달받은 `refreshKey`가 변경되면 즉시 데이터를 갱신합니다.

1.  **`ComplaintCategoryChart.tsx` (Donut Chart)**
    - **역할**: 민원 유형별(교통, 안전 등) 비중을 시각화합니다.
    - **특징**: 우측의 범례(Legend)를 클릭하여 특정 카테고리를 필터링할 수 있습니다.
2.  **`ComplaintTrendChart.tsx` (Line Chart)**
    - **역할**: 일/월/년 단위 민원 접수 추이를 보여줍니다.
    - **기능**: 단순 접수량뿐만 아니라 회귀 분석(Trend Line)을 옵션으로 표시할 수 있습니다.
3.  **`DistrictBottleneckChart.tsx` (Stacked Bar Chart)**
    - **역할**: 자치구별 미처리/지연 민원 현황을 시각화하여 '병목 구간'을 식별합니다.
    - **활용**: 리소스를 어느 자치구에 집중해야 할지 판단하는 근거가 됩니다.

---

## 6. 데이터 흐름 (Data Flow)

```mermaid
flowchart TD
    Timer[30초 타이머] -->|Time out| State[refreshKey + 1]
    User[사용자 액션] -->|Filter Change| Filters[Category/TimeBasis State]
    
    State -->|Props 전달| Main[Dashboard.tsx]
    Filters -->|Props 전달| Main
    
    Main -->|Props (refreshKey)| CatChart[CategoryChart]
    Main -->|Props (refreshKey)| TrendChart[TrendChart]
    Main -->|Props (refreshKey)| BotChart[BottleneckChart]
    
    Main -->|GET /stats| API[Backend API]
    CatChart -->|GET /category-stats| API
    
    API -->|JSON Response| Main
    Main --> KPI[KPI Cards Update]
    Main --> Table[Overdue List Update]
```

---

## 7. API 명세 (API Specification)
대시보드 렌더링을 위해 호출되는 백엔드 API 목록입니다.

### 7.1. 통합 통계 (`GET /api/complaints/stats/dashboard`)
- **설명**: 화면 상단 KPI 카드 데이터 및 하단 지연 민원 리스트를 반환합니다.
- **Query Params**:
    - `category`: 필터링할 카테고리 (예: '교통', '전체')
    - `timeBasis`: 시간 기준 ('DAY', 'MONTH', 'YEAR')
- **Response**:
  ```json
  {
    "summary": {
      "total": 120,
      "received": 10,
      "processing": 50,
      "completed": 60,
      "sla_compliance": 95,
      "overdue": 2
    },
    "overdueList": [
      { "id": 150, "title": "불법주차...", "district": "강남구", "overduetime": "5일" }
    ]
  }
  }
  ```
