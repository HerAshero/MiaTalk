import { getPromptVersionSet } from "@/lib/services/prompts";
import { getSceneKnowledge } from "@/lib/services/scenes";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function createPracticeSession(input: {
  selected_scene_id: string;
  student_alias?: string;
}) {
  const supabase = getSupabaseAdmin();
  const scene = await getSceneKnowledge(input.selected_scene_id);
  const promptVersionSet = await getPromptVersionSet();

  const studentMain = promptVersionSet.student_main;
  const exitSummary = promptVersionSet.exit_summary;
  const judge = promptVersionSet.judge;
  const rubric = promptVersionSet.bad_case_rubric;

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      student_alias: input.student_alias || "小朋友",
      selected_scene_id: scene.scene_id,
      selected_scene_name: scene.scene_name,
      total_turns: 0,
      prompt_version_set: promptVersionSet,
      student_main_prompt_version_id: studentMain.prompt_version_id,
      student_main_prompt_version: studentMain.version,
      student_main_model_provider: studentMain.model_provider,
      student_main_model: studentMain.model,
      student_main_model_config: studentMain.model_config,
      exit_summary_prompt_version_id: exitSummary.prompt_version_id,
      exit_summary_prompt_version: exitSummary.version,
      exit_summary_model_provider: exitSummary.model_provider,
      exit_summary_model: exitSummary.model,
      exit_summary_model_config: exitSummary.model_config,
      judge_prompt_version_id: judge.prompt_version_id,
      judge_prompt_version: judge.version,
      judge_model_provider: judge.model_provider,
      judge_model: judge.model,
      judge_model_config: judge.model_config,
      bad_case_rubric_version_id: rubric.prompt_version_id,
      bad_case_rubric_version: rubric.version,
      bad_case_rubric_model_provider: rubric.model_provider,
      bad_case_rubric_model: rubric.model,
      bad_case_rubric_model_config: rubric.model_config,
      scene_completion_status: "in_progress"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getSession(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return data;
}

export async function listSessions() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function listTurns(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("turns")
    .select("*")
    .eq("session_id", sessionId)
    .order("turn_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
