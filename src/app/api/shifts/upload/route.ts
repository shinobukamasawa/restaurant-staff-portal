import { NextResponse } from "next/server";
import { readShifts, writeShifts, type ShiftImport } from "@/lib/data";

function parseCsv(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === "," && !inQuotes) || (c === "\t" && !inQuotes)) {
        row.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    row.push(current.trim());
    return row;
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const storeId = (formData.get("storeId") as string) || "store-a";
    const yearMonth = (formData.get("yearMonth") as string) || "";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const isCsv =
      fileName.endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/csv";
    if (!isCsv) {
      return NextResponse.json(
        { error: "CSVファイルを選択してください" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(buffer);
    const rows = parseCsv(text);

    const imports = await readShifts();
    const newImport: ShiftImport = {
      id: `shift-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      storeId,
      yearMonth: yearMonth || new Date().toISOString().slice(0, 7),
      rows,
      fileName,
      importedAt: new Date().toISOString(),
    };
    imports.push(newImport);
    await writeShifts(imports);

    return NextResponse.json({
      ok: true,
      id: newImport.id,
      rowCount: rows.length,
      message: `${rows.length} 行を取り込みました。`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "CSVの取り込みに失敗しました" },
      { status: 500 }
    );
  }
}
