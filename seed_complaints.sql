-- 80 dummy complaints seed data with agency_no and spatial_feature
-- 1. Ensure test user exists
INSERT INTO app_user (user_id, pw, name, birth_date, addr, phone, role, created_date)
SELECT 'testuser', '1234', '테스트유저', '1990-01-01', '서울시 강남구', '010-1234-5678', 'USER', NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_user WHERE user_id = 'testuser');

-- 2. Clear existing test complaints for a clean start
-- Also clears spatial_feature due to CASCADE if setup, otherwise manual clear
DELETE FROM spatial_feature WHERE complaint_no IN (SELECT complaint_no FROM complaint WHERE user_no = (SELECT user_no FROM app_user WHERE user_id = 'testuser'));
DELETE FROM complaint WHERE user_no = (SELECT user_no FROM app_user WHERE user_id = 'testuser');

-- 3. Insert 80 random complaints with agency_no and spatial_feature
DO $$
DECLARE
    categories TEXT[] := ARRAY['교통', '행정·안전', '도로', '산업·통상', '주택·건축', '교육', '경찰·검찰', '환경', '보건', '관광', '기타'];
    statuses TEXT[] := ARRAY['UNPROCESSED', 'IN_PROGRESS', 'COMPLETED'];
    titles TEXT[] := ARRAY[
        '불법 주정차 신고합니다', '가로등 고장 수리 요청', '보도블럭 파손 위험', 
        '소음 공해 민원', '쓰래기 무단 투기', '배수구 막힘 조치 요청',
        '신호등 오작동 신고', '공원 벤치 파손', '공사장 먼지 발생', 
        '어린이 보호구역 속도 위반'
    ];
    base_content TEXT := '이것은 시스템에 의해 생성된 테스트 민원 내용입니다. 빠른 확인과 조치 부탁드립니다.';
    i INT;
    v_user_no BIGINT;
    v_complaint_no BIGINT;
    v_lat DOUBLE PRECISION;
    v_lng DOUBLE PRECISION;
    v_addr TEXT;
BEGIN
    SELECT user_no INTO v_user_no FROM app_user WHERE user_id = 'testuser' LIMIT 1;
    
    FOR i IN 1..80 LOOP
        v_lat := 37.5 + (random() * 0.1);
        v_lng := 127.0 + (random() * 0.1);
        v_addr := '서울시 강남구 테헤란로 ' || (100 + i);
        
        INSERT INTO complaint (
            category, title, content, address, latitude, longitude, 
            status, is_public, user_no, agency_no, created_date, updated_date, like_count
        ) VALUES (
            categories[1 + floor(random() * array_length(categories, 1))],
            titles[1 + floor(random() * array_length(titles, 1))] || ' (' || i || ')',
            base_content,
            v_addr,
            v_lat,
            v_lng,
            statuses[1 + floor(random() * array_length(statuses, 1))],
            true, -- Make it public for testing
            v_user_no,
            (SELECT agency_no FROM agency ORDER BY RANDOM() LIMIT 1),
            NOW() - (i || ' hours')::interval,
            NOW(),
            floor(random() * 50)
        ) RETURNING complaint_no INTO v_complaint_no;

        -- Insert into spatial_feature for GIS map
        INSERT INTO spatial_feature (complaint_no, geom, addr_text)
        VALUES (
            v_complaint_no,
            ST_SetSRID(ST_MakePoint(v_lng, v_lat), 4326),
            v_addr
        );
    END LOOP;
END $$;
