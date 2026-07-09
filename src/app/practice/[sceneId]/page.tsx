import { getSceneKnowledge } from "@/lib/services/scenes";
import { ChatClient } from "./ChatClient";

export default async function SceneChatPage({
  params
}: {
  params: Promise<{ sceneId: string }>;
}) {
  const { sceneId } = await params;
  const scene = await getSceneKnowledge(sceneId);
  return (
    <ChatClient
      sceneId={scene.scene_id}
      sceneName={scene.scene_name}
      sceneIntro={scene.scene_intro}
    />
  );
}
