import Link from "next/link";
import { Lock, MapPin } from "lucide-react";

const cards = [
  {
    sceneId: "unit1_job_town",
    title: "职业小镇",
    unit: "Unit 1 People at work",
    intro: "聊家人工作、工作地点、夜间工作和梦想职业。",
    enabled: true
  },
  {
    sceneId: "unit2_feeling_park",
    title: "心情游乐园",
    unit: "Unit 2 How do you feel today?",
    intro: "聊今天的心情、原因和让自己变好的办法。",
    enabled: false
  },
  {
    sceneId: "unit3_talent_stage",
    title: "才艺舞台",
    unit: "Unit 3 Everyone's got talent!",
    intro: "聊自己、家人和朋友会做什么。",
    enabled: false
  }
];

export default function PracticePage() {
  return (
    <main className="page-shell py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Choose a scene
        </p>
        <h1 className="mt-2 text-4xl font-black text-ink">选择一个场景卡片</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-soft transition hover:-translate-y-1">
              <div className="mb-4 flex items-center justify-between">
                <MapPin className="h-6 w-6 text-mia" />
                {!card.enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                    <Lock className="h-3 w-3" />
                    即将开放
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-ink">{card.title}</h2>
              <p className="mt-2 text-sm font-semibold text-teal-700">{card.unit}</p>
              <p className="mt-4 flex-1 leading-7 text-slate-600">{card.intro}</p>
              <p className="mt-6 text-sm font-semibold text-ink">
                {card.enabled ? "进入聊天" : "先看看"}
              </p>
            </div>
          );

          return card.enabled ? (
            <Link key={card.sceneId} href={`/practice/${card.sceneId}`}>
              {content}
            </Link>
          ) : (
            <div key={card.sceneId} className="opacity-70">
              {content}
            </div>
          );
        })}
      </div>
    </main>
  );
}
