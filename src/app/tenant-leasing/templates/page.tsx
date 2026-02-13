"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export default function TemplatesListPage() {
  const [list, setList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenant-leasing/email-templates")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/tenant-leasing"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← テナント募集
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
            メールテンプレート
          </h1>
        </div>
        <Link
          href="/tenant-leasing/templates/new"
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          新規作成
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">読み込み中...</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
          テンプレートがありません。新規作成するか、一斉送信で既存テンプレートを選べます。
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tenant-leasing/templates/${t.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
              >
                <h2 className="font-medium text-zinc-900">{t.name}</h2>
                <p className="mt-0.5 text-sm text-zinc-600">{t.subject}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {t.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link
          href="/tenant-leasing/send"
          className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          一斉送信
        </Link>
      </div>
    </main>
  );
}
