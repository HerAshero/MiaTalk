import { NextResponse } from "next/server";
import { generateJson } from "@/lib/llm-client";
import { getActivePrompt } from "@/lib/services/prompts";
import { getSession, listTurns } from "@/lib/services/sessions";
import { getSceneKnowledge } from "@/lib/services/scenes";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = getSupabaseAdmin();
  const session = await getSession(sessionId);
  const scene = await getSceneKnowledge(session.selected_scene_id);
  const turns = await listTurns(sessionId);
  const prompt = await getActivePrompt("exit_summary");

  const payload = {
    selected_scene: scene,
    conversation_history: turns,
    coverage_summary: {},
    highlights_detected: [],
    frequent_error_types: [],
    corrected_sentences: [],
    next_focus_suggestion: "继续练习职业和工作地点表达"
  };

  const result = await generateJson({
    modelProvider: "deepseek",
    model: prompt.model,
    modelConfig: prompt.model_config,
    systemPrompt: prompt.content,
    userPayload: payload
  });

  const summary = result.parsed ?? {
    celebration: "今天你完成了一次很棒的英语表达练习！",
    content_summary: "你和 Mia 聊了职业、家人工作和梦想职业。",
    highlight: "你愿意用英语表达自己的生活。",
    gentle_reminder: "下次注意说职业时加 a 或 an，比如 a teacher。",
    next_practice_suggestion: "继续练习 What does your mother do?",
    mia_goodbye: "Mia 下次还想听你讲更多！"
  };

  await supabase.from("ai_outputs").insert({
    session_id: sessionId,
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
    raw_model_output: result.rawText,
    parsed_json: summary,
    parse_error: result.parseError
  });

  await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString(), scene_completion_status: "ended" })
    .eq("id", sessionId);

  return NextResponse.json({ summary });
}
