"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TodaysShift from "@/components/TodaysShift";
import SalesWidget from "@/components/SalesWidget";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type ManagerReport = {
  id: string;
  date: string;
  storeId: string;
  salesEvaluation: string;
  combinedSummary?: string;
};

export default function HqDashboardPage() {
  const [reports, setReports] = useState<ManagerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/manager-reports")
      .then((r) => r.json())
      .then((data) => setReports(Array.isArray(data) ? data.slice(0, 15) : []))
      .finally(() => setLoading(false));
  }, []);

  return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">本部 ダッシュボード</h1>
          <p className="mt-1 text-sm text-zinc-600">
            店長・マネージャー日報を確認できます。要約張り付け済みの日報でその日の全体を把握できます。
          </p>
        </header>

        <div className="mb-6 max-w-md">
          <TodaysShift />
        </div>

        <div className="mb-6">
          <SalesWidget showStoreSelect />
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800">店長・マネージャー日報</h2>
          <p className="mt-1 text-xs text-zinc-500">
            直近の店長日報。詳細で統合要約・日別売上を確認できます。
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">読み込み中…</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/hq/reports/${r.id}`}
                    className="block rounded-lg border border-zinc-100 py-2 px-3 text-sm hover:bg-zinc-50"
                  >
                    <span className="font-medium text-zinc-900">{r.date}</span>
                    <span className="ml-2 text-zinc-600">
                      {STORES.find((s) => s.id === r.storeId)?.name ?? r.storeId}
                    </span>
                    {r.salesEvaluation && (
                      <span className="ml-2 text-zinc-500">売上: {r.salesEvaluation}</span>
                    )}
                    {r.combinedSummary && (
                      <span className="ml-2 text-xs text-green-600">要約付き</span>
                    )}
                  </Link>
                </li>
              ))}
              {reports.length === 0 && (
                <li className="py-4 text-center text-sm text-zinc-500">店長日報はまだありません。</li>
              )}
            </ul>
          )}
          <p className="mt-3 text-sm">
            <Link href="/hq/reports" className="text-zinc-600 hover:underline">
              店長日報一覧へ →
            </Link>
          </p>
        </section>
      </main>
  );
}
