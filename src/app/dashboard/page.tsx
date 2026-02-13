"use client";

import { useState, useEffect } from "react";
import TodaysShift from "@/components/TodaysShift";

type Notice = { id: string; title: string; body: string; storeId: string; createdAt: string };

export default function DashboardPage() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch("/api/notices", { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => (Array.isArray(json) ? setNotices(json.slice(0, 3)) : setNotices([])))
      .catch(() => setNotices([]))
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900">
            ダッシュボード
          </h1>
          <p className="text-sm text-zinc-600">
            今日のシフトやお知らせ、日報の状況を確認できます。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <TodaysShift />

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-zinc-700">お知らせ</h2>
            {notices.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">お知らせはありません。</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-zinc-900">
                {notices.map((n) => (
                  <li key={n.id}>
                    <a href={`/notices/${n.id}`} className="hover:underline">
                      · {n.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a href="/notices" className="mt-2 inline-block text-xs text-zinc-600 hover:underline">
              お知らせ一覧 →
            </a>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-zinc-700">日報</h2>
            <p className="mt-2 text-sm text-zinc-900">日報の入力・過去分の確認ができます。</p>
            <div className="mt-3 flex gap-2">
              <a
                href="/reports/new"
                className="inline-flex rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
              >
                日報を入力
              </a>
              <a
                href="/reports"
                className="inline-flex rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                日報一覧
              </a>
            </div>
          </div>
        </section>

      </main>
  );
}

