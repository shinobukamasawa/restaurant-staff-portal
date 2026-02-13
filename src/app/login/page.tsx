"use client";

import { useState } from "react";
import { setAuth, type Role } from "@/lib/auth";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const idTrimmed = id.trim();
    if (!idTrimmed || !password) {
      setError("IDとパスワードを入力してください。");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idTrimmed, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "ログインに失敗しました。");
        setSubmitting(false);
        return;
      }

      const role = data.role as Role;
      setAuth(role, data.userId);
      if (role === "manager") window.location.href = "/manager/dashboard";
      else if (role === "hq") window.location.href = "/hq/dashboard";
      else window.location.href = "/dashboard";
    } catch {
      setError("通信エラーです。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">ログイン</h1>
        <p className="mt-1 text-sm text-zinc-600">
          社員IDとパスワードを入力してください。
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              社員ID
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="例）E12345"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="パスワードを入力"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-500">
          アカウントが無効の場合は担当者にお問い合わせください。
        </p>
      </div>
    </div>
  );
}
