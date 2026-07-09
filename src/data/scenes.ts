import type { SceneKnowledge } from "@/lib/types";

export const unit1JobTown: SceneKnowledge = {
  scene_id: "unit1_job_town",
  scene_name: "职业小镇",
  unit_name: "Unit 1 People at work",
  scene_intro:
    "Mia 带学生逛职业小镇，认识不同职业，聊家人工作、工作地点、夜间工作和梦想职业。",
  scene_goal:
    "学生能围绕职业主题自然表达，能说出职业、询问他人职业、说明工作地点，并表达自己的梦想职业及简单原因。",
  core_vocabulary: {
    jobs: [
      "teacher",
      "doctor",
      "farmer",
      "cook",
      "police officer",
      "worker",
      "scientist",
      "bus driver",
      "taxi driver",
      "nurse",
      "fireman",
      "postman",
      "cleaner",
      "painter",
      "writer",
      "baker",
      "driver",
      "seller"
    ],
    places: [
      "hospital",
      "school",
      "farm",
      "fire station",
      "police station",
      "restaurant",
      "fields",
      "city",
      "bus",
      "home"
    ],
    family: ["father", "mother", "aunt", "grandpa", "uncle", "family member"]
  },
  core_phrases: [
    "people at work",
    "love our jobs",
    "work in the fields",
    "work at night",
    "take people home",
    "keep the city safe",
    "help people",
    "work very hard",
    "bring letters to people",
    "dream job",
    "work at a school",
    "work in a fire station",
    "teach students Chinese"
  ],
  textbook_key_expressions: [
    "What does he/she do?",
    "He's/She's a ...",
    "What does your father/mother/aunt do?",
    "He/She works in/at/on ...",
    "I want to be a ...",
    "I want to help people.",
    "I want to teach students Chinese.",
    "I want to keep the city safe.",
    "What jobs help to make it?"
  ],
  core_patterns: [
    "What does he do?",
    "What does she do?",
    "What does your father do?",
    "What does your mother do?",
    "He's a doctor.",
    "She's a teacher.",
    "My father is a farmer.",
    "My mother is a teacher.",
    "He works in a hospital.",
    "She works at a school.",
    "A farmer works in the fields.",
    "I want to be a doctor.",
    "I want to help people."
  ],
  real_life_topics: [
    "你的家人是做什么工作的？",
    "你在哪里见过医生、老师、厨师、警察？",
    "哪些人在晚上还要工作？他们怎样帮助大家？",
    "你喜欢哪种职业？你想感谢哪种职业的人？",
    "你长大后想做什么？你想怎样帮助别人？",
    "学校里有哪些人在工作？他们如何帮助你？"
  ],
  topic_keywords: {
    family_jobs: ["father", "mother", "teacher", "doctor", "farmer", "cook"],
    work_places: ["school", "hospital", "farm", "restaurant", "police station"],
    helping_people: ["help people", "keep the city safe", "teach students"],
    night_work: ["bus driver", "police officer", "doctor", "nurse", "work at night"],
    dream_job: ["I want to be ...", "I want to help ...", "my dream job"]
  },
  question_practice_patterns: [
    "Mia 可以假装带学生采访职业小镇里的居民，引导学生问 Mia: What does he/she do?",
    "Mia 可以说 Now you are the little reporter. Please ask me about my family. 引导学生问: What does your father/mother do?",
    "Mia 可以先示范 My mother is a teacher. She works at a school. 然后邀请学生追问: Where does she work?",
    "判断完成时，不只看学生是否会回答职业，也要看学生是否至少尝试过主动询问职业或工作地点。"
  ],
  common_errors: [
    "漏 a/an：He is doctor.",
    "he/she 混用。",
    "do/does 混用。",
    "第三人称单数漏 s：He work in a hospital.",
    "want 后漏 to：I want be a cook.",
    "work in/at/on 混乱。",
    "职业词拼写错误，如 police officer, scientist, farmer。"
  ],
  mia_followup_directions: [
    "What does your mother/father do?",
    "Where does he/she work?",
    "Who works in a hospital?",
    "Who works at night?",
    "What do you want to be?",
    "Why do you want to be a ...?",
    "How does this job help people?"
  ],
  scene_completion_criteria: [
    "学生使用过至少 4 个职业词。",
    "学生使用过至少 2 个地点词。",
    "学生能说出 He's/She's a ... 或 My father/mother is a ...。",
    "学生能说出 He/She works in/at/on ...。",
    "学生能表达 I want to be a ...。",
    "学生至少尝试过主动询问职业或工作地点相关问句。",
    "如果学生有错误，学生至少成功修正过一次关键错误，如 a/an、works、want to be。"
  ]
};

export const scenes: SceneKnowledge[] = [unit1JobTown];

export function getScene(sceneId: string) {
  return scenes.find((scene) => scene.scene_id === sceneId) ?? null;
}
