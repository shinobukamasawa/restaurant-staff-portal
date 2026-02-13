"use client";

import { useState, useEffect } from "react";

type ShiftApi = {
  imports: { id: string; storeId: string; yearMonth: string; fileName: string; importedAt: string; rowCount: number }[];
  latest: {
    id: string;
    storeId: string;
    yearMonth: string;
    fileName: string;
    importedAt: string;
    rows: string[][];
  } | null;
};

export default function ShiftsPage() {
  const [data, setData] = useState<ShiftApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shifts")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch(() => setError("シフトの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  const latest = data?.latest;
  const rows = latest?.rows ?? [];

  return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">シフト</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Airシフトから取り込んだシフト表です。店長がCSVをアップロードするとここに反映されます。
          </p>
        </header>

        {latest && (
          <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-zinc-700">最新の取り込み</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {latest.fileName} — {latest.yearMonth} · {latest.importedAt.slice(0, 10)}
            </p>
          </section>
        )}

        {rows.length === 0 ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-600">
              まだシフトデータがありません。店長が「シフトCSV」からAirシフトのCSVをアップロードすると表示されます。
            </p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    {rows[0]?.map((cell, i) => (
                      <th key={i} className="px-4 py-2 font-medium text-zinc-700">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1, 51).map((row, ri) => (
                    <tr key={ri} className="border-b border-zinc-100">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 text-zinc-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 51 && (
              <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500">
                先頭50行のみ表示しています（全体 {rows.length} 行）
              </p>
            )}
          </section>
        )}

        {data?.imports && data.imports.length > 1 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-zinc-700">取り込み履歴</h2>
            <ul className="mt-2 space-y-1 text-xs text-zinc-600">
              {data.imports.slice(-5).reverse().map((imp) => (
                <li key={imp.id}>
                  {imp.fileName} — {imp.yearMonth} ({imp.rowCount}行) · {imp.importedAt.slice(0, 10)}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
  );
}
