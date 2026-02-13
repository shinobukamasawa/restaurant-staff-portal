"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Summary = {
  storeId: string;
  yearMonth: string;
  monthlyTarget: number;
  totalTarget: number;
  totalActual: number;
  monthlyAchievement: number;
  remainingDays: number;
  remainingTarget: number;
  daily: { date: string; target: number; actual: number; achievement: number }[];
};

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type Props = {
  storeId?: string;
  showStoreSelect?: boolean;
  managerLinks?: boolean;
};

export default function SalesWidget({
  storeId: initialStoreId = "store-a",
  showStoreSelect = false,
  managerLinks = false,
}: Props) {
  const [storeId, setStoreId] = useState(initialStoreId);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const yearMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sales/summary?storeId=${storeId}&yearMonth=${yearMonth}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setSummary(null);
        else setSummary(data);
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [storeId, yearMonth]);

  const todayRow = summary?.daily.find((d) => d.date === today);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-800">今月の売上</h2>
        {showStoreSelect && (
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm"
          >
            {STORES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <p className="text-sm text-zinc-500">読み込み中…</p>
      )}

      {!loading && !summary && (
        <p className="text-sm text-zinc-500">
          今月の目標が未設定です。
          {managerLinks && (
            <>
              {" "}
              <Link href="/manager/sales/targets" className="underline hover:no-underline">
                月間目標を設定
              </Link>
            </>
          )}
        </p>
      )}

      {!loading && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-zinc-500">月間目標</p>
              <p className="font-semibold text-zinc-900">
                {summary.monthlyTarget.toLocaleString()}円
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">実績合計</p>
              <p className="font-semibold text-zinc-900">
                {summary.totalActual.toLocaleString()}円
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">達成率</p>
              <p className="font-semibold text-zinc-900">
                {summary.monthlyAchievement}%
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">残り</p>
              <p className="font-semibold text-zinc-900">
                あと {summary.remainingTarget.toLocaleString()}円
              </p>
            </div>
          </div>

          {todayRow && (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">本日の目標・実績</p>
              <p className="text-sm text-zinc-800">
                目標 {todayRow.target.toLocaleString()}円 / 実績{" "}
                {todayRow.actual.toLocaleString()}円
                {todayRow.target > 0 && `（${todayRow.achievement}%）`}
              </p>
            </div>
          )}

          {(managerLinks || showStoreSelect) && (
            <p className="text-sm text-zinc-500">
              <Link href="/manager/sales/daily" className="underline hover:no-underline">
                日別売上入力
              </Link>
              {" · "}
              <Link href="/manager/sales/targets" className="underline hover:no-underline">
                月間目標
              </Link>
              {" · "}
              <Link href="/manager/sales/rates" className="underline hover:no-underline">
                曜日率
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
