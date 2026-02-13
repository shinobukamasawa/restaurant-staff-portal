"use client";

import { useState, useEffect } from "react";
import TodaysShift from "@/components/TodaysShift";
import SalesWidget from "@/components/SalesWidget";

type SummaryRes = {
  period: string;
  start: string;
  end: string;
  count: number;
  summary: string;
  source: string;
  managerCount?: number;
  managerSummary?: string;
};

export default function ManagerDashboardPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<SummaryRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadByPeriod = (p: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/reports/summary?period=${p}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch(() => setError("要約の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  const loadByRange = (start: string, end: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/reports/summary?start=${start}&end=${end}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch(() => setError("要約の取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadByPeriod(period);
  }, [period]);

  const handlePreset = (p: "day" | "week" | "month") => {
    setCustomStart("");
    setCustomEnd("");
    setPeriod(p);
  };

  const handleCustomShow = () => {
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) {
      setError("開始日は終了日以前にしてください。");
      return;
    }
    setError(null);
    loadByRange(customStart, customEnd);
  };

  return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">
            店長・マネージャー ダッシュボード
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            スタッフ日報の要約を確認できます。AI要約を使う場合は .env に OPENAI_API_KEY を設定してください。
          </p>
        </header>

        <div className="mb-6 max-w-md">
          <TodaysShift />
        </div>

        <div className="mb-6">
          <SalesWidget managerLinks />
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800">スタッフ日報の要約</h2>
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500 self-center">クイック:</span>
              {(["day", "week", "month"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    period === p && !customStart && !customEnd
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {p === "day" ? "今日" : p === "week" ? "過去7日間" : "今月"}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
              <span className="text-xs text-zinc-500">期間指定:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
              />
              <span className="text-zinc-400">〜</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={handleCustomShow}
                className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-600"
              >
                表示
              </button>
            </div>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-zinc-500">読み込み中…</p>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}
          {!loading && !error && data && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-zinc-500">
                {data.start} 〜 {data.end}（スタッフ {data.count}件）
                {data.source === "openai" && " · AI要約"}
                {data.source === "simple" && " · 簡易表示（OPENAI_API_KEY 未設定）"}
              </p>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 whitespace-pre-line">
                {data.summary}
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800">店長・マネージャー日報（同一期間）</h2>
          {!loading && !error && data && (
            <div className="mt-4 space-y-2">
              {data.managerCount != null && data.managerCount > 0 && data.managerSummary ? (
                <>
                  <p className="text-xs text-zinc-500">{data.managerCount}件</p>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 whitespace-pre-line">
                    {data.managerSummary}
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500">該当期間の店長日報はありません。</p>
              )}
            </div>
          )}
        </section>
      </main>
  );
}
