import { defaultPrompts } from "@/data/default-prompts";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PromptKey, PromptVersion, PromptVersionSet } from "@/lib/types";

const promptKeys: PromptKey[] = [
  "student_main",
  "exit_summary",
  "judge",
  "bad_case_rubric"
];

function getOptionalSupabaseAdmin() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function ensureDefaultPrompts() {
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) return;

  for (const prompt of defaultPrompts) {
    await supabase
      .from("prompt_versions")
      .upsert(prompt, { onConflict: "prompt_version_id" });
  }
}

export async function getActivePrompt(promptKey: PromptKey): Promise<PromptVersion> {
  const fallback = defaultPrompts.find((prompt) => prompt.prompt_key === promptKey);
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) {
    if (!fallback) throw new Error(`Missing default prompt for ${promptKey}`);
    return fallback;
  }

  const { data, error } = await supabase
    .from("prompt_versions")
    .select("*")
    .eq("prompt_key", promptKey)
    .eq("status", "Active")
    .order("activated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as PromptVersion;

  if (!fallback) throw new Error(`Missing default prompt for ${promptKey}`);
  return fallback;
}

export async function getPromptVersionSet(): Promise<PromptVersionSet> {
  const entries = await Promise.all(
    promptKeys.map(async (key) => {
      const prompt = await getActivePrompt(key);
      return [
        key,
        {
          prompt_version_id: prompt.prompt_version_id,
          version: prompt.version,
          model_provider: prompt.model_provider,
          model: prompt.model,
          model_config: prompt.model_config,
          activated_at: prompt.activated_at ?? null
        }
      ] as const;
    })
  );

  return Object.fromEntries(entries) as PromptVersionSet;
}

export async function listPromptVersions() {
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) return defaultPrompts;

  const { data, error } = await supabase
    .from("prompt_versions")
    .select("*")
    .order("prompt_key", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PromptVersion[];
}
