"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <div className="max-w-xl rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-ink">页面出错了</h1>
        <p className="mt-4 whitespace-pre-wrap text-slate-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-ink px-5 py-3 font-semibold text-white"
        >
          重试
        </button>
      </div>
    </main>
  );
}
