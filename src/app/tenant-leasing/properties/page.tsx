"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Property = {
  id: string;
  name: string;
  address: string;
  area: number;
  rentMin: number;
  rentMax: number;
  allowedIndustries: string[];
  availableFrom: string;
  memo: string;
};

export default function PropertiesListPage() {
  const [list, setList] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = search.trim()
      ? `/api/tenant-leasing/properties?q=${encodeURIComponent(search.trim())}`
      : "/api/tenant-leasing/properties";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [search]);

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
            物件一覧
          </h1>
        </div>
        <Link
          href="/tenant-leasing/properties/new"
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          新規登録
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="物件名・住所・メモで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">読み込み中...</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
          物件がありません。新規登録または検索条件を変えてください。
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/tenant-leasing/properties/${p.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium text-zinc-900">{p.name}</h2>
                    <p className="mt-0.5 text-sm text-zinc-600">{p.address}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {p.area}㎡ ／ 賃料 {p.rentMin.toLocaleString()}〜
                      {p.rentMax.toLocaleString()}円
                      {p.allowedIndustries.length > 0 &&
                        ` ／ 業種: ${p.allowedIndustries.join(", ")}`}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    空き予定: {p.availableFrom || "未定"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
