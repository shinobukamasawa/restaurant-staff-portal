"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Notice = {
  id: string;
  title: string;
  body: string;
  storeId: string;
  createdAt: string;
};

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/notices/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setNotice(null);
        } else {
          setNotice(json);
        }
      })
      .catch(() => setError("お知らせの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const storeLabel = (sid: string) =>
    sid === "all" ? "全店舗" : sid === "store-a" ? "A店" : sid === "store-b" ? "B店" : sid;

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error || "お知らせが見つかりません"}
        </div>
        <p className="mt-4">
          <a href="/notices" className="text-sm text-zinc-600 hover:underline">
            ← お知らせ一覧へ
          </a>
        </p>
      </div>
    );
  }

  return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="mb-4">
          <a href="/notices" className="text-sm text-zinc-600 hover:underline">
            ← お知らせ一覧へ
          </a>
        </p>
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <header>
            <h1 className="text-xl font-semibold text-zinc-900">{notice.title}</h1>
            <p className="mt-2 text-xs text-zinc-500">
              {storeLabel(notice.storeId)} · {formatDate(notice.createdAt)}
            </p>
          </header>
          <div className="mt-4 whitespace-pre-wrap text-sm text-zinc-800">
            {notice.body || "（本文なし）"}
          </div>
        </article>
      </main>
  );
}
