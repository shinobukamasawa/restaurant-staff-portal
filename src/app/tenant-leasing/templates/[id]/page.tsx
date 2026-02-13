"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [item, setItem] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", body: "" });

  useEffect(() => {
    fetch(`/api/tenant-leasing/email-templates/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setItem(data);
        if (data)
          setForm({
            name: data.name,
            subject: data.subject,
            body: data.body,
          });
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tenant-leasing/email-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setItem(updated);
      } else alert("更新に失敗しました");
    } catch {
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("このテンプレートを削除しますか？")) return;
    const res = await fetch(`/api/tenant-leasing/email-templates/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/tenant-leasing/templates");
    else alert("削除に失敗しました");
  };

  if (loading) return <p className="p-8 text-zinc-500">読み込み中...</p>;
  if (!item) return <p className="p-8 text-zinc-500">見つかりません。</p>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/tenant-leasing/templates"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← テンプレート一覧
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{item.name}</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            テンプレート名
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            件名
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            本文
          </label>
          <textarea
            rows={8}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <Link
            href={`/tenant-leasing/send?templateId=${id}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            このテンプレートで送信
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            削除
          </button>
        </div>
      </form>
    </main>
  );
}
