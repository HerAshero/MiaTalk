import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listPromptVersions } from "@/lib/services/prompts";
import { listSessions } from "@/lib/services/sessions";

export default async function AdminEvalPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const [sessions, promptVersions] = await Promise.all([
    listSessions().catch(() => []),
    listPromptVersions().catch(() => [])
  ]);

  return (
    <main className="page-shell py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Evaluation
          </p>
          <h1 className="mt-2 text-4xl font-black text-ink">MiaTalk 测评后台</h1>
        </div>
        <Link href="/" className="rounded-xl bg-white px-4 py-3 font-semibold shadow-soft">
          返回学生端
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <Metric title="Sessions" value={sessions.length} />
        <Metric title="Prompt Versions" value={promptVersions.length} />
        <Metric title="Bad Cases" value="MVP" />
        <Metric title="Reports" value="MVP" />
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black">Sessions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-3">Session</th>
                <th>Scene</th>
                <th>Student</th>
                <th>Turns</th>
                <th>Status</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session: any) => (
                <tr key={session.id} className="border-t border-orange-100">
                  <td className="py-3 font-mono text-xs">{session.id}</td>
                  <td>{session.selected_scene_name}</td>
                  <td>{session.student_alias}</td>
                  <td>{session.total_turns}</td>
                  <td>{session.scene_completion_status}</td>
                  <td>{new Date(session.started_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black">Prompt Versions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {promptVersions.map((prompt: any) => (
            <div key={prompt.prompt_version_id} className="rounded-xl border border-orange-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{prompt.prompt_key}</p>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {prompt.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {prompt.version} · {prompt.model_provider} · {prompt.model}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}
