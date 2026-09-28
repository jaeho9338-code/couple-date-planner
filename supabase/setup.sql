-- A×B 데이트 플래너 스키마
-- 비공개 URL만 아는 두 사람 전용 서비스라 RLS는 단순 공개 read/write로 설정.

create table location_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,          -- 서면, 광안리, 양산, 금정구 등
  map_x numeric not null,      -- 부산-양산 일러스트 지도 위 % 좌표 (0~100)
  map_y numeric not null,
  size_weight int not null default 1,  -- 클수록 지도에서 크게 표시 (주요 장소는 2~3)
  created_at timestamptz not null default now()
);

create table date_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  location_preset_id uuid references location_presets(id),
  location_text text,          -- 프리셋 없을 때 직접 입력한 장소명
  region text,                 -- 부산-양산 밖 지역 기록용 시/도 슬러그 (예: seoul, jeju)
  title text not null,
  memo text,
  mood text,                   -- 태그/기분 (자유 텍스트)
  created_by text not null check (created_by in ('A', 'B')),
  created_at timestamptz not null default now()
);

create table date_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location_preset_id uuid references location_presets(id),
  proposed_place text,
  proposed_date date,
  status text not null default '아이디어' check (status in ('아이디어', '확정', '완료')),
  created_by text not null check (created_by in ('A', 'B')),
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid references date_logs(id) on delete set null,
  date date not null default current_date,
  amount numeric not null,
  category text,
  paid_by text not null check (paid_by in ('A', 'B')),
  memo text,
  created_at timestamptz not null default now()
);

create table anniversaries (
  id uuid primary key default gen_random_uuid(),
  title text not null,         -- 예: B 생일
  date date not null,          -- 최초 날짜 (생일이면 태어난 날짜)
  repeat_yearly boolean not null default true,
  created_by text not null check (created_by in ('A', 'B')),
  created_at timestamptz not null default now()
);

create table schedules (
  id uuid primary key default gen_random_uuid(),
  owner text not null check (owner in ('A', 'B')),
  title text not null,
  date date not null,          -- 단발 일정의 날짜, 또는 반복 일정의 시작일
  end_date date,                -- 반복 일정의 종료일 (null = 계속 반복)
  recurring text not null default 'none' check (recurring in ('none', 'weekly')),
  recurring_days int[],         -- weekly일 때만: 0=일 ~ 6=토
  start_time time,
  end_time time,
  created_by text not null check (created_by in ('A', 'B')),
  created_at timestamptz not null default now()
);

alter table location_presets enable row level security;
alter table date_logs enable row level security;
alter table date_plans enable row level security;
alter table expenses enable row level security;
alter table anniversaries enable row level security;
alter table schedules enable row level security;

create policy "public read/write - location_presets" on location_presets for all using (true) with check (true);
create policy "public read/write - date_logs" on date_logs for all using (true) with check (true);
create policy "public read/write - date_plans" on date_plans for all using (true) with check (true);
create policy "public read/write - expenses" on expenses for all using (true) with check (true);
create policy "public read/write - anniversaries" on anniversaries for all using (true) with check (true);
create policy "public read/write - schedules" on schedules for all using (true) with check (true);

-- Realtime 활성화 (Supabase Realtime이 이 테이블 변경을 브로드캐스트하도록)
alter publication supabase_realtime add table date_logs;
alter publication supabase_realtime add table date_plans;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table anniversaries;
alter publication supabase_realtime add table schedules;
