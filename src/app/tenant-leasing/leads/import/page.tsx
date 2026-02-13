"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function LeadsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }
    setError("");
    setResult(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/tenant-leasing/leads/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setError(data.error || "取込に失敗しました");
      }
    } catch {
      setError("取込に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/tenant-leasing/leads"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← リード一覧
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          CSVでリード取込
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          1行目はヘッダーにしてください。列名は英語または日本語（企業名／会社名、業種、担当、email、電話、エリア、賃料など）に対応しています。メールアドレスが既存と重複する行はスキップされます。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              CSVファイル
            </label>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError("");
                setResult(null);
              }}
              className="mt-1 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {result && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              取込: {result.imported} 件、スキップ: {result.skipped} 件、合計:{" "}
              {result.total} 件
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !file}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? "取込中..." : "取込実行"}
            </button>
            <Link
              href="/tenant-leasing/leads"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              リード一覧へ
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
