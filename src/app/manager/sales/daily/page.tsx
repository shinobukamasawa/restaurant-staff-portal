"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type DailyRow = { date: string; target: number; actual: number; achievement: number };

type Summary = {
  storeId: string;
  yearMonth: string;
  monthlyTarget: number;
  totalTarget: number;
  totalActual: number;
  monthlyAchievement: number;
  remainingDays: number;
  remainingTarget: number;
  daily: DailyRow[];
};

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(day));
  return DOW[date.getDay()];
}

export default function SalesDailyPage() {
  const [storeId, setStoreId] = useState("store-a");
  const [yearMonth, setYearMonth] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [localAmounts, setLocalAmounts] = useState<Record<string, string>>({});
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    setYearMonth(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
  }, []);

  const load = () => {
    if (!storeId || !yearMonth) return;
    setLoading(true);
    fetch(`/api/sales/summary?storeId=${storeId}&yearMonth=${yearMonth}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setSummary(null);
        else setSummary(data);
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [storeId, yearMonth]);

  const saveDaily = async (date: string, amount: number) => {
    setSavingDate(date);
    setMessage(null);
    try {
      const res = await fetch("/api/sales/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, date, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "保存に失敗しました" });
        return;
      }
      setMessage({ type: "ok", text: "保存しました。" });
      setLocalAmounts((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      load();
    } catch {
      setMessage({ type: "error", text: "通信エラーです。" });
    } finally {
      setSavingDate(null);
    }
  };

  const getDisplayAmount = (d: DailyRow) =>
    localAmounts[d.date] !== undefined ? localAmounts[d.date] : String(d.actual);

  return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/manager/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← ダッシュボード
          </Link>
        </header>
        <h1 className="text-2xl font-semibold text-zinc-900">日別売上入力</h1>
        <p className="mt-1 text-sm text-zinc-600">
          日付ごとの実績（円）を入力します。月間目標と曜日率から日別目標が自動計算されます。
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs text-zinc-500">店舗</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="mt-0.5 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              >
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500">表示月</label>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="mt-0.5 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          {message && (
            <p
              className={
                message.type === "ok"
                  ? "mb-3 text-sm text-green-600"
                  : "mb-3 text-sm text-red-600"
              }
            >
              {message.text}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500">読み込み中…</p>
          ) : summary ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">月間目標</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {(summary.monthlyTarget ?? 0).toLocaleString()}円
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">実績合計</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {(summary.totalActual ?? 0).toLocaleString()}円
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">達成率</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {summary.monthlyAchievement != null ? `${summary.monthlyAchievement}%` : "0%"}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">残り目標</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    あと {(summary.remainingTarget ?? 0).toLocaleString()}円
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-zinc-600">
                      <th className="pb-2 font-medium">日付</th>
                      <th className="pb-2 font-medium text-right">目標</th>
                      <th className="pb-2 font-medium text-right">実績（入力欄）</th>
                      <th className="pb-2 font-medium text-right">達成率</th>
                      <th className="pb-2 font-medium w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.daily.map((d) => (
                      <tr key={d.date} className="border-b border-zinc-100">
                        <td className="py-2 text-zinc-800">
                          {d.date}（{formatDate(d.date)}）
                        </td>
                        <td className="py-2 text-right text-zinc-700">
                          {d.target.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            value={getDisplayAmount(d)}
                            onChange={(e) =>
                              setLocalAmounts((prev) => ({
                                ...prev,
                                [d.date]: e.target.value,
                              }))
                            }
                            className="w-28 rounded border border-zinc-300 px-2 py-1.5 text-right text-sm"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 text-right text-zinc-600">
                          {d.target > 0 ? `${d.achievement}%` : "-"}
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() =>
                              saveDaily(
                                d.date,
                                Number(localAmounts[d.date] ?? d.actual) || 0
                              )
                            }
                            disabled={savingDate === d.date}
                            className="text-xs text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
                          >
                            {savingDate === d.date ? "保存中…" : "保存"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              該当する月間目標またはデータがありません。月間目標を先に登録してください。
            </p>
          )}
        </section>

        <p className="mt-4 text-sm text-zinc-500">
          <Link href="/manager/sales/targets" className="underline hover:no-underline">
            月間目標の設定
          </Link>
          {" · "}
          <Link href="/manager/sales/rates" className="underline hover:no-underline">
            曜日率の設定
          </Link>
        </p>
      </main>
  );
}
