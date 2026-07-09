import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MiaBadge } from "@/components/MiaBadge";

export default function HomePage() {
  return (
    <main className="page-shell flex min-h-screen items-center py-12">
      <section className="grid w-full gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <div className="mb-6">
            <MiaBadge size="lg" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            MiaTalk
          </p>
          <h1 className="mb-5 max-w-2xl text-5xl font-black leading-tight text-ink md:text-6xl">
            和会聊天的 Mia 练英语
          </h1>
          <p className="mb-8 max-w-xl text-lg leading-8 text-slate-700">
            选择一个课本场景，和一只爱聊天、很会夸人的小猫用英语说一说。
            当前 MVP 先开放外研版四年级下册 Unit 1。
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
          >
            开始和 Mia 聊天
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <div className="rounded-[1.5rem] bg-cream p-6">
            <p className="mb-4 text-sm font-semibold text-orange-700">Mia 说</p>
            <p className="text-2xl font-bold leading-snug text-ink">
              “我想听你讲讲家人的工作。说一点点也可以，我会帮你把它变成英文。”
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
