"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Report = {
  id: string;
  date: string;
  shiftText: string;
  busyLevel: string;
  mood: string;
  trouble: string;
  condition: string;
  workItems: string[];
  memo: string;
  createdAt: string;
};

const BUSY_OPTIONS = ["とても暇", "やや暇", "普通", "やや忙しい", "とても忙しい", "やや混雑", "とても混雑"];
const MOOD_OPTIONS = ["とても良い", "良い", "普通", "あまり良くない"];
const TROUBLE_OPTIONS = ["なし", "軽微なものあり", "大きめのものあり"];
const CONDITION_OPTIONS = ["とても良い", "普通", "あまり良くない"];
const WORK_ITEM_LABELS = ["ホール接客", "ドリンク", "キッチン", "洗い場", "レジ", "仕込み", "清掃"];

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "deleting" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/reports/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        setReport(data);
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!report) return;
    setStatus("sending");
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const date = (formData.get("date") as string) || report.date;
    const shiftText = (formData.get("shiftText") as string) || "";
    const busyLevel = (formData.get("busyLevel") as string) || "";
    const mood = (formData.get("mood") as string) || "";
    const trouble = (formData.get("trouble") as string) || "";
    const condition = (formData.get("condition") as string) || "";
    const memo = (formData.get("memo") as string) || "";
    const workItems = formData.getAll("workItems") as string[];

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shiftText,
          busyLevel,
          mood,
          trouble,
          condition,
          workItems,
          memo,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "更新に失敗しました");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーです。もう一度お試しください。");
    }
  };

  const handleDelete = async () => {
    if (!confirm("この日報を削除しますか？")) return;
    setStatus("deleting");
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "削除に失敗しました");
        setStatus("error");
        return;
      }
      router.push("/reports");
    } catch {
      setErrorMessage("通信エラーです。もう一度お試しください。");
      setStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </div>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-zinc-500">日報が見つかりません。</p>
        <Link href="/reports" className="mt-4 inline-block text-sm text-zinc-600 hover:underline">
          ← 日報一覧へ
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <header>
        <Link href="/reports" className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline">
          ← 日報一覧
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          日報を編集
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          内容を変更して保存するか、この日報を削除できます。
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">日付</label>
              <input
                name="date"
                type="date"
                defaultValue={report.date}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                今日のシフト（例：10:00-18:00 ホール）
              </label>
              <input
                name="shiftText"
                type="text"
                defaultValue={report.shiftText}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="将来的にはシフトデータから自動入力予定"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">本日の忙しさ</label>
              <select
                name="busyLevel"
                defaultValue={report.busyLevel}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {BUSY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">お客様の雰囲気</label>
              <select
                name="mood"
                defaultValue={report.mood}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {MOOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">トラブル・クレームの有無</label>
              <select
                name="trouble"
                defaultValue={report.trouble}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {TROUBLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">自分のコンディション</label>
              <select
                name="condition"
                defaultValue={report.condition}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              本日行った主な業務（複数選択・仮）
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {WORK_ITEM_LABELS.map((label) => (
                <label key={label} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="workItems"
                    value={label}
                    defaultChecked={report.workItems?.includes(label)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              ひとことメモ・気づき（自由記述は1つだけ）
            </label>
            <textarea
              name="memo"
              rows={4}
              defaultValue={report.memo}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="例）ランチピークでドリンクが遅れがちだった／新人さんの接客がとても良かった など"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "sending" ? "保存中…" : "変更を保存"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={status === "deleting"}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {status === "deleting" ? "削除中…" : "この日報を削除する"}
            </button>
          </div>
        </form>

        {status === "ok" && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            日報を保存しました。
          </div>
        )}
        {status === "error" && errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}
      </section>
    </main>
  );
}
