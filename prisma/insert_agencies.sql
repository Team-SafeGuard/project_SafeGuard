-- =========================================================
-- Agency Data Population (Explicit IDs)
-- =========================================================

-- Clean up existing data (optional, be careful in prod)
TRUNCATE TABLE agency CASCADE;

-- 1. 중앙행정기관 (ID 1 ~ 99)
INSERT INTO agency (agency_no, agency_type, agency_name, region_code) VALUES
(1, 'CENTRAL', '경찰청', NULL),
(2, 'CENTRAL', '국토교통부', NULL),
(3, 'CENTRAL', '고용노동부', NULL),
(4, 'CENTRAL', '국방부', NULL),
(5, 'CENTRAL', '국민권익위원회', NULL),
(6, 'CENTRAL', '식품의약품안전처', NULL),
(7, 'CENTRAL', '대검찰청', NULL),
(8, 'CENTRAL', '기획재정부', NULL),
(9, 'CENTRAL', '행정안전부', NULL),
(10, 'CENTRAL', '보건복지부', NULL),
(11, 'CENTRAL', '과학기술정보통신부', NULL),
(12, 'CENTRAL', '국세청', NULL),
(13, 'CENTRAL', '기후에너지환경부', NULL),
(14, 'CENTRAL', '법무부', NULL),
(15, 'CENTRAL', '공정거래위원회', NULL),
(16, 'CENTRAL', '교육부', NULL),
(17, 'CENTRAL', '해양수산부', NULL),
(18, 'CENTRAL', '농림축산식품부', NULL),
(19, 'CENTRAL', '소방청', NULL),
(20, 'CENTRAL', '인사혁신처', NULL),
(21, 'CENTRAL', '기타', NULL);

-- 2. 광역자치단체 (ID 100 ~ 199)
INSERT INTO agency (agency_no, agency_type, agency_name, region_code) VALUES
(100, 'LOCAL', '서울특별시', '11'),
(101, 'LOCAL', '부산광역시', '26'),
(102, 'LOCAL', '대구광역시', '27'),
(103, 'LOCAL', '인천광역시', '28'),
(104, 'LOCAL', '광주광역시', '29'),
(105, 'LOCAL', '대전광역시', '30'),
(106, 'LOCAL', '울산광역시', '31'),
(107, 'LOCAL', '세종특별자치시', '36'),
(108, 'LOCAL', '경기도', '41'),
(109, 'LOCAL', '강원특별자치도', '42'),
(110, 'LOCAL', '충청북도', '43'),
(111, 'LOCAL', '충청남도', '44'),
(112, 'LOCAL', '전라북도', '45'),
(113, 'LOCAL', '전라남도', '46'),
(114, 'LOCAL', '경상북도', '47'),
(115, 'LOCAL', '경상남도', '48'),
(116, 'LOCAL', '제주특별자치도', '50');

-- 3. Reset Sequence (just in case)
SELECT setval('agency_agency_no_seq', (SELECT MAX(agency_no) FROM agency));
