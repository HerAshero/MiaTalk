import { scenes } from "@/data/scenes";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { SceneKnowledge } from "@/lib/types";

function getOptionalSupabaseAdmin() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function ensureDefaultScenes() {
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) return;

  for (const scene of scenes) {
    await supabase
      .from("scene_knowledge")
      .upsert(scene, { onConflict: "scene_id" });
  }
}

export async function listScenes(): Promise<SceneKnowledge[]> {
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) return scenes;

  const { data, error } = await supabase
    .from("scene_knowledge")
    .select("*")
    .order("scene_id", { ascending: true });

  if (error) {
    return scenes;
  }

  return (data?.length ? data : scenes) as SceneKnowledge[];
}

export async function getSceneKnowledge(sceneId: string): Promise<SceneKnowledge> {
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) {
    const localScene = scenes.find((scene) => scene.scene_id === sceneId);
    if (!localScene) throw new Error(`Scene not found: ${sceneId}`);
    return localScene;
  }

  const { data, error } = await supabase
    .from("scene_knowledge")
    .select("*")
    .eq("scene_id", sceneId)
    .maybeSingle();

  if (!error && data) return data as SceneKnowledge;

  const fallback = scenes.find((scene) => scene.scene_id === sceneId);
  if (!fallback) throw new Error(`Scene not found: ${sceneId}`);
  return fallback;
}
