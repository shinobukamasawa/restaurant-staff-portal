import { NextResponse } from "next/server";
import { readShifts } from "@/lib/data";

export async function GET() {
  try {
    const imports = await readShifts();
    const list = imports.map((imp) => ({
      id: imp.id,
      storeId: imp.storeId,
      yearMonth: imp.yearMonth,
      fileName: imp.fileName,
      importedAt: imp.importedAt,
      rowCount: imp.rows.length,
    }));
    const latest = imports[imports.length - 1] ?? null;
    return NextResponse.json({
      imports: list,
      latest: latest
        ? {
            id: latest.id,
            storeId: latest.storeId,
            yearMonth: latest.yearMonth,
            fileName: latest.fileName,
            importedAt: latest.importedAt,
            rows: latest.rows,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "シフトデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}
