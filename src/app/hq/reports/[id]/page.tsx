"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function HqReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [report, setReport] = useState<ManagerReport | null>(null);
  const [dailySales, setDailySales] = useState<{ target: number; actual: number; achievement: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch("/api/manager-reports")
      .then((r) => r.json())
      .then((list) => {
        const found = (Array.isArray(list) ? list : []).find((r: ManagerReport) => r.id === id);
        setReport(found ?? null);
        if (found) {
          const yearMonth = found.date.slice(0, 7);
          return fetch(
            `/api/sales/summary?storeId=${found.storeId}&yearMonth=${yearMonth}`
          )
            .then((res) => res.json())
            .then((summary) => {
              const day = summary?.daily?.find((d: { date: string }) => d.date === found.date);
              setDailySales(
                day ? { target: day.target, actual: day.actual, achievement: day.achievement } : null
              );
            });
        }
        return Promise.resolve();
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-zinc-500">読み込み中…</p>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="px-6 py-8">
        <p className="text-zinc-500">日報が見つかりません。</p>
        <Link href="/hq/reports" className="mt-2 inline-block text-sm text-zinc-600 hover:underline">
          一覧へ
        </Link>
      </div>
    );
  }

  return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6">
          <Link href="/hq/reports" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← 店長日報一覧
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            {report.date} {STORES.find((s) => s.id === report.storeId)?.name ?? report.storeId}
          </h1>
        </header>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">その日の日別売上（参照）</h2>
          {dailySales ? (
            <p className="mt-2 text-zinc-800">
              目標 {dailySales.target.toLocaleString()}円 / 実績 {dailySales.actual.toLocaleString()}円
              {dailySales.target > 0 && `（達成率 ${dailySales.achievement}%）`}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">データなし</p>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">店長まとめ</h2>
          <div className="mt-2 space-y-2 text-sm text-zinc-800">
            {report.salesEvaluation && <p>売上評価: {report.salesEvaluation}</p>}
            {report.storeCondition && <p>店舗状況: {report.storeCondition}</p>}
            {report.staffing && <p>人員体制: {report.staffing}</p>}
            {report.events?.length > 0 && <p>出来事: {report.events.join(", ")}</p>}
            {report.themes?.length > 0 && <p>テーマ: {report.themes.join(", ")}</p>}
            {report.memo && (
              <div className="rounded bg-zinc-50 p-3 whitespace-pre-wrap">{report.memo}</div>
            )}
          </div>
        </section>

        {report.combinedSummary && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-zinc-700">統合要約（全員日報＋時間帯別日報）</h2>
            <div className="mt-2 whitespace-pre-wrap rounded bg-zinc-50 p-4 text-sm text-zinc-800">
              {report.combinedSummary}
            </div>
          </section>
        )}
      </main>
  );
}
