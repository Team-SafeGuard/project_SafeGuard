-- 1. 민원 더미데이터 80건 생성 및 기관 매핑
-- (complaint 테이블에 INSERT하고, 생성된 complaint_no를 기반으로 complaint_agency에도 INSERT)

WITH data_source AS (
    SELECT
        i,
        -- 카테고리: 도로, 환경, 교통, 안전, 생활 중 랜덤
        (ARRAY['도로', '환경', '교통', '안전', '생활'])[floor(random() * 5 + 1)] as category,
        -- 제목 (고유 식별을 위해 i 포함)
        '민원 접수 테스트 - ' || i as title,
        -- 내용
        '이것은 테스트를 위해 생성된 자동 더미 민원입니다. 번호: ' || i as content,
        -- 상태: RECEIVED(접수), IN_PROGRESS(처리중), COMPLETED(완료) 랜덤
        (ARRAY['RECEIVED', 'IN_PROGRESS', 'COMPLETED'])[floor(random() * 3 + 1)] as status,
        -- 작성자: user_no 1번 (존재한다고 가정)
        (SELECT COALESCE(MIN(user_no), 1) FROM app_user) as user_no,
        -- 담당기관: 1~38 사이 랜덤 (agency 테이블 ID 범위 추정)
        (floor(random() * 38) + 1)::int as agency_no,
        -- 등록일: 최근 30일 이내 랜덤
        NOW() - (random() * interval '30 days') as created_date,
        -- 주소
        '서울특별시 테헤란로 ' || i as address,
        -- 좌표 (서울 근방)
        37.5 + (random() * 0.1) as latitude,
        127.0 + (random() * 0.1) as longitude,
        -- 공개 여부
        true as is_public,
        -- 좋아요 수
        floor(random() * 50)::int as like_count
    FROM generate_series(1, 80) AS i
),
inserted_complaints AS (
    INSERT INTO complaint (
        category, title, content, status, user_no, created_date, address, latitude, longitude, is_public, like_count
    )
    SELECT category, title, content, status, user_no, created_date, address, latitude, longitude, is_public, like_count
    FROM data_source
    RETURNING complaint_no, title
)
INSERT INTO complaint_agency (complaint_no, agency_no)
SELECT ic.complaint_no, ds.agency_no
FROM inserted_complaints ic
JOIN data_source ds ON ic.title = ds.title;


-- 2. 검증용 SQL
-- 생성된 민원 개수 (81건 이상이어야 함)
SELECT COUNT(*) as total_complaints FROM complaint;

-- 기관별 민원 분포 확인
SELECT a.agency_name, COUNT(ca.complaint_no) as count
FROM complaint_agency ca
LEFT JOIN agency a ON ca.agency_no = a.agency_no
GROUP BY a.agency_name
ORDER BY count DESC;
