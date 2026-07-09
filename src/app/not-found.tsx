import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
        <h1 className="text-3xl font-black text-ink">没有找到这个页面</h1>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-ink px-5 py-3 font-semibold text-white"
        >
          回到首页
        </Link>
      </div>
    </main>
  );
}
