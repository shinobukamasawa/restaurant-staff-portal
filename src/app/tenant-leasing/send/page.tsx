"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Template = { id: string; name: string; subject: string };
type Lead = { id: string; companyName: string; email: string };

function SendContent() {
  const searchParams = useSearchParams();
  const presetTemplateId = searchParams.get("templateId");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templateId, setTemplateId] = useState(presetTemplateId || "");
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [propertyId, setPropertyId] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    results: { leadId: string; sent: boolean }[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tenant-leasing/email-templates").then((r) => r.json()),
      fetch("/api/tenant-leasing/leads").then((r) => r.json()),
    ]).then(([t, l]) => {
      setTemplates(Array.isArray(t) ? t : []);
      setLeads(Array.isArray(l) ? l : []);
    });
  }, []);

  useEffect(() => {
    if (presetTemplateId) setTemplateId(presetTemplateId);
  }, [presetTemplateId]);

  const toggleLead = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllWithEmail = () => {
    const withEmail = leads.filter((l) => l.email).map((l) => l.id);
    setSelectedLeadIds(new Set(withEmail));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || selectedLeadIds.size === 0) {
      alert("テンプレートと送信先リードを選択してください");
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/tenant-leasing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          leadIds: Array.from(selectedLeadIds),
          propertyId: propertyId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ message: data.message, results: data.results ?? [] });
      } else {
        alert(data.error || "送信に失敗しました");
      }
    } catch {
      alert("送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  const leadsWithEmail = leads.filter((l) => l.email);

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/tenant-leasing"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← テナント募集
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        一斉送信
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        テンプレートを選び、送信先リードを選択して送信します。メールアドレスが登録されているリードのみ送信可能です。
      </p>

      <form onSubmit={handleSend} className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            テンプレート *
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
            className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.subject}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            物件ID（任意・アウトリーチ紐付け用）
          </label>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="物件を指定するとアウトリーチ履歴に紐づきます"
            className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700">
              送信先リード * （メールありのみ表示）
            </label>
            <button
              type="button"
              onClick={selectAllWithEmail}
              className="text-xs text-zinc-600 hover:underline"
            >
              メールありを全選択
            </button>
          </div>
          <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2">
            {leadsWithEmail.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">
                メールアドレスが登録されたリードがありません
              </p>
            ) : (
              <ul className="space-y-1">
                {leadsWithEmail.map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.has(l.id)}
                      onChange={() => toggleLead(l.id)}
                      className="rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-900">
                      {l.companyName}
                    </span>
                    <span className="text-xs text-zinc-500">{l.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {result && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <p className="font-medium">{result.message}</p>
            <p className="mt-1 text-zinc-600">
              成功: {result.results.filter((r) => r.sent).length} 件 / 失敗:{" "}
              {result.results.filter((r) => !r.sent).length} 件
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sending || selectedLeadIds.size === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {sending ? "送信中..." : "送信"}
          </button>
          <Link
            href="/tenant-leasing/templates"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            テンプレート一覧
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function SendPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-500">読み込み中...</p>}>
      <SendContent />
    </Suspense>
  );
}
