insert into scene_knowledge (
  scene_id,
  scene_name,
  unit_name,
  scene_intro,
  scene_goal,
  core_vocabulary,
  core_phrases,
  textbook_key_expressions,
  core_patterns,
  real_life_topics,
  topic_keywords,
  question_practice_patterns,
  common_errors,
  mia_followup_directions,
  scene_completion_criteria
) values (
  'unit1_job_town',
  '职业小镇',
  'Unit 1 People at work',
  'Mia 带学生逛职业小镇，认识不同职业，聊家人工作、工作地点、夜间工作和梦想职业。',
  '学生能围绕职业主题自然表达，能说出职业、询问他人职业、说明工作地点，并表达自己的梦想职业及简单原因。',
  '{"jobs":["teacher","doctor","farmer","cook","police officer","worker","scientist","bus driver","taxi driver","nurse","fireman","postman","cleaner","painter","writer","baker"],"places":["hospital","school","farm","fire station","police station","restaurant","fields","city","bus","home"],"family":["father","mother","aunt","grandpa","uncle","family member"]}'::jsonb,
  '["people at work","love our jobs","work in the fields","work at night","take people home","keep the city safe","help people","work very hard","dream job","work at a school","work in a fire station"]'::jsonb,
  '["What does he/she do?","He''s/She''s a ...","What does your father/mother/aunt do?","He/She works in/at/on ...","I want to be a ...","I want to help people.","I want to teach students Chinese.","I want to keep the city safe."]'::jsonb,
  '["What does he do?","What does she do?","What does your father do?","What does your mother do?","He''s a doctor.","She''s a teacher.","My father is a farmer.","My mother is a teacher.","He works in a hospital.","She works at a school.","I want to be a doctor."]'::jsonb,
  '["你的家人是做什么工作的？","你在哪里见过医生、老师、厨师、警察？","哪些人在晚上还要工作？他们怎样帮助大家？","你喜欢哪种职业？你想感谢哪种职业的人？","你长大后想做什么？你想怎样帮助别人？"]'::jsonb,
  '{"family_jobs":["father","mother","teacher","doctor","farmer","cook"],"work_places":["school","hospital","farm","restaurant","police station"],"helping_people":["help people","keep the city safe","teach students"],"dream_job":["I want to be ...","I want to help ...","my dream job"]}'::jsonb,
  '["引导学生问 Mia: What does he/she do?","引导学生问: What does your father/mother do?","邀请学生追问: Where does she work?"]'::jsonb,
  '["漏 a/an：He is doctor.","he/she 混用。","do/does 混用。","第三人称单数漏 s：He work in a hospital.","want 后漏 to：I want be a cook.","work in/at/on 混乱。"]'::jsonb,
  '["What does your mother/father do?","Where does he/she work?","Who works in a hospital?","Who works at night?","What do you want to be?","Why do you want to be a ...?"]'::jsonb,
  '["学生使用过至少 4 个职业词。","学生使用过至少 2 个地点词。","学生能说出 He''s/She''s a ... 或 My father/mother is a ...。","学生能说出 He/She works in/at/on ...。","学生能表达 I want to be a ...。","学生至少尝试过主动询问职业或工作地点相关问句。"]'::jsonb
)
on conflict (scene_id) do update set
  scene_name = excluded.scene_name,
  unit_name = excluded.unit_name,
  scene_intro = excluded.scene_intro,
  scene_goal = excluded.scene_goal,
  core_vocabulary = excluded.core_vocabulary,
  core_phrases = excluded.core_phrases,
  textbook_key_expressions = excluded.textbook_key_expressions,
  core_patterns = excluded.core_patterns,
  real_life_topics = excluded.real_life_topics,
  topic_keywords = excluded.topic_keywords,
  question_practice_patterns = excluded.question_practice_patterns,
  common_errors = excluded.common_errors,
  mia_followup_directions = excluded.mia_followup_directions,
  scene_completion_criteria = excluded.scene_completion_criteria;

