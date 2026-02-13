"use client";

import { useState, useEffect } from "react";

type Notice = {
  id: string;
  title: string;
  body: string;
  storeId: string;
  createdAt: string;
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    fetch("/api/notices", { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setNotices([]);
        } else {
          setNotices(json);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          setError("お知らせの取得がタイムアウトしました。開発サーバーが起動しているか、別のターミナルでポートが競合していないか確認してください。");
        } else {
          setError("お知らせの取得に失敗しました");
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  };

  const storeLabel = (id: string) => (id === "all" ? "全店舗" : id === "store-a" ? "A店" : id === "store-b" ? "B店" : id);

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
          <h1 className="text-2xl font-semibold text-zinc-900">お知らせ</h1>
          <p className="mt-1 text-sm text-zinc-600">
            本部・店長からの連絡です。新しい順に表示しています。
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {!error && notices.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">お知らせはまだありません。</p>
          </div>
        )}

        {!error && notices.length > 0 && (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id}>
                <a
                  href={`/notices/${n.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                >
                  <h2 className="font-medium text-zinc-900">{n.title}</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {storeLabel(n.storeId)} · {formatDate(n.createdAt)}
                  </p>
                  {n.body && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                      {n.body}
                    </p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
  );
}
