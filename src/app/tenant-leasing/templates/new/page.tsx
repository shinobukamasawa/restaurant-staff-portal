"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TemplateNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tenant-leasing/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/tenant-leasing/templates/${data.id}`);
        return;
      }
      alert("作成に失敗しました");
    } catch {
      alert("作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/tenant-leasing/templates"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← テンプレート一覧
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        テンプレート新規作成
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        件名・本文で {"{{companyName}}"}, {"{{contactName}}"}, {"{{email}}"} が置換されます。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            テンプレート名 *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            件名 *
          </label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            本文 *
          </label>
          <textarea
            rows={8}
            required
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "作成中..." : "作成"}
          </button>
          <Link
            href="/tenant-leasing/templates"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </main>
  );
}
