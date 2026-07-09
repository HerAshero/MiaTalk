create extension if not exists "pgcrypto";

create table if not exists scene_knowledge (
  scene_id text primary key,
  scene_name text not null,
  unit_name text not null,
  scene_intro text not null,
  scene_goal text not null,
  core_vocabulary jsonb not null default '{}'::jsonb,
  core_phrases jsonb not null default '[]'::jsonb,
  textbook_key_expressions jsonb not null default '[]'::jsonb,
  core_patterns jsonb not null default '[]'::jsonb,
  real_life_topics jsonb not null default '[]'::jsonb,
  topic_keywords jsonb not null default '{}'::jsonb,
  question_practice_patterns jsonb not null default '[]'::jsonb,
  common_errors jsonb not null default '[]'::jsonb,
  mia_followup_directions jsonb not null default '[]'::jsonb,
  scene_completion_criteria jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prompt_versions (
  prompt_version_id text primary key,
  prompt_key text not null check (prompt_key in ('student_main', 'exit_summary', 'judge', 'bad_case_rubric')),
  prompt_name text not null,
  prompt_type text not null check (prompt_type in ('student_main', 'exit_summary', 'judge', 'bad_case_rubric')),
  version text not null,
  status text not null check (status in ('Draft', 'Active', 'Archived')),
  model_provider text not null default 'deepseek',
  model text not null,
  base_url_alias text not null default 'deepseek_official',
  model_config jsonb not null default '{}'::jsonb,
  content text not null,
  change_goal text,
  hypothesis text,
  change_log text,
  known_issues text,
  decision text,
  avg_score numeric,
  bad_case_rate numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  archived_at timestamptz
);

create unique index if not exists one_active_prompt_per_key
on prompt_versions (prompt_key)
where status = 'Active';

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  student_alias text not null default '小朋友',
  selected_scene_id text not null references scene_knowledge(scene_id),
  selected_scene_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_turns integer not null default 0,
  prompt_version_set jsonb not null,
  student_main_prompt_version_id text,
  student_main_prompt_version text,
  student_main_model_provider text,
  student_main_model text,
  student_main_model_config jsonb,
  exit_summary_prompt_version_id text,
  exit_summary_prompt_version text,
  exit_summary_model_provider text,
  exit_summary_model text,
  exit_summary_model_config jsonb,
  judge_prompt_version_id text,
  judge_prompt_version text,
  judge_model_provider text,
  judge_model text,
  judge_model_config jsonb,
  bad_case_rubric_version_id text,
  bad_case_rubric_version text,
  bad_case_rubric_model_provider text,
  bad_case_rubric_model text,
  bad_case_rubric_model_config jsonb,
  avg_score numeric,
  bad_case_count integer not null default 0,
  scene_completion_status text not null default 'in_progress'
);

create table if not exists turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  turn_index numeric not null,
  role text not null check (role in ('student', 'mia')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists ai_outputs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  turn_id uuid references turns(id) on delete set null,
  prompt_key text not null,
  prompt_version_id text,
  prompt_name text,
  prompt_version text,
  model_provider text,
  model text,
  model_config jsonb,
  prompt_content_snapshot text,
  selected_scene_id text,
  retrieved_knowledge_snapshot jsonb,
  raw_model_output text,
  parsed_json jsonb,
  parse_error text,
  mia_feedback text,
  next_question text,
  intent_understood text,
  highlight text,
  covered_vocabulary jsonb default '[]'::jsonb,
  covered_phrases jsonb default '[]'::jsonb,
  covered_textbook_expressions jsonb default '[]'::jsonb,
  covered_patterns jsonb default '[]'::jsonb,
  question_patterns_practiced jsonb default '[]'::jsonb,
  student_question_attempted boolean default false,
  topic_keywords_offered jsonb default '[]'::jsonb,
  vocabulary_bridge text,
  topic_depth_status text,
  expression_desire_signal text,
  expression_desire_reason text,
  error_types jsonb default '[]'::jsonb,
  main_issue text,
  corrected_sentence text,
  suggested_next_focus text,
  student_expression_confidence text,
  scene_completion_signal text,
  created_at timestamptz not null default now()
);

create table if not exists coverage_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  scene_id text not null,
  item_type text not null,
  item_value text not null,
  status text not null,
  evidence_turn_ids jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  ai_output_id uuid not null references ai_outputs(id) on delete cascade,
  intent_score numeric,
  error_detection_score numeric,
  correction_score numeric,
  grade_fit_score numeric,
  persona_score numeric,
  praise_quality_score numeric,
  followup_score numeric,
  expression_desire_score numeric,
  coverage_guidance_score numeric,
  vocabulary_bridge_score numeric,
  question_practice_score numeric,
  topic_depth_score numeric,
  scene_alignment_score numeric,
  format_score numeric,
  overall_score numeric,
  is_bad_case boolean default false,
  bad_case_type text,
  severity text,
  root_cause text,
  reason text,
  suggested_fix text,
  created_at timestamptz not null default now()
);

create table if not exists bad_cases (
  id uuid primary key default gen_random_uuid(),
  ai_output_id uuid references ai_outputs(id) on delete set null,
  issue_type text not null,
  severity text not null,
  root_cause text,
  expected_behavior text,
  fix_strategy text,
  status text not null default 'Open',
  source_prompt_key text,
  source_prompt_version_id text,
  source_prompt_version text,
  fixed_prompt_key text,
  fixed_prompt_version_id text,
  fixed_prompt_version text,
  regression_result text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists test_cases (
  id uuid primary key default gen_random_uuid(),
  scene_id text not null,
  mia_question text,
  student_input text not null,
  expected_covered_vocabulary jsonb default '[]'::jsonb,
  expected_covered_phrases jsonb default '[]'::jsonb,
  expected_covered_patterns jsonb default '[]'::jsonb,
  expected_question_patterns jsonb default '[]'::jsonb,
  expected_vocabulary_bridge text,
  expected_topic_depth_behavior text,
  expected_expression_desire_behavior text,
  expected_error_types jsonb default '[]'::jsonb,
  expected_corrected_sentence text,
  difficulty text,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table scene_knowledge enable row level security;
alter table prompt_versions enable row level security;
alter table sessions enable row level security;
alter table turns enable row level security;
alter table ai_outputs enable row level security;
alter table coverage_items enable row level security;
alter table evaluations enable row level security;
alter table bad_cases enable row level security;
alter table test_cases enable row level security;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
