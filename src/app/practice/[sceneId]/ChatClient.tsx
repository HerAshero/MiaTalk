"use client";

import { useState } from "react";
import Link from "next/link";
import { SendHorizonal } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

type Props = {
  sceneId: string;
  sceneName: string;
  sceneIntro: string;
};

export function ChatClient({ sceneId, sceneName, sceneIntro }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "mia",
      content:
        "Hi! 我是 Mia。今天我们逛职业小镇。先告诉我：What does your mother do?"
    }
  ]);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function ensureSession() {
    if (sessionId) return sessionId;
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_scene_id: sceneId })
    });
    const data = await response.json();
    setSessionId(data.session.id);
    return data.session.id as string;
  }

  async function sendMessage() {
    const answer = studentAnswer.trim();
    if (!answer || loading) return;
    setLoading(true);
    setStudentAnswer("");
    setMessages((current) => [...current, { role: "student", content: answer }]);

    try {
      const id = await ensureSession();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: id, student_answer: answer })
      });
      const data = await response.json();
      const output = data.output;
      setMessages((current) => [
        ...current,
        {
          role: "mia",
          content: `${output.mia_feedback}\n\n${output.next_question}`
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "mia",
          content:
            "Mia 这里有点卡住啦。你可以稍后再试，或者检查 DeepSeek / Supabase 环境变量。"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!sessionId) return;
    setLoading(true);
    const response = await fetch(`/api/sessions/${sessionId}/end`, {
      method: "POST"
    });
    const data = await response.json();
    setSummary(data.summary);
    setLoading(false);
  }

  return (
    <main className="page-shell grid min-h-screen gap-6 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl bg-white p-5 shadow-soft">
        <Link href="/practice" className="text-sm font-semibold text-teal-700">
          ← 返回场景
        </Link>
        <h1 className="mt-4 text-3xl font-black text-ink">{sceneName}</h1>
        <p className="mt-3 leading-7 text-slate-600">{sceneIntro}</p>
        <button
          onClick={endSession}
          disabled={!sessionId || loading}
          className="mt-6 w-full rounded-xl bg-orange-100 px-4 py-3 font-semibold text-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          结束聊天并生成总结
        </button>
        {summary && (
          <div className="mt-5 rounded-xl bg-cream p-4 text-sm leading-6">
            <p className="font-bold">学习总结</p>
            <pre className="mt-2 whitespace-pre-wrap font-sans">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        )}
      </aside>

      <section className="flex min-h-[720px] flex-col rounded-2xl bg-white shadow-soft">
        <div className="border-b border-orange-100 p-5">
          <p className="text-sm font-semibold text-teal-700">Mia is chatting</p>
          <h2 className="text-2xl font-black">和 Mia 练 Unit 1</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`w-fit max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-7 ${
                message.role === "student"
                  ? "ml-auto bg-ink text-white"
                  : "bg-orange-50 text-ink"
              }`}
            >
              {message.content}
            </div>
          ))}
          {loading && (
            <div
              role="status"
              aria-label="Mia 正在思考"
              className="flex w-fit items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-ink"
            >
              <span className="text-sm font-semibold">Mia 正在想</span>
              <span className="flex gap-1" aria-hidden="true">
                <span className="h-2 w-2 animate-bounce rounded-full bg-mia [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-mia [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-mia" />
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-orange-100 p-4">
          <input
            value={studentAnswer}
            onChange={(event) => setStudentAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="输入你的英文或中英混合回答..."
            className="min-w-0 flex-1 rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-mia"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
            发送
          </button>
        </div>
      </section>
    </main>
  );
}
