-- ============================================================
-- 라퀴진 클럽(요리 동호회) 사이트 - 데이터베이스 스키마
-- Supabase 대시보드 > SQL Editor > New query 에서 전체 실행하세요.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) 공지사항 게시판
create table if not exists cook_notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author text not null default '운영진',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) 레시피 게시판
create table if not exists cook_recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default '기타', -- 메인 / 디저트 / 음료 / 기타
  content text not null,
  author text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) 정기모임 안내
create table if not exists cook_meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  meeting_time text,
  location text not null,
  theme text not null,
  host text,
  max_participants integer,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security
-- ⚠️ 강의/데모용 설정입니다. 익명(anon) 사용자에게 전체 CRUD를 열어둡니다.
--    실제 서비스로 전환할 때는 반드시 인증(로그인)을 붙이고,
--    insert/update/delete 정책을 "본인 글만" 등으로 좁혀야 합니다.
-- ------------------------------------------------------------
alter table cook_notices enable row level security;
alter table cook_recipes enable row level security;
alter table cook_meetings enable row level security;

create policy "cook_notices_select" on cook_notices for select using (true);
create policy "cook_notices_insert" on cook_notices for insert with check (true);
create policy "cook_notices_update" on cook_notices for update using (true);
create policy "cook_notices_delete" on cook_notices for delete using (true);

create policy "cook_recipes_select" on cook_recipes for select using (true);
create policy "cook_recipes_insert" on cook_recipes for insert with check (true);
create policy "cook_recipes_update" on cook_recipes for update using (true);
create policy "cook_recipes_delete" on cook_recipes for delete using (true);

create policy "cook_meetings_select" on cook_meetings for select using (true);
create policy "cook_meetings_insert" on cook_meetings for insert with check (true);
create policy "cook_meetings_update" on cook_meetings for update using (true);
create policy "cook_meetings_delete" on cook_meetings for delete using (true);

-- ------------------------------------------------------------
-- 샘플 데이터 (없어도 되면 이 아래 블록은 지우고 실행하세요)
-- ------------------------------------------------------------
insert into cook_notices (title, content, author) values
('라퀴진 클럽에 오신 것을 환영합니다', '매달 셋째 주 토요일, 함께 요리하고 나누는 모임입니다. 첫 방문이시라면 소개 페이지를 먼저 읽어주세요.', '운영진'),
('9월 정기모임 장소 변경 안내', '이번 달 모임 장소가 마포 공유주방으로 변경되었습니다. 참가 신청하신 분들께는 별도로 안내드렸습니다.', '운영진'),
('회비 및 재료비 안내', '월 회비는 1만원이며, 모임 당일 재료비는 실비로 정산합니다. 자세한 내용은 오시는길 페이지의 문의처로 연락 주세요.', '운영진');

insert into cook_recipes (title, category, content, author) values
('가을 버섯 크림 리조또', '메인', '표고, 양송이, 새송이 버섯을 듬뿍 넣고 파르미지아노로 마무리한 리조또입니다. 화이트와인으로 디글레이즈하는 게 포인트예요.', '김지수'),
('타르트 타탱', '디저트', '사과를 캐러멜에 조린 뒤 뒤집어 굽는 프랑스식 사과 타르트. 실온에 살짝 식힌 뒤 바닐라 아이스크림과 함께 드세요.', '박서연'),
('뱅쇼 한 냄비', '음료', '레드와인에 오렌지, 시나몬, 정향을 넣고 은근하게 데우면 완성. 알코올이 부담스러우면 포도주스로 대체해도 좋아요.', '이하늘');

insert into cook_meetings (meeting_date, meeting_time, location, theme, host, max_participants, description) values
(current_date + interval '14 days', '오후 2시', '마포 공유주방 3층', '가을 제철 버섯 요리', '이하늘', 12, '버섯 손질법부터 리조또, 스프까지 함께 만들어봅니다. 앞치마와 재료는 준비되어 있어요.'),
(current_date + interval '45 days', '오후 2시', '연남동 스튜디오 키친', '프랑스 가정식 디저트', '박서연', 10, '타르트 타탱과 크렘 브륄레를 만들어봅니다. 초보자도 환영합니다.');
