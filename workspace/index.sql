-- =========================================================
-- Indexes (조회/조인 최적화) - 테이블 구조 변경 없음
-- =========================================================

-- 0) 안전: 중복 생성 방지
-- (PostgreSQL 9.5+ 기준 IF NOT EXISTS 지원)

-- 1) agency: 타입/지역코드로 찾거나 목록 필터링 가능성이 높음
CREATE INDEX IF NOT EXISTS idx_agency_type ON agency(agency_type);
CREATE INDEX IF NOT EXISTS idx_agency_region_code ON agency(region_code);

-- (선택) 타입 + 지역코드 동시 필터가 잦으면 복합 인덱스가 유리
CREATE INDEX IF NOT EXISTS idx_agency_type_region ON agency(agency_type, region_code);

-- 2) app_user: user_id는 UNIQUE로 인덱스 있음.
-- role/agency_no로 관리자/기관 사용자 목록 조회 가능성이 높음
CREATE INDEX IF NOT EXISTS idx_app_user_role ON app_user(role);
CREATE INDEX IF NOT EXISTS idx_app_user_agency_no ON app_user(agency_no);

-- (선택) 기관별 + 역할별 조회가 잦으면 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_app_user_agency_role ON app_user(agency_no, role);

-- 3) complaint: 지도/목록 화면에서 가장 많이 조회될 테이블
-- - 최신순(created_date desc)
-- - 상태(status), 카테고리(category), 공개여부(is_public), 작성자(user_no) 필터
CREATE INDEX IF NOT EXISTS idx_complaint_created_date_desc ON complaint(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_user_no ON complaint(user_no);
CREATE INDEX IF NOT EXISTS idx_complaint_status ON complaint(status);
CREATE INDEX IF NOT EXISTS idx_complaint_category ON complaint(category);
CREATE INDEX IF NOT EXISTS idx_complaint_is_public ON complaint(is_public);

-- (선택) "공개 + 상태 + 최신순" 같은 목록 조회가 잦으면 복합 인덱스가 더 큼
CREATE INDEX IF NOT EXISTS idx_complaint_public_status_created_desc
ON complaint(is_public, status, created_date DESC);

-- (선택) 사용자별 마이페이지: user_no로 필터하고 created_date로 정렬이 흔함
CREATE INDEX IF NOT EXISTS idx_complaint_user_created_desc
ON complaint(user_no, created_date DESC);

-- 4) complaint_like: UNIQUE(complaint_no, user_no)는 인덱스가 이미 생김.
-- 하지만 "특정 유저가 누른 좋아요/싫어요 목록", "민원별 좋아요 목록"도 흔함
CREATE INDEX IF NOT EXISTS idx_complaint_like_user_no ON complaint_like(user_no);
CREATE INDEX IF NOT EXISTS idx_complaint_like_complaint_no ON complaint_like(complaint_no);

-- (선택) like/dislike 타입까지 포함해 집계/필터 잦으면
CREATE INDEX IF NOT EXISTS idx_complaint_like_complaint_type ON complaint_like(complaint_no, type);

-- 5) complaint_agency: PK(complaint_no, agency_no)는 인덱스가 생김.
-- 기관 기준으로 민원 찾는 경우(agency_no WHERE ...)는 역방향 인덱스가 필요
CREATE INDEX IF NOT EXISTS idx_complaint_agency_agency_no ON complaint_agency(agency_no);

-- 6) spatial_feature: 지도 범위검색은 geom에 GIST가 핵심
-- PostGIS 공간 인덱스
CREATE INDEX IF NOT EXISTS idx_spatial_feature_geom_gist ON spatial_feature USING GIST(geom);

-- complaint_no로 조인하거나, feature_type으로 필터할 수도 있음
CREATE INDEX IF NOT EXISTS idx_spatial_feature_complaint_no ON spatial_feature(complaint_no);
CREATE INDEX IF NOT EXISTS idx_spatial_feature_feature_type ON spatial_feature(feature_type);

-- 7) error_logs: 시간순 조회, trace_id로 추적, endpoint/method로 필터
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp_desc ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_trace_id ON error_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint_method ON error_logs(endpoint, http_method);

-- (선택) 사용자별 에러 조회를 한다면
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
