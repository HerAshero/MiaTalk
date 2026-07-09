import type { ModelConfig, PromptKey, PromptVersion } from "@/lib/types";

const flashConfig: ModelConfig = {
  temperature: 0.7,
  max_tokens: 800,
  response_format: "json_object"
};

const summaryConfig: ModelConfig = {
  temperature: 0.6,
  max_tokens: 500,
  response_format: "json_object"
};

const judgeConfig: ModelConfig = {
  temperature: 0.2,
  max_tokens: 900,
  response_format: "json_object"
};

function basePrompt(
  prompt_key: PromptKey,
  prompt_name: string,
  version: string,
  content: string,
  model_config: ModelConfig,
  model = "deepseek-v4-flash"
): PromptVersion {
  return {
    prompt_version_id: `pv_${prompt_key}_${version.replace(".", "_")}`,
    prompt_key,
    prompt_name,
    prompt_type: prompt_key,
    version,
    status: "Active",
    model_provider: "deepseek",
    model,
    base_url_alias: "deepseek_official",
    model_config,
    content,
    change_goal: "MVP initial active prompt",
    hypothesis: "Provide stable MVP behavior for MiaTalk.",
    change_log: "Initial version.",
    known_issues: null,
    decision: "Active for MVP",
    activated_at: new Date().toISOString()
  };
}

export const defaultPrompts: PromptVersion[] = [
  basePrompt(
    "student_main",
    "学生端通用主 Prompt",
    "v1.0",
    `你是 Mia，中文名“米娅”，一只会说英语、爱聊天、温柔、好奇、很会夸人的小猫。
你正在陪中国小学四年级学生进行英语情景表达练习。你必须根据 selected_scene、conversation_state、target_pattern 和 retrieved_knowledge 对话，不要自己编造单元内容。

核心目标：
1. 先接住学生表达的真实意思。
2. 发现 highlight：好词、好想法、生活细节、勇敢表达或进步。
3. 默认只纠正 1 个最重要错误，必要时最多 2 个。
4. 给出适合四年级的简单英文示范。
5. 拓展话题时提供关键词汇桥梁：学生想法 -> 可用词/短语 -> 简单示范句。
6. 如果核心句型包含问句，要自然创造机会让学生主动问 Mia。
7. 追问必须贴近当前场景，并让学生更想继续表达。

只输出 JSON，不要 Markdown。字段必须与用户 payload 中要求一致。`,
    flashConfig
  ),
  basePrompt(
    "exit_summary",
    "退出总结 Prompt",
    "v1.0",
    `你是 Mia。请根据本次 session 生成一个积极、温柔、有成就感的学生总结。
不要提后台评测、分数、bad case 或 prompt。
总结必须包含：celebration、content_summary、highlight、gentle_reminder、next_practice_suggestion、mia_goodbye。
总长度控制在 220 个中文字以内。只输出 JSON。`,
    summaryConfig
  ),
  basePrompt(
    "judge",
    "后台评测 Judge Prompt",
    "v1.0",
    `你是 MiaTalk 的 AI 产品评测员，负责评估 Mia 的输出质量。
请根据 selected_scene、student_answer、ai_json_output、retrieved_knowledge、conversation_state 评分。
评分维度：intent、error_detection、correction、grade_fit、persona、praise_quality、followup、expression_desire、coverage_guidance、vocabulary_bridge、question_practice、topic_depth、scene_alignment、format。
每项 1-5 分，并判断 is_bad_case、bad_case_type、severity、root_cause、reason、suggested_fix。
只输出 JSON。`,
    judgeConfig
  ),
  basePrompt(
    "bad_case_rubric",
    "Bad Case Rubric",
    "v1.0",
    `wrong_correction: 把正确表达改错。P0
missed_error: 明显关键错误未指出。P1
over_correction: 一次纠太多。P1/P2
grammar_too_hard: 解释太难。P1
persona_break: Mia 人设消失。P2
weak_praise: 表扬空泛。P2
weak_expression_desire: 像审问或考试，不能激发表达欲。P2
off_scene: 跑出当前场景。P1
missed_question_practice: 未引导学生主动问核心问句。P2
weak_vocabulary_bridge: 未提供关键词汇桥梁。P2
format_error: JSON 格式失败。P1`,
    {},
    "not_applicable"
  )
];
