"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/reports/${id}`)
      .then((res) => {
        if (!res.ok) return res.json().then((j) => { throw new Error(j.error || "取得に失敗"); });
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "日報の取得に失敗しました");
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || "日報が見つかりません。"}
        </div>
        <Link href="/reports" className="mt-4 inline-block text-sm text-zinc-600 hover:underline">
          ← 日報一覧へ
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <Link href="/reports" className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline">
          ← 日報一覧
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          日報 · {formatDate(report.date)}
        </h1>
      </header>

      <div className="space-y-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">基本</h2>
          <dl className="mt-2 grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-zinc-500">日付</dt>
              <dd className="text-zinc-900">{formatDate(report.date)}</dd>
            </div>
            {report.shiftText && (
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-zinc-500">シフト</dt>
                <dd className="text-zinc-900">{report.shiftText}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-zinc-500">忙しさ</dt>
              <dd className="text-zinc-900">{report.busyLevel || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-zinc-500">雰囲気</dt>
              <dd className="text-zinc-900">{report.mood || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-zinc-500">トラブル</dt>
              <dd className="text-zinc-900">{report.trouble || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-zinc-500">コンディション</dt>
              <dd className="text-zinc-900">{report.condition || "—"}</dd>
            </div>
            {report.workItems && report.workItems.length > 0 && (
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-zinc-500">主な業務</dt>
                <dd className="text-zinc-900">{report.workItems.join("、")}</dd>
              </div>
            )}
          </dl>
        </section>

        {report.memo && (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-zinc-700">自由記述・メモ</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-800">
              {report.memo}
            </p>
          </section>
        )}
      </div>

      <p className="mt-6">
        <Link href="/reports/new" className="text-sm text-zinc-600 hover:underline">
          ＋ 新しい日報を入力する
        </Link>
      </p>
    </main>
  );
}
