"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type ManagerReport = {
  id: string;
  date: string;
  storeId: string;
  salesEvaluation: string;
  storeCondition: string;
  staffing: string;
  events: string[];
  themes: string[];
  memo: string;
  combinedSummary?: string;
  createdAt: string;
};

export default function HqReportsPage() {
  const [list, setList] = useState<ManagerReport[]>([]);
  const [storeId, setStoreId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = storeId ? `?storeId=${storeId}` : "";
    fetch(`/api/manager-reports${q}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [storeId]);

  return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/hq/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
              ← 本部ダッシュボード
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">店長・マネージャー日報</h1>
            <p className="mt-1 text-sm text-zinc-600">
              店長日報一覧。要約張り付け済みの日報を見ればその日の全体を把握できます。
            </p>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">店舗</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="mt-0.5 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
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
          <ul className="space-y-2">
            {list.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/hq/reports/${r.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
                >
                  <span className="font-medium text-zinc-900">{r.date}</span>
                  <span className="ml-2 text-zinc-600">
                    {STORES.find((s) => s.id === r.storeId)?.name ?? r.storeId}
                  </span>
                  {r.salesEvaluation && (
                    <span className="ml-2 text-sm text-zinc-500">売上: {r.salesEvaluation}</span>
                  )}
                  {r.combinedSummary && (
                    <span className="ml-2 text-xs text-green-600">要約付き</span>
                  )}
                </Link>
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-8 text-center text-sm text-zinc-500">店長日報はまだありません。</li>
            )}
          </ul>
        )}
      </main>
  );
}
