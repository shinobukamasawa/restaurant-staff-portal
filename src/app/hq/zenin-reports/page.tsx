"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type ZeninReport = {
  id: string;
  date: string;
  storeId: string;
  userId: string;
  condition: string;
  busyLevel: string;
  trouble: string;
  goodPoint: string;
  memo: string;
};

export default function HqZeninReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [storeId, setStoreId] = useState("");
  const [list, setList] = useState<ZeninReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("date", date);
    if (storeId) params.set("storeId", storeId);
    fetch(`/api/zenin-reports?${params}`)
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
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">全員日報（元データ）</h1>
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
                <span className="ml-2 text-zinc-500">{r.userId}</span>
                <p className="mt-2">
                  体調: {r.condition} / 忙しさ: {r.busyLevel} / 困った: {r.trouble} / 良かった: {r.goodPoint}
                  {r.memo && ` / メモ: ${r.memo}`}
                </p>
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-8 text-center text-sm text-zinc-500">該当する全員日報はありません。</li>
            )}
          </ul>
        )}
      </main>
  );
}
