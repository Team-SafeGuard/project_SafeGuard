-- 80 Dummy Complaints Seed Script (v4)
-- Focused on correct Agency Assignment via complaint_agency table

-- [Section 0: Cleanup existing test data]
DELETE FROM complaint_agency WHERE complaint_no IN (SELECT complaint_no FROM complaint WHERE user_no = (SELECT user_no FROM app_user WHERE user_id = 'testuser'));
DELETE FROM spatial_feature WHERE complaint_no IN (SELECT complaint_no FROM complaint WHERE user_no = (SELECT user_no FROM app_user WHERE user_id = 'testuser'));
DELETE FROM complaint WHERE user_no = (SELECT user_no FROM app_user WHERE user_id = 'testuser');

-- [Section A & B: complaint INSERT & complaint_agency INSERT]
DO $$
DECLARE
    curr_complaint_no BIGINT;
    v_user_no BIGINT;
    v_agency_no BIGINT;
    i INT;
    categories TEXT[] := ARRAY['교통', '행정·안전', '도로', '환경', '주택·건축'];
    titles TEXT[] := ARRAY['불법 주정차 신고', '가로등 고장', '보도블럭 파손', '소음 공해', '쓰레기 투기'];
BEGIN
    -- Get testuser ID
    SELECT user_no INTO v_user_no FROM app_user WHERE user_id = 'testuser' LIMIT 1;
    
    FOR i IN 1..80 LOOP
        -- [Part A: complaint INSERT]
        -- Note: We omit agency_no here as it is not the source of truth
        INSERT INTO complaint (
            category, title, content, address, latitude, longitude, 
            status, is_public, user_no, created_date, updated_date, like_count
        ) VALUES (
            categories[1 + floor(random() * 5)],
            titles[1 + floor(random() * 5)] || ' (' || (240 + i) || ')',
            '시스템에서 자동 생성된 테스트 민원입니다. 담당 부서의 빠른 처리를 바랍니다.',
            '서울시 강남구 테헤란로 ' || (100 + i),
            37.5 + (random() * 0.1),
            127.0 + (random() * 0.1),
            CASE WHEN i % 3 = 0 THEN 'IN_PROGRESS' WHEN i % 5 = 0 THEN 'COMPLETED' ELSE 'UNPROCESSED' END,
            true,
            v_user_no,
            NOW() - (i || ' hours')::interval,
            NOW(),
            floor(random() * 50)
        ) RETURNING complaint_no INTO curr_complaint_no;

        -- [Part B: complaint_agency INSERT]
        -- Explicitly assign to valid agencies (소방청: 36, 경찰청 등 기존 상위 기관 위주)
        SELECT agency_no INTO v_agency_no 
        FROM agency 
        WHERE agency_no IN (1, 2, 9, 36, 12, 15, 20) -- 서울, 부산, 경기, 소방청, 충남 등
        ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO complaint_agency (complaint_no, agency_no)
        VALUES (curr_complaint_no, v_agency_no);

        -- [Part C: spatial_feature for GIS]
        INSERT INTO spatial_feature (complaint_no, geom, addr_text)
        VALUES (
            curr_complaint_no,
            ST_SetSRID(ST_MakePoint(127.0 + (random() * 0.1), 37.5 + (random() * 0.1)), 4326),
            '서울시 강남구 테헤란로 ' || (100 + i)
        );
    END LOOP;
END $$;
