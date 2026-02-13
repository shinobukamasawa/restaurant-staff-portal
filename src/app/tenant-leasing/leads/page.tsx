"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  companyName: string;
  industry: string;
  contactName: string;
  email: string;
  phone: string;
  desiredAreas: string[];
  desiredRentMin: number;
  desiredRentMax: number;
  desiredAreaMin: number;
  desiredAreaMax: number;
  memo: string;
};

export default function LeadsListPage() {
  const [list, setList] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = search.trim()
      ? `/api/tenant-leasing/leads?q=${encodeURIComponent(search.trim())}`
      : "/api/tenant-leasing/leads";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-zinc-50">
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
              リード一覧
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/tenant-leasing/leads/import"
              className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              CSV取込
            </Link>
            <Link
              href="/tenant-leasing/leads/new"
              className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              新規登録
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="search"
            placeholder="企業名・業種・担当者・メールで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">読み込み中...</p>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            リードがありません。新規登録またはCSV取込をしてください。
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/tenant-leasing/leads/${l.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-medium text-zinc-900">
                        {l.companyName}
                      </h2>
                      <p className="mt-0.5 text-sm text-zinc-600">
                        {l.industry}
                        {l.contactName && ` ／ ${l.contactName}`}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {l.email && `${l.email} ／ `}
                        {l.desiredAreas.length > 0 &&
                          `希望: ${l.desiredAreas.join(", ")}`}
                        {(l.desiredRentMin || l.desiredRentMax) &&
                          ` ／ 賃料 ${l.desiredRentMin?.toLocaleString()}〜${l.desiredRentMax?.toLocaleString()}円`}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
