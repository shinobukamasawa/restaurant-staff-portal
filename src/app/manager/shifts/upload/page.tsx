"use client";

import { useState } from "react";

export default function ShiftCsvUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storeId, setStoreId] = useState("store-a");
  const [yearMonth, setYearMonth] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setMessage(null);
    setStatus("idle");
  };

  const handleClickUpload = async () => {
    if (!selectedFile) {
      setMessage("ファイルが選択されていません。AirシフトのCSVを選んでください。");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("storeId", storeId);
      formData.append("yearMonth", yearMonth || new Date().toISOString().slice(0, 7));

      const res = await fetch("/api/shifts/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "取り込みに失敗しました");
        return;
      }

      setStatus("ok");
      setMessage(data.message || `${data.rowCount} 行を取り込みました。`);
    } catch {
      setStatus("error");
      setMessage("通信エラーです。もう一度お試しください。");
    }
  };

  return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">
            シフトCSVアップロード（店長向け・仮）
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Airシフトから出力したシフト表CSVをアップロードする画面です。まずは画面だけ用意し、後で読み込み処理を追加します。
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                対象店舗
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="store-a">A店</option>
                <option value="store-b">B店</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  対象年月（例：2026-03）
                </label>
                <input
                  type="month"
                  value={yearMonth}
                  onChange={(e) => setYearMonth(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                シフトCSVファイル
              </label>
              <input
                type="file"
                accept=".csv,.xlsx"
                className="mt-1 w-full text-sm text-zinc-700"
                onChange={handleFileChange}
              />
              <p className="mt-1 text-xs text-zinc-500">
                ※ AirシフトからエクスポートしたCSV/Excelファイルを選択してください。
              </p>

              {selectedFile && (
                <p className="mt-1 text-xs text-zinc-700">
                  選択中のファイル: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleClickUpload}
              disabled={status === "sending"}
              className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "sending" ? "取り込み中…" : "CSVをアップロード"}
            </button>
          </form>

          <div className="mt-4 space-y-1 text-xs">
            {status === "ok" && message && (
              <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">{message}</p>
            )}
            {status === "error" && message && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{message}</p>
            )}
            <p className="text-zinc-500">
              ※ 取り込んだデータは data/shifts.json に保存されます。社員のシフト画面では後から表示を実装します。
            </p>
          </div>
        </section>
      </main>
  );
}

