"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth } from "@/lib/auth";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];
const CONDITION_OPTIONS = ["問題なし", "やや疲れ", "体調不良気味", "その他"];
const BUSY_OPTIONS = ["余裕", "ちょうど良い", "きつかった", "かなりきつかった"];
const TROUBLE_OPTIONS = ["特になし", "お客様対応", "機械・品切れ", "人手不足", "その他"];
const GOOD_OPTIONS = ["特になし", "接客でうまくいった", "改善のアイデアあり", "その他"];

export default function ZeninReportPage() {
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [storeId, setStoreId] = useState("store-a");
  const [condition, setCondition] = useState("");
  const [busyLevel, setBusyLevel] = useState("");
  const [trouble, setTrouble] = useState("");
  const [goodPoint, setGoodPoint] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setUserId(auth?.userId ?? "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMessage("ログインしてください。");
      return;
    }
    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/zenin-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          storeId,
          userId,
          condition,
          busyLevel,
          trouble,
          goodPoint,
          memo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "保存に失敗しました");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーです。");
    }
  };

  return (
      <main className="mx-auto max-w-2xl px-6 py-8">
        <header className="mb-6">
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← ダッシュボード
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">全員用日報</h1>
          <p className="mt-1 text-sm text-zinc-600">
            その日の体調・忙しさの体感・困ったこと・良かったことを選んで、ひとことメモを書きます。
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">日付</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">店舗</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">自分の体調・コンディション</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">忙しさの体感（自分の担当範囲）</label>
              <select
                value={busyLevel}
                onChange={(e) => setBusyLevel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {BUSY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">困ったこと・トラブル（自分が遭遇した）</label>
              <select
                value={trouble}
                onChange={(e) => setTrouble(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {TROUBLE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">良かったこと・気づき（個人）</label>
              <select
                value={goodPoint}
                onChange={(e) => setGoodPoint(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {GOOD_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">ひとことメモ</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="1〜2行程度"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "sending" ? "送信中…" : "保存"}
            </button>
          </form>

          {status === "ok" && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              保存しました。
            </div>
          )}
          {status === "error" && errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
        </section>
      </main>
  );
}
