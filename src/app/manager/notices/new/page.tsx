"use client";

import { useState } from "react";

export default function NewNoticePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [storeId, setStoreId] = useState("all");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("タイトルを入力してください");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), storeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "保存に失敗しました");
        return;
      }
      setStatus("ok");
      setTitle("");
      setBody("");
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーです。");
    }
  };

  return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">お知らせを投稿</h1>
          <p className="mt-1 text-sm text-zinc-600">
            店舗向けのお知らせを登録します。全店舗または特定店舗を指定できます。
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">対象</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">全店舗</option>
                <option value="store-a">A店</option>
                <option value="store-b">B店</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">タイトル（必須）</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="例）ランチメニュー変更のご案内"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">本文</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="お知らせの内容を入力"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "sending" ? "投稿中…" : "投稿する"}
            </button>
          </form>

          {status === "ok" && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              お知らせを投稿しました。
            </div>
          )}
          {status === "error" && errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
        </section>

        <p className="mt-4">
          <a href="/notices" className="text-sm text-zinc-600 hover:underline">
            ← お知らせ一覧へ
          </a>
        </p>
      </main>
  );
}
