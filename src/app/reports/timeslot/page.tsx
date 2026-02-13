"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth } from "@/lib/auth";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];
const SALES_OPTIONS = ["目標超過", "達成", "ほぼ目標", "未達", "とても良い", "良い", "普通", "あまり良くない"];
const CONDITION_OPTIONS = ["とても良い", "良い", "普通", "あまり良くない"];
const STAFFING_OPTIONS = ["余裕あり", "ちょうど良い", "ぎりぎり", "不足"];
const EVENT_OPTIONS = ["クレーム", "大口予約", "トラブル", "スタッフ体調不良", "特になし"];

type TimeSlot = { id: string; name: string; sortOrder: number };

export default function TimeSlotReportPage() {
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [storeId, setStoreId] = useState("store-a");
  const [timeSlotId, setTimeSlotId] = useState("lunch");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [salesEvaluation, setSalesEvaluation] = useState("");
  const [storeCondition, setStoreCondition] = useState("");
  const [staffing, setStaffing] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setUserId(auth?.userId ?? "");
    fetch("/api/timeslots")
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []));
  }, []);

  const toggleEvent = (v: string) => {
    setEvents((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMessage("ログインしてください。");
      return;
    }
    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/timeslot-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          storeId,
          timeSlotId,
          userId,
          salesEvaluation,
          storeCondition,
          staffing,
          events,
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
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">時間帯別日報</h1>
          <p className="mt-1 text-sm text-zinc-600">
            担当時間帯の店の状況・売上評価・人手・出来事を記入します。
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
              <label className="block text-sm font-medium text-zinc-700">時間帯</label>
              <select
                value={timeSlotId}
                onChange={(e) => setTimeSlotId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">売上・状況の評価</label>
              <select
                value={salesEvaluation}
                onChange={(e) => setSalesEvaluation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {SALES_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">店の状況</label>
              <select
                value={storeCondition}
                onChange={(e) => setStoreCondition(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">人手体制</label>
              <select
                value={staffing}
                onChange={(e) => setStaffing(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択</option>
                {STAFFING_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">出来事（複数可）</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EVENT_OPTIONS.map((o) => (
                  <label key={o} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={events.includes(o)}
                      onChange={() => toggleEvent(o)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span className="text-sm">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">特記事項・メモ</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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
