import { generateJson } from "@/lib/llm-client";
import { getActivePrompt } from "@/lib/services/prompts";
import { getSceneKnowledge } from "@/lib/services/scenes";
import { getSession, listTurns } from "@/lib/services/sessions";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { StudentMainOutput } from "@/lib/types";

function defaultMiaOutput(studentAnswer: string): StudentMainOutput {
  return {
    intent_understood: `学生想表达：${studentAnswer}`,
    is_answer_on_topic: true,
    highlight: "愿意开口表达自己的想法",
    covered_vocabulary: [],
    covered_phrases: [],
    covered_textbook_expressions: [],
    covered_patterns: [],
    question_patterns_practiced: [],
    student_question_attempted: false,
    topic_keywords_offered: ["job", "work", "school"],
    vocabulary_bridge:
      "你想说家人的工作，可以先用 father/mother + is a ...。例如：My mother is a teacher.",
    topic_depth_status: "developing",
    expression_desire_signal: "encouraged",
    expression_desire_reason: "先肯定学生，再给简单表达台阶。",
    newly_covered_items: [],
    error_types: [],
    main_issue: "none",
    correction_priority_reason: "none",
    corrected_sentence: "My mother is a teacher.",
    mia_feedback:
      "Mia 听懂啦！你已经在用英语说自己的生活了。可以这样说：My mother is a teacher.",
    next_question: "What does your father do?",
    suggested_next_focus: "family jobs",
    student_expression_confidence: "medium",
    conversation_should_continue: true,
    scene_completion_signal: "in_progress",
    scene_alignment: "贴合职业主题",
    bad_case_risk: false,
    bad_case_risk_reason: ""
  };
}

export async function runStudentChat(input: {
  session_id: string;
  student_answer: string;
}) {
  const supabase = getSupabaseAdmin();
  const session = await getSession(input.session_id);
  const scene = await getSceneKnowledge(session.selected_scene_id);
  const turns = await listTurns(input.session_id);
  const prompt = await getActivePrompt("student_main");
  const turnIndex = turns.length + 1;

  const userPayload = {
    selected_scene: {
      scene_id: scene.scene_id,
      scene_name: scene.scene_name,
      unit_name: scene.unit_name,
      scene_intro: scene.scene_intro,
      scene_goal: scene.scene_goal
    },
    turn_index: turnIndex,
    mia_question: turns.length ? turns[turns.length - 1]?.content ?? "" : "",
    student_answer: input.student_answer,
    conversation_history: turns,
    conversation_state: {},
    retrieved_knowledge: scene,
    target_pattern: "naturally guide Unit 1 job expressions",
    student_level: "Chinese primary school grade 4",
    prompt_key: "student_main",
    prompt_version_id: prompt.prompt_version_id,
    prompt_version: prompt.version,
    model_provider: prompt.model_provider,
    model: prompt.model
  };

  let rawText = "";
  let parsed: unknown = null;
  let parseError: string | null = null;

  try {
    const result = await generateJson({
      modelProvider: "deepseek",
      model: prompt.model,
      modelConfig: prompt.model_config,
      systemPrompt: prompt.content,
      userPayload
    });
    rawText = result.rawText;
    parsed = result.parsed;
    parseError = result.parseError;
  } catch (error) {
    rawText = JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown DeepSeek error"
    });
    parseError = "llm_request_failed";
  }

  const output = (parsed ?? defaultMiaOutput(input.student_answer)) as StudentMainOutput;

  const { data: studentTurn, error: studentTurnError } = await supabase
    .from("turns")
    .insert({
      session_id: input.session_id,
      turn_index: turnIndex,
      role: "student",
      content: input.student_answer
    })
    .select("*")
    .single();
  if (studentTurnError) throw studentTurnError;

  const { data: aiOutput, error: aiOutputError } = await supabase
    .from("ai_outputs")
    .insert({
      session_id: input.session_id,
      turn_id: studentTurn.id,
      prompt_key: prompt.prompt_key,
      prompt_version_id: prompt.prompt_version_id,
      prompt_name: prompt.prompt_name,
      prompt_version: prompt.version,
      model_provider: prompt.model_provider,
      model: prompt.model,
      model_config: prompt.model_config,
      prompt_content_snapshot: prompt.content,
      selected_scene_id: scene.scene_id,
      retrieved_knowledge_snapshot: scene,
      raw_model_output: rawText,
      parsed_json: output,
      mia_feedback: output.mia_feedback,
      next_question: output.next_question,
      intent_understood: output.intent_understood,
      highlight: output.highlight,
      covered_vocabulary: output.covered_vocabulary,
      covered_phrases: output.covered_phrases,
      covered_textbook_expressions: output.covered_textbook_expressions,
      covered_patterns: output.covered_patterns,
      question_patterns_practiced: output.question_patterns_practiced,
      student_question_attempted: output.student_question_attempted,
      topic_keywords_offered: output.topic_keywords_offered,
      vocabulary_bridge: output.vocabulary_bridge,
      topic_depth_status: output.topic_depth_status,
      expression_desire_signal: output.expression_desire_signal,
      expression_desire_reason: output.expression_desire_reason,
      error_types: output.error_types,
      main_issue: output.main_issue,
      corrected_sentence: output.corrected_sentence,
      suggested_next_focus: output.suggested_next_focus,
      student_expression_confidence: output.student_expression_confidence,
      scene_completion_signal: output.scene_completion_signal,
      parse_error: parseError
    })
    .select("*")
    .single();
  if (aiOutputError) throw aiOutputError;

  await supabase.from("turns").insert({
    session_id: input.session_id,
    turn_index: turnIndex + 0.1,
    role: "mia",
    content: `${output.mia_feedback}\n\n${output.next_question}`
  });

  await supabase
    .from("sessions")
    .update({
      total_turns: turnIndex,
      scene_completion_status: output.scene_completion_signal
    })
    .eq("id", input.session_id);

  return { output, aiOutput };
}
