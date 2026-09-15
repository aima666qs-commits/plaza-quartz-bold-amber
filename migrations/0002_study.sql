create table if not exists study_clock (
  user_id text primary key,
  study_ms bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists study_memory (
  id serial primary key,
  user_id text not null,
  kind text not null default 'note',
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists study_memory_user_idx on study_memory (user_id, created_at desc);

create table if not exists study_progress (
  user_id text not null,
  lane text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, lane)
);
