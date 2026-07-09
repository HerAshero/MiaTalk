"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login() {
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      setError("密码不正确");
      return;
    }
    router.push("/admin/eval");
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-ink">MiaTalk 后台</h1>
        <p className="mt-2 text-slate-600">输入 Admin 密码进入评测平台。</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") login();
          }}
          className="mt-6 w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-mia"
          placeholder="ADMIN_PASSWORD"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={login}
          className="mt-5 w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white"
        >
          登录
        </button>
      </div>
    </main>
  );
}
