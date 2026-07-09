import { generateJson } from "@/lib/llm-client";
import { getActivePrompt } from "@/lib/services/prompts";
import { getSceneKnowledge } from "@/lib/services/scenes";
import { getSession, listTurns } from "@/lib/services/sessions";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { StudentMainOutput } from "@/lib/types";

function defaultMiaOutput(
  studentAnswer: string,
  modelResponse?: string
): StudentMainOutput {
  const safeFeedback =
    modelResponse?.trim() ||
    `米娅听到了你说：“${studentAnswer}” 这次米娅没有成功整理好反馈，所以我先不改变你的意思。你可以再说一次，我会继续认真听。`;

  return {
    intent_understood: `学生原话：${studentAnswer}`,
    is_answer_on_topic: true,
    highlight: "愿意继续用英语表达真实想法",
    covered_vocabulary: [],
    covered_phrases: [],
    covered_textbook_expressions: [],
    covered_patterns: [],
    question_patterns_practiced: [],
    student_question_attempted: false,
    topic_keywords_offered: [],
    vocabulary_bridge: "",
    topic_depth_status: "developing",
    expression_desire_signal: "encouraged",
    expression_desire_reason: "先肯定学生，再给简单表达台阶。",
    newly_covered_items: [],
    error_types: ["output_format_error"],
    main_issue: "模型输出格式异常，无法可靠判断学生语言错误。",
    correction_priority_reason: "不编造、不改变学生原意优先。",
    corrected_sentence: studentAnswer,
    mia_feedback: safeFeedback,
    next_question: "Can you tell me more about it?",
    suggested_next_focus: "continue_current_topic",
    student_expression_confidence: "medium",
    conversation_should_continue: true,
    scene_completion_signal: "in_progress",
    scene_alignment: "保持学生当前话题，不擅自推进。",
    bad_case_risk: true,
    bad_case_risk_reason: "模型未返回合格的结构化输出，已启用忠实原意兜底。"
  };
}

function isStudentMainOutput(value: unknown): value is StudentMainOutput {
  if (!value || typeof value !== "object") return false;
  const output = value as Record<string, unknown>;
  return (
    typeof output.mia_feedback === "string" &&
    output.mia_feedback.length > 0 &&
    typeof output.next_question === "string" &&
    Array.isArray(output.covered_vocabulary) &&
    Array.isArray(output.error_types)
  );
}

function applyDeterministicGuardrails(
  studentAnswer: string,
  output: StudentMainOutput
): StudentMainOutput {
  const errorTypes = new Set(output.error_types);
  if (/^\s*[a-z]/.test(studentAnswer)) {
    errorTypes.add("sentence_initial_capitalization");
  }
  if (!/[.!?]\s*$/.test(studentAnswer)) {
    errorTypes.add("missing_terminal_punctuation");
  }

  const isWorkplaceAnswer =
    /\bwork(?:s|ed|ing)?\s+(?:at|in|on)\b/i.test(studentAnswer) ||
    /\b(?:hospital|school|farm|restaurant|station|fields|city|home)\b/i.test(
      studentAnswer
    );
  const occupationQuestion =
    /what\s+does\s+(?:your\s+)?(?:mother|father|aunt|uncle|grandpa|he|she)\s+do\s*\?/i;

  if (!isWorkplaceAnswer) {
    return { ...output, error_types: [...errorTypes] };
  }

  const hasOccupationJump =
    occupationQuestion.test(output.next_question) ||
    occupationQuestion.test(output.mia_feedback);
  if (!hasOccupationJump) {
    return { ...output, error_types: [...errorTypes] };
  }

  const feedback = output.mia_feedback
    .replace(occupationQuestion, "")
    .replace(/[^。！？.!?]*[?？]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const nextQuestion = /\bmother\b/i.test(studentAnswer)
    ? "Does your mother work there in the day or at night?"
    : /\bfather\b/i.test(studentAnswer)
      ? "Does your father work there in the day or at night?"
      : "Do they work there in the day or at night?";

  return {
    ...output,
    error_types: [...errorTypes],
    mia_feedback: feedback,
    next_question: nextQuestion,
    suggested_next_focus: "deepen_current_workplace_topic"
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
    model: prompt.model,
    required_output_schema: {
      intent_understood: "string",
      is_answer_on_topic: "boolean",
      highlight: "string",
      covered_vocabulary: ["string"],
      covered_phrases: ["string"],
      covered_textbook_expressions: ["string"],
      covered_patterns: ["string"],
      question_patterns_practiced: ["string"],
      student_question_attempted: "boolean",
      topic_keywords_offered: ["string"],
      vocabulary_bridge: "string",
      topic_depth_status: "string",
      expression_desire_signal: "string",
      expression_desire_reason: "string",
      newly_covered_items: ["string"],
      error_types: ["string"],
      main_issue: "string",
      correction_priority_reason: "string",
      corrected_sentence: "string",
      mia_feedback: "string",
      next_question: "string",
      suggested_next_focus: "string",
      student_expression_confidence: "low | medium | high",
      conversation_should_continue: "boolean",
      scene_completion_signal: "in_progress | ready_to_switch",
      scene_alignment: "string",
      bad_case_risk: "boolean",
      bad_case_risk_reason: "string"
    }
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

  if (parsed !== null && !isStudentMainOutput(parsed)) {
    parseError = "invalid_student_main_output";
  }
  const unstructuredResponse =
    parsed &&
    typeof parsed === "object" &&
    typeof (parsed as Record<string, unknown>).response === "string"
      ? ((parsed as Record<string, unknown>).response as string)
      : undefined;
  const rawOutput = isStudentMainOutput(parsed)
    ? parsed
    : defaultMiaOutput(input.student_answer, unstructuredResponse);
  const output = applyDeterministicGuardrails(input.student_answer, rawOutput);

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
