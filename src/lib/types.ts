export type PromptKey =
  | "student_main"
  | "exit_summary"
  | "judge"
  | "bad_case_rubric";

export type PromptStatus = "Draft" | "Active" | "Archived";

export type ModelConfig = {
  temperature?: number;
  max_tokens?: number;
  response_format?: "json_object" | "text";
};

export type PromptVersionSetItem = {
  prompt_version_id: string;
  version: string;
  model_provider: string;
  model: string;
  model_config: ModelConfig;
  activated_at: string | null;
};

export type PromptVersionSet = Record<PromptKey, PromptVersionSetItem>;

export type SceneKnowledge = {
  scene_id: string;
  scene_name: string;
  unit_name: string;
  scene_intro: string;
  scene_goal: string;
  core_vocabulary: Record<string, string[]>;
  core_phrases: string[];
  textbook_key_expressions: string[];
  core_patterns: string[];
  real_life_topics: string[];
  topic_keywords: Record<string, string[]>;
  question_practice_patterns: string[];
  common_errors: string[];
  mia_followup_directions: string[];
  scene_completion_criteria: string[];
};

export type ChatMessage = {
  role: "student" | "mia";
  content: string;
  created_at?: string;
};

export type StudentMainOutput = {
  intent_understood: string;
  is_answer_on_topic: boolean;
  highlight: string;
  covered_vocabulary: string[];
  covered_phrases: string[];
  covered_textbook_expressions: string[];
  covered_patterns: string[];
  question_patterns_practiced: string[];
  student_question_attempted: boolean;
  topic_keywords_offered: string[];
  vocabulary_bridge: string;
  topic_depth_status: "new_topic" | "developing" | "clarified" | "ready_to_shift";
  expression_desire_signal: string;
  expression_desire_reason: string;
  newly_covered_items: string[];
  error_types: string[];
  main_issue: string;
  correction_priority_reason: string;
  corrected_sentence: string;
  mia_feedback: string;
  next_question: string;
  suggested_next_focus: string;
  student_expression_confidence: "low" | "medium" | "high";
  conversation_should_continue: boolean;
  scene_completion_signal: "not_started" | "in_progress" | "nearly_complete" | "complete";
  scene_alignment: string;
  bad_case_risk: boolean;
  bad_case_risk_reason: string;
};

export type PromptVersion = {
  prompt_version_id: string;
  prompt_key: PromptKey;
  prompt_name: string;
  prompt_type: PromptKey;
  version: string;
  status: PromptStatus;
  model_provider: string;
  model: string;
  base_url_alias: string;
  model_config: ModelConfig;
  content: string;
  change_goal?: string | null;
  hypothesis?: string | null;
  change_log?: string | null;
  known_issues?: string | null;
  decision?: string | null;
  activated_at?: string | null;
};
