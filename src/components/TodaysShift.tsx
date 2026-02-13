"use client";

import { useState, useEffect } from "react";

type TodaysShiftRow = {
  startTime: string;
  endTime: string;
  displayName: string;
};

type TodaysShiftRes = {
  rows: TodaysShiftRow[];
  source?: { fileName: string; yearMonth: string; importedAt: string } | null;
};

export default function TodaysShift() {
  const [data, setData] = useState<TodaysShiftRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch("/api/shifts/today", { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.rows)) {
          setData({
            rows: json.rows,
            source: json.source ?? null,
          });
        } else {
          setData({ rows: [], source: null });
        }
      })
      .catch(() => setData({ rows: [], source: null }))
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-zinc-700">本日のシフト</h2>
        <p className="mt-2 text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  const hasData = data && data.rows.length > 0;

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  })();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-zinc-700">
        本日のシフト <span className="font-normal text-zinc-500">{todayStr}</span>
      </h2>
      <p className="mt-0.5 text-xs text-zinc-500">
        店長がアップロードしたシフトCSV（最新）を参照しています。
      </p>
      {!hasData ? (
        <>
          <p className="mt-2 text-sm text-zinc-500">
            本日のシフトデータがありません。シフトCSVに本日の日付の行があるとここに表示されます。
          </p>
          <a href="/shifts" className="mt-2 inline-block text-xs text-zinc-600 hover:underline">
            シフト一覧で確認する
          </a>
        </>
      ) : (
        <>
          {data.source && (
            <p className="mt-1 text-xs text-zinc-500">
              {data.source.fileName}（{data.source.yearMonth}）
            </p>
          )}
          <p className="mt-0.5 text-xs text-zinc-500">{data.rows.length}件（開始時間の昇順）</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-1 pr-2 font-medium text-zinc-600">開始時間</th>
                  <th className="py-1 pr-2 font-medium text-zinc-600">終了時間</th>
                  <th className="py-1 pr-2 font-medium text-zinc-600">表示名</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 20).map((row, ri) => (
                  <tr key={ri} className="border-b border-zinc-100">
                    <td className="py-1 pr-2 text-zinc-800">{row.startTime}</td>
                    <td className="py-1 pr-2 text-zinc-800">{row.endTime}</td>
                    <td className="py-1 pr-2 text-zinc-800">{row.displayName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.rows.length > 20 && (
            <p className="mt-1 text-xs text-zinc-500">他 {data.rows.length - 20} 件</p>
          )}
          <a href="/shifts" className="mt-2 inline-block text-xs text-zinc-600 hover:underline">
            シフト一覧 →
          </a>
        </>
      )}
    </div>
  );
}
