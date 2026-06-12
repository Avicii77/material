-- ReCos 더미 데이터: 실제 화장품에 쓰이는 원료 12종
-- 소유자는 "가장 먼저 가입한 프로필"로 자동 지정됩니다.
-- 사용법: Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣기 → Run
-- (한 번만 실행하세요. 다시 돌리면 중복으로 또 들어갑니다.)

insert into public.listings
  (owner_id, title, inci_name, cas_no, manufacturer, type_category,
   function_tags, cert_tags, quantity, unit, expiry_date, has_msds, has_coa,
   price, price_negotiable, opened_status, storage_condition, status, notes)
select
  p.id, v.title, v.inci_name, v.cas_no, v.manufacturer, v.type_category,
  v.function_tags, v.cert_tags, v.quantity, 'kg', v.expiry_date, v.has_msds, v.has_coa,
  v.price, v.price_negotiable, v.opened_status, v.storage_condition, 'available', v.notes
from (select id from public.profiles order by created_at limit 1) p
cross join (values
  ('Niacinamide', 'Niacinamide', '98-92-0', 'DSM Nutritional Products', '첨가제/액티브',
    array['미백/화이트닝','피지 조절']::text[], array['REACH']::text[], 25::numeric, date '2026-12-31', true, true,
    8000::numeric, false, 'unopened', 'room', '비타민 B3. 미백 기능성 원료. 미개봉 정품, 잉여 재고 처분합니다.'),
  ('Sodium Hyaluronate', 'Sodium Hyaluronate', '9067-32-7', 'Bloomage Biotechnology', '보습제',
    array['보습','피부 장벽 강화']::text[], array[]::text[], 3::numeric, date '2027-03-31', true, true,
    210000::numeric, false, 'unopened', 'cold', '저분자 히알루론산나트륨. 냉장 보관, 미개봉.'),
  ('Tocopheryl Acetate', 'Tocopheryl Acetate', '7695-91-2', 'DSM Nutritional Products', '항산화제',
    array['항산화','피부 영양 공급']::text[], array['REACH']::text[], 10::numeric, date '2026-08-31', true, true,
    35000::numeric, false, 'unopened', 'dark', '비타민 E 아세테이트. 유효기한 임박 특가.'),
  ('Centella Asiatica Extract', 'Centella Asiatica Extract', '84696-21-9', '현대바이오랜드', '추출물',
    array['자극 완화/진정','피부 재생']::text[], array['COSMOS']::text[], 12::numeric, date '2027-01-31', true, true,
    20000::numeric, false, 'partial', 'cold', '병풀(시카) 추출물. COSMOS 인증, 일부 개봉 후 보관.'),
  ('Adenosine', 'Adenosine', '58-61-7', 'Bontac Bioengineering', '첨가제/액티브',
    array['항노화/주름 개선']::text[], array[]::text[], 1::numeric, date '2026-11-30', true, true,
    120000::numeric, false, 'unopened', 'dark', '주름 개선 고시 기능성 원료. 미개봉.'),
  ('Retinol', 'Retinol', '68-26-8', 'DSM Nutritional Products', '첨가제/액티브',
    array['항노화/주름 개선','피부 재생']::text[], array[]::text[], 1::numeric, date '2026-09-30', true, true,
    890000::numeric, true, 'unopened', 'dark', '레티놀 농축 원료. 가격 협의 가능(희망가 표시). 차광·냉암소 보관.'),
  ('Carbomer', 'Carbomer', '9007-20-9', 'Lubrizol', '점증제/점도제',
    array['제형 안정화']::text[], array[]::text[], 5::numeric, date '2027-06-30', true, false,
    45000::numeric, false, 'unopened', 'room', '카보머(Carbopol 940 동등). 점증제, 미개봉.'),
  ('Glycerin', 'Glycerin', '56-81-5', 'KLK Oleo', '보습제',
    array['보습']::text[], array['USDA']::text[], 20::numeric, date '2027-12-31', true, true,
    4000::numeric, false, 'unopened', 'room', '식물성 글리세린(USP). 대용량, 미개봉.'),
  ('Butylene Glycol', 'Butylene Glycol', '107-88-0', 'Daicel', '보습제',
    array['보습','제형 안정화']::text[], array['REACH']::text[], 18::numeric, date '2027-05-31', true, true,
    6500::numeric, false, 'unopened', 'room', '부틸렌글라이콜. 보습·용제, 미개봉.'),
  ('Cetearyl Alcohol', 'Cetearyl Alcohol', '67762-27-0', 'BASF', '유화제',
    array['제형 안정화','사용감 개선']::text[], array[]::text[], 15::numeric, date '2027-02-28', true, false,
    7000::numeric, false, 'unopened', 'room', '세테아릴알코올. 유화 보조제, 미개봉.'),
  ('Panthenol', 'Panthenol', '81-13-0', 'DSM Nutritional Products', '첨가제/액티브',
    array['보습','자극 완화/진정']::text[], array[]::text[], 8::numeric, date '2026-10-31', true, true,
    28000::numeric, false, 'unopened', 'dark', '판테놀(프로비타민 B5). 보습·진정, 미개봉.'),
  ('Alpha-Arbutin', 'Alpha-Arbutin', '84380-01-8', 'Pentapharm (DSM)', '첨가제/액티브',
    array['미백/화이트닝']::text[], array[]::text[], 2::numeric, date '2026-08-15', true, true,
    320000::numeric, true, 'unopened', 'dark', '알파-알부틴. 미백 원료, 가격 협의(희망가 표시). 유효기한 임박.')
) as v(title, inci_name, cas_no, manufacturer, type_category,
   function_tags, cert_tags, quantity, expiry_date, has_msds, has_coa,
   price, price_negotiable, opened_status, storage_condition, notes);
