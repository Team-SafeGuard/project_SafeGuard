-- 1) 지자체 (시/도 17개)
-- =========================
INSERT INTO agency (agency_type, agency_name, region_code) VALUES
  ('LOCAL', '서울특별시', '11'),
  ('LOCAL', '부산광역시', '26'),
  ('LOCAL', '대구광역시', '27'),
  ('LOCAL', '인천광역시', '28'),
  ('LOCAL', '광주광역시', '29'),
  ('LOCAL', '대전광역시', '30'),
  ('LOCAL', '울산광역시', '31'),
  ('LOCAL', '세종특별자치시', '50'),
  ('LOCAL', '경기도', '41'),
  ('LOCAL', '강원특별자치도', '42'),
  ('LOCAL', '충청북도', '43'),
  ('LOCAL', '충청남도', '44'),
  ('LOCAL', '전북특별자치도', '45'),
  ('LOCAL', '전라남도', '46'),
  ('LOCAL', '경상북도', '47'),
  ('LOCAL', '경상남도', '48'),
  ('LOCAL', '제주특별자치도', '49')
ON CONFLICT DO NOTHING;

-- =========================
-- 2) 중앙 행정기관 (region_code = NULL)
-- =========================
INSERT INTO agency (agency_type, agency_name, region_code) VALUES
  ('CENTRAL', '경찰청', NULL),
  ('CENTRAL', '국토교통부', NULL),
  ('CENTRAL', '고용노동부', NULL),
  ('CENTRAL', '국방부', NULL),
  ('CENTRAL', '국민권익위원회', NULL),
  ('CENTRAL', '식품의약품안전처', NULL),
  ('CENTRAL', '대검찰청', NULL),
  ('CENTRAL', '기획재정부', NULL),
  ('CENTRAL', '행정안전부', NULL),
  ('CENTRAL', '보건복지부', NULL),
  ('CENTRAL', '과학기술정보통신부', NULL),
  ('CENTRAL', '국세청', NULL),
  ('CENTRAL', '기후에너지환경부', NULL),
  ('CENTRAL', '법무부', NULL),
  ('CENTRAL', '공정거래위원회', NULL),
  ('CENTRAL', '교육부', NULL),
  ('CENTRAL', '해양수산부', NULL),
  ('CENTRAL', '농림축산식품부', NULL),
  ('CENTRAL', '소방청', NULL),
  ('CENTRAL', '인사혁신처', NULL),
  ('CENTRAL', '기타', NULL)
ON CONFLICT DO NOTHING;
