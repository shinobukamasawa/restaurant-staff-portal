"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Report = {
  id: string;
  date: string;
  shiftText: string;
  busyLevel: string;
  mood: string;
  trouble: string;
  condition: string;
  workItems: string[];
  memo: string;
  createdAt: string;
};

export default function ReportsListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setReports([]);
        } else {
          const sorted = (json as Report[]).sort((a, b) => (b.date > a.date ? 1 : -1));
          setReports(sorted);
        }
      })
      .catch(() => setError("日報の取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">日報一覧</h1>
          <p className="mt-1 text-sm text-zinc-600">
            提出した日報を日付の新しい順に表示しています。
          </p>
          <a href="/reports/new" className="mt-3 inline-block text-sm font-medium text-zinc-700 hover:underline">
            ＋ 日報を入力する
          </a>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {!error && reports.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">まだ日報がありません。</p>
            <a href="/reports/new" className="mt-3 inline-block text-sm text-zinc-700 hover:underline">
              日報を入力する
            </a>
          </div>
        )}

        {!error && reports.length > 0 && (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/reports/${r.id}/edit`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                >
                  <p className="text-xs text-zinc-500">{formatDate(r.date)}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {r.shiftText || "—"} · 忙しさ: {r.busyLevel || "—"}
                  </p>
                  {r.memo && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                      {r.memo}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
  );
}
