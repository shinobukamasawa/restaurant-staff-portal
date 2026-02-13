"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type TimeSlotReport = {
  id: string;
  date: string;
  storeId: string;
  timeSlotId: string;
  userId: string;
  salesEvaluation: string;
  storeCondition: string;
  staffing: string;
  events: string[];
  memo: string;
};

const SLOT_NAMES: Record<string, string> = {
  lunch: "ランチ",
  afternoon: "アフタヌーン",
  dinner: "ディナー",
};

export default function HqTimeslotReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [storeId, setStoreId] = useState("");
  const [list, setList] = useState<TimeSlotReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("date", date);
    if (storeId) params.set("storeId", storeId);
    fetch(`/api/timeslot-reports?${params}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [date, storeId]);

  return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/hq/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
              ← 本部ダッシュボード
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">時間帯別日報（元データ）</h1>
            <p className="mt-1 text-sm text-zinc-600">日付・店舗で絞り込み表示します。</p>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">全店舗</option>
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <p className="text-sm text-zinc-500">読み込み中…</p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-800"
              >
                <span className="font-medium">{r.date}</span>
                <span className="ml-2 text-zinc-600">
                  {STORES.find((s) => s.id === r.storeId)?.name ?? r.storeId}
                </span>
                <span className="ml-2">{SLOT_NAMES[r.timeSlotId] ?? r.timeSlotId}</span>
                <span className="ml-2 text-zinc-500">{r.userId}</span>
                <p className="mt-2">
                  売上: {r.salesEvaluation} / 店舗: {r.storeCondition} / 人手: {r.staffing}
                  {r.events?.length ? ` / 出来事: ${r.events.join(", ")}` : ""}
                  {r.memo ? ` / メモ: ${r.memo}` : ""}
                </p>
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-8 text-center text-sm text-zinc-500">該当する時間帯別日報はありません。</li>
            )}
          </ul>
        )}
      </main>
  );
}
