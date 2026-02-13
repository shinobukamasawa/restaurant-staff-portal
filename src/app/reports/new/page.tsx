"use client";

import { useState } from "react";

export default function NewReportPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    setPreview(null);

    const formData = new FormData(event.currentTarget);
    const date = (formData.get("date") as string) || new Date().toISOString().slice(0, 10);
    const shiftText = (formData.get("shiftText") as string) || "";
    const busyLevel = (formData.get("busyLevel") as string) || "";
    const mood = (formData.get("mood") as string) || "";
    const trouble = (formData.get("trouble") as string) || "";
    const condition = (formData.get("condition") as string) || "";
    const memo = (formData.get("memo") as string) || "";
    const workItems = formData.getAll("workItems") as string[];

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
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
        setErrorMessage(data.error || "送信に失敗しました");
        return;
      }

      setStatus("ok");
      setPreview(
        [
          `忙しさ: ${busyLevel}`,
          `お客様の雰囲気: ${mood}`,
          `トラブル・クレーム: ${trouble}`,
          `コンディション: ${condition}`,
          workItems.length > 0 ? `主な業務: ${workItems.join(", ")}` : "",
          memo ? `ひとことメモ: ${memo}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーです。もう一度お試しください。");
    }
  };

  return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">
            日報入力（一般スタッフ向け・仮）
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            なるべくカンタンに書けるように、選択式を中心にしています。最後に「ひとことメモ」を1つだけ書けます。
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  日付
                </label>
                <input
                  name="date"
                  type="date"
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
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="将来的にはシフトデータから自動入力予定"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  本日の忙しさ
                </label>
                <select
                  name="busyLevel"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="とても暇">とても暇</option>
                  <option value="やや暇">やや暇</option>
                  <option value="普通">普通</option>
                  <option value="やや忙しい">やや忙しい</option>
                  <option value="とても忙しい">とても忙しい</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  お客様の雰囲気
                </label>
                <select
                  name="mood"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="とても良い">とても良い</option>
                  <option value="良い">良い</option>
                  <option value="普通">普通</option>
                  <option value="あまり良くない">あまり良くない</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  トラブル・クレームの有無
                </label>
                <select
                  name="trouble"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="なし">なし</option>
                  <option value="軽微なものあり">軽微なものあり</option>
                  <option value="大きめのものあり">大きめのものあり</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  自分のコンディション
                </label>
                <select
                  name="condition"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="とても良い">とても良い</option>
                  <option value="普通">普通</option>
                  <option value="あまり良くない">あまり良くない</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                本日行った主な業務（複数選択・仮）
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {[
                  "ホール接客",
                  "ドリンク",
                  "キッチン",
                  "洗い場",
                  "レジ",
                  "仕込み",
                  "清掃",
                ].map((label) => (
                  <label key={label} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="workItems"
                      value={label}
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
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="例）ランチピークでドリンクが遅れがちだった／新人さんの接客がとても良かった など"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "sending" ? "送信中…" : "日報を送信"}
            </button>
          </form>

          {status === "ok" && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              日報を保存しました。以下の内容でAI要約に利用されます。
            </div>
          )}
          {status === "error" && errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
          {preview && (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-800 whitespace-pre-line">
              <p className="mb-2 font-semibold">送信内容のプレビュー</p>
              {preview}
            </div>
          )}

          <p className="mt-4 text-xs text-zinc-500">
            ※ 日報は data/reports.json に保存されています。次のステップでAI要約を表示します。
          </p>
        </section>
      </main>
  );
}

