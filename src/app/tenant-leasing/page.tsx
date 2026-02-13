"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TenantLeasingDashboardPage() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/tenant-leasing/properties").then((r) => r.json()),
      fetch("/api/tenant-leasing/leads").then((r) => r.json()),
    ])
      .then(([props, leads]) => {
        setPropertiesCount(Array.isArray(props) ? props.length : 0);
        setLeadsCount(Array.isArray(leads) ? leads.length : 0);
      })
      .catch(() => {});
  }, []);

  return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">
            テナント募集
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            物件・リードの管理、マッチング、アウトリーチを一括で行えます。
          </p>
        </header>

        <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/tenant-leasing/properties"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-sm font-medium text-zinc-700">物件一覧</h2>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {propertiesCount}
              <span className="ml-1 text-sm font-normal text-zinc-500">件</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              賃料・面積・業種制限を登録・検索
            </p>
          </Link>
          <Link
            href="/tenant-leasing/leads"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-sm font-medium text-zinc-700">リード一覧</h2>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {leadsCount}
              <span className="ml-1 text-sm font-normal text-zinc-500">件</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              CSV取込・手動登録・検索
            </p>
          </Link>
          <Link
            href="/tenant-leasing/matching"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-sm font-medium text-zinc-700">マッチング</h2>
            <p className="mt-2 text-xs text-zinc-500">
              物件×リードの候補をスコア表示
            </p>
          </Link>
          <Link
            href="/tenant-leasing/outreach"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-sm font-medium text-zinc-700">アウトリーチ・リマインド</h2>
            <p className="mt-2 text-xs text-zinc-500">
              履歴・ステータス・次アクション
            </p>
          </Link>
          <Link
            href="/tenant-leasing/templates"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-sm font-medium text-zinc-700">メールテンプレート</h2>
            <p className="mt-2 text-xs text-zinc-500">
              一斉送信用テンプレートの管理
            </p>
          </Link>
        </nav>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tenant-leasing/properties/new"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            物件を登録
          </Link>
          <Link
            href="/tenant-leasing/leads/new"
            className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            リードを登録
          </Link>
          <Link
            href="/tenant-leasing/leads/import"
            className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            CSVでリード取込
          </Link>
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
