# 📊 Grafana + Prometheus 모니터링 시스템 구축 완료 보고서

본 문서는 프로젝트에 적용된 **Grafana OSS + Prometheus OSS 기반 모니터링 시스템**의 상세 구축 내역과 운영 가이드입니다.

---

## 1. 🏗️ 시스템 아키텍처
기존 **Grafana Cloud(유료/SaaS)** 대신, **Docker 기반의 로컬 OSS 환경(무료)**으로 구축하였습니다.

- **Prometheus**: 각 서비스(Backend, AI)의 `/metrics` 엔드포인트에서 데이터를 주기적으로 수집(Pull 방식)하여 저장.
- **Grafana**: Prometheus에 저장된 데이터를 시각화하여 대시보드 제공.
- **Docker Compose**: 모니터링 스택(`monitoring` 폴더)을 메인 프로젝트와 분리하여 독립적으로 관리.

### 🔌 포트 구성
| 서비스 | 역할 | 포트 | 메트릭 경로 |
| :--- | :--- | :--- | :--- |
| **Grafana** | 시각화 대시보드 | `3000` | - |
| **Prometheus** | 메트릭 수집기 | `9090` | - |
| **Backend** | Spring Boot API | `8080` | `/actuator/prometheus` |
| **AI-RAG** | 민원 분류 모델 | `8001` | `/metrics` |
| **AI-STT** | 음성 인식 모델 | `8000` | `/metrics` |
| **AI-YOLO** | 이미지 분석 모델 | `5001` | `/metrics` |

---

## 2. 📂 디렉토리 구조 및 설정 파일

프로젝트 루트에 `monitoring` 디렉토리가 신설되었습니다.

### 2.1 `monitoring/docker-compose.yml`
Grafana와 Prometheus 컨테이너를 실행합니다. `host.docker.internal`을 사용하여 호스트 머신에서 실행 중인 메인 프로젝트의 컨테이너들에 접근합니다.

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    extra_hosts:
      - "host.docker.internal:host-gateway" # 호스트 네트워크 접근 허용

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
# ... (volumes 설정 등)
```

### 2.2 `monitoring/prometheus/prometheus.yml`
수집 대상을 정의한 설정 파일입니다.

```yaml
scrape_configs:
  - job_name: "backend-spring"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["host.docker.internal:8080"]

  - job_name: "ai-rag"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["host.docker.internal:8001"]
  
  # ... (ai-stt, ai-yolo 동일)
```

---

## 3. 🛠️ 서비스별 수정 내역 (적용 완료)

각 서비스가 모니터링 데이터를 노출할 수 있도록 소스 코드를 수정했습니다.

### 🟢 Backend (Spring Boot)
1.  **`build.gradle`**:
    ```groovy
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    runtimeOnly 'io.micrometer:micrometer-registry-prometheus'
    ```
2.  **`application.yml`**:
    ```yaml
    management:
      endpoints:
        web:
          exposure:
            include: health,info,prometheus
    ```

### 🔵 AI Services (FastAPI - RAG, STT, YOLO)
모든 AI 서비스(`ai/rag`, `ai/stt`, `ai/yolo`)에 공통적으로 적용되었습니다.

1.  **`requirements.txt`**:
    ```text
    prometheus-client
    ```
2.  **`app.py`** (FastAPI 앱 초기화 직후 추가):
    ```python
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi import Response

    app = FastAPI()

    @app.get("/metrics")
    def metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
    ```

3.  **Request Instrumentation (Middleware)**:
    모든 서비스에는 요청 횟수와 응답 시간을 측정하기 위한 미들웨어가 추가되었습니다.
    - `http_requests_total`: 메서드, 엔드포인트, 상태 코드별 요청 수
    - `http_request_duration_seconds`: 엔드포인트별 응답 지연 시간

---

## 4. 🚀 실행 및 접속 방법

### 1단계: 메인 프로젝트 실행 (서비스)
Backend와 AI 서비스들이 실행되어 있어야 메트릭을 수집할 수 있습니다.
```bash
# 프로젝트 루트에서
docker compose up -d
```

### 2단계: 모니터링 스택 실행
모니터링 도구는 별도의 폴더에서 실행합니다.
```bash
cd monitoring
docker compose up -d
```

### 3단계: 접속 확인
- **Grafana**: [http://localhost:3000](http://localhost:3000)
    - 초기 ID/PW: `admin` / `admin` (첫 로그인 시 비밀번호 변경)
- **Prometheus**: [http://localhost:9090](http://localhost:9090)
    - 상단 메뉴 **Status > Targets**에서 모든 서비스가 `UP` 상태인지 확인하세요.

---

## 5. ⚙️ Grafana 초기 설정 가이드 (최초 1회)

1.  **Grafana 로그인** (`admin` / `admin`)
2.  **Data Source 추가**:
    - 메뉴: `Connections` -> `Data sources` -> `Add data source`
    - **Prometheus** 선택
3.  **연결 정보 입력**:
    - **Prometheus server URL**: `http://prometheus:9090`
    - (나머지 설정은 기본값 유지)
4.  하단 **Save & test** 클릭 -> "Successfully queried the Prometheus API" 메시지 확인.

---

## 6. 📊 자동 프로비저닝 및 대시보드

현재 설정은 **자동 프로비저닝(Automated Provisioning)**이 적용되어 있어, 별도의 수동 설정 없이도 기본적인 대시보드와 데이터 소스가 구성됩니다.

### 6.1 제공되는 대시보드
- **SafeGuard Overview**: 
    - 백엔드 및 AI 서비스들의 생존 여부(Up/Down) 확인.
    - 전체 서비스의 RPS(Request Per Second) 및 평균 응답 속도 시각화.
    - 백엔드(Spring Boot) 상세 메트릭 및 AI 서비스별 엔드포인트 지표 제공.

### 6.2 대시보드 커스텀 방법
1.  `monitoring/grafana/dashboards/safeguard-overview.json` 파일을 직접 수정하거나,
2.  Grafana UI에서 설정을 변경한 뒤 `JSON Model`을 복사하여 위 파일에 덮어쓰기하면 설정이 유지됩니다.
3.  수정 후에는 `docker compose restart grafana` 명령을 통해 변경 사항을 반영하세요.
