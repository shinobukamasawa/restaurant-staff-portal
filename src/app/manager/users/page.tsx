"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth } from "@/lib/auth";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
  { id: "hq", name: "本部" },
];

const ROLES = [
  { value: "staff", label: "スタッフ" },
  { value: "manager", label: "店長・マネージャー" },
  { value: "hq", label: "本部" },
];

type UserRow = { id: string; displayName: string; role: string; storeId?: string };

export default function ManagerUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("staff");
  const [storeId, setStoreId] = useState("store-a");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const auth = getAuth();
    if (auth?.role !== "manager" && auth?.role !== "hq") {
      window.location.href = "/";
      return;
    }
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.error) {
          setMessage({ type: "error", text: data.error });
        }
      })
      .catch(() => setMessage({ type: "error", text: "ユーザー一覧の取得に失敗しました。" }))
      .finally(() => setLoading(false));
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id.trim(),
          password: password.trim(),
          displayName: displayName.trim() || id.trim(),
          role,
          storeId: storeId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "登録に失敗しました。" });
        return;
      }
      setMessage({ type: "ok", text: `${data.user?.displayName ?? data.user?.id} を登録しました。` });
      setId("");
      setPassword("");
      setDisplayName("");
      setRole("staff");
      setStoreId("store-a");
      if (data.user) {
        setUsers((prev) => [
          ...prev,
          {
            id: data.user.id,
            displayName: data.user.displayName ?? data.user.id,
            role: data.user.role,
            storeId: data.user.storeId,
          },
        ]);
      }
    } catch {
      setMessage({ type: "error", text: "通信エラーです。" });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-6">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/manager/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← ダッシュボード
          </Link>
        </header>
        <h1 className="text-2xl font-semibold text-zinc-900">ユーザー登録</h1>
        <p className="mt-1 text-sm text-zinc-600">
          スタッフ・店長・本部のアカウントを登録します。本部と店長の両方でこの画面を利用できます。
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">新規登録</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {message && (
              <p
                className={
                  message.type === "ok"
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {message.text}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  ログインID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
                  placeholder="半角英数字・ハイフン・アンダースコア"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
                  placeholder="4文字以上"
                  minLength={4}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500">
                表示名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
                placeholder="例）堀口 万葉（未入力時はIDを使用）"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  役割
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  店舗
                </label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "登録中…" : "登録"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">登録済みユーザー</h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-500">読み込み中…</p>
          ) : users.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">まだユーザーがいません。上から登録してください。</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                    <th className="pb-2 pr-4">ID</th>
                    <th className="pb-2 pr-4">表示名</th>
                    <th className="pb-2 pr-4">役割</th>
                    <th className="pb-2">店舗</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-100">
                      <td className="py-2 pr-4 font-medium">{u.id}</td>
                      <td className="py-2 pr-4">{u.displayName}</td>
                      <td className="py-2 pr-4">
                        {ROLES.find((r) => r.value === u.role)?.label ?? u.role}
                      </td>
                      <td className="py-2">
                        {STORES.find((s) => s.id === u.storeId)?.name ?? u.storeId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
  );
}