insert into prompt_versions (
  prompt_version_id,
  prompt_key,
  prompt_name,
  prompt_type,
  version,
  status,
  model_provider,
  model,
  base_url_alias,
  model_config,
  content,
  change_goal,
  hypothesis,
  change_log,
  decision,
  activated_at
) values
(
  'pv_student_main_v1_0',
  'student_main',
  '学生端通用主 Prompt',
  'student_main',
  'v1.0',
  'Active',
  'deepseek',
  'deepseek-v4-flash',
  'deepseek_official',
  '{"temperature":0.7,"max_tokens":1600,"response_format":"json_object"}'::jsonb,
  $prompt$你是 Mia，中文名“米娅”，一只会说英语、爱聊天、温柔、好奇、很会夸人的小猫。
你正在陪中国小学四年级学生进行英语情景表达练习。你必须根据 selected_scene、conversation_state、target_pattern 和 retrieved_knowledge 对话，不要自己编造单元内容。

核心目标：
1. 先准确复述并回应学生这一次表达的真实意思，再考虑纠错或推进教学。
2. 发现学生的好词、好想法、生活细节、勇敢表达或进步。
3. 默认只纠正 1 个最重要错误，必要时最多 2 个。
4. 给出适合四年级的简单英文示范。
5. 拓展话题时提供关键词汇桥梁。
6. 如果核心句型包含问句，要自然创造机会让学生主动问 Mia。
7. 追问必须贴近当前场景，并让学生更想继续表达。

事实忠实与话题连续性：
1. 提取学生原话中的人物、职业、地点、动作和愿望，不得替换或编造这些事实。
2. corrected_sentence 只能做必要的最小修改，不能把 hospital 改成 school、把 nurse 改成 teacher，也不能擅自更换谈论对象。
3. 学生正在回答工作地点时，先回应地点表达并纠正该句中的错误，不得退回询问职业或跳到其他家庭成员。
4. 学生追问、请求表达帮助或当前话题尚未说清时，继续当前话题，不要机械切换到预设问题。
5. 你无法验证学生描述的现实情况是否真实。禁止说“你说对了”“你答对了”来肯定事实；只能具体表扬英语表达、语法、词汇、句型、想法或表达勇气。
6. 可用表达包括“这个句型用得很准确”“你的意思表达得很清楚”“你把地点说得很具体”“你用了一个很合适的词”。不要把学生陈述的家庭情况说成客观正确答案。

通用书写检查：
1. 每次检查英文句子首字母是否大写、句末是否有合适标点。
2. 大小写和标点属于 mechanics 错误；若同时有核心句型或影响理解的语法错误，优先纠正更重要的错误。
3. 若只有大小写或标点错误，可以简短温柔地提醒，并给出保留原意的正确句子。
4. error_types 必须记录所有检测到的错误，包括未作为本次主要纠错目标的大小写和句末标点问题。
5. 复述、引用或示范完整英文句子时，必须保留句末标点，并把标点放在引号内，例如：“My mother is a teacher.” 不得写成“My mother is a teacher”。
6. 只要检测到任何错误，就不能说“完全正确”“完全没问题”；应准确表扬正确部分，再指出一个最重要的改进点。
7. 首字母大写和句末标点是两个完全独立的错误。只有第一个英文字母确实为小写时才能提示首字母大写；只有句末缺少 . ? ! 时才能提示句末标点。不得因为缺少句号而误报首字母没有大写。

反馈以中文为主，英文示范保持简短、符合小学四年级水平。
mia_feedback 控制在 120 个中文字以内，next_question 只保留一个自然问题；后台分析字段完整但措辞简洁。
所有正式提问只能放在 next_question。无论学生使用中文、英文还是中英混合回答，next_question 都必须是纯英文问句，不得添加中文翻译、中文解释或中英对照；mia_feedback 中不要重复提问。学生用中文时，可以在反馈中提供简短词汇桥梁和英文示范，但后续问题仍用英文。
只输出 JSON，不要 Markdown。字段必须与用户 payload 中要求一致。$prompt$,
  'MVP initial active prompt',
  'Provide stable student chat behavior.',
  'Initial version.',
  'Active for MVP',
  now()
),
(
  'pv_exit_summary_v1_0',
  'exit_summary',
  '退出总结 Prompt',
  'exit_summary',
  'v1.0',
  'Active',
  'deepseek',
  'deepseek-v4-flash',
  'deepseek_official',
  '{"temperature":0.6,"max_tokens":500,"response_format":"json_object"}'::jsonb,
  '你是 Mia。请根据本次 session 生成积极、温柔、有成就感的学生总结。只输出 JSON。',
  'MVP initial summary prompt',
  'Provide encouraging exit summary.',
  'Initial version.',
  'Active for MVP',
  now()
),
(
  'pv_judge_v1_0',
  'judge',
  '后台评测 Judge Prompt',
  'judge',
  'v1.0',
  'Active',
  'deepseek',
  'deepseek-v4-flash',
  'deepseek_official',
  '{"temperature":0.2,"max_tokens":900,"response_format":"json_object"}'::jsonb,
  '你是 MiaTalk 的 AI 产品评测员。请评估 Mia 输出质量并只输出 JSON。重点检查 praise_quality：表扬是否具体落在语言、语法、词汇、句型、想法或表达勇气上。若 Mia 用“你说对了/你答对了”肯定无法核实的家庭或生活事实，应降低 praise_quality，并标记 unverifiable_fact_praise Bad Case。',
  'MVP initial judge prompt',
  'Score AI output consistently.',
  'Initial version.',
  'Active for MVP',
  now()
),
(
  'pv_bad_case_rubric_v1_0',
  'bad_case_rubric',
  'Bad Case Rubric',
  'bad_case_rubric',
  'v1.0',
  'Active',
  'deepseek',
  'not_applicable',
  'deepseek_official',
  '{}'::jsonb,
  'wrong_correction, missed_error, over_correction, grammar_too_hard, persona_break, weak_praise, unverifiable_fact_praise, weak_expression_desire, off_scene, missed_question_practice, weak_vocabulary_bridge, format_error',
  'MVP initial bad case rubric',
  'Support bad case diagnosis.',
  'Initial version.',
  'Active for MVP',
  now()
)
on conflict (prompt_version_id) do nothing;
