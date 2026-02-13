import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

const PROPERTIES_FILE = path.join(DATA_DIR, "tenant-properties.json");
const LEADS_FILE = path.join(DATA_DIR, "tenant-leads.json");
const OUTREACH_FILE = path.join(DATA_DIR, "tenant-outreach.json");
const EMAIL_TEMPLATES_FILE = path.join(DATA_DIR, "tenant-email-templates.json");

// --- 物件マスタ ---
export interface Property {
  id: string;
  name: string;
  address: string;
  area: number; // 面積（㎡）
  rentMin: number; // 賃料下限（円）
  rentMax: number; // 賃料上限（円）
  allowedIndustries: string[]; // 業種制限（空なら制限なし）
  availableFrom: string; // 空き予定日 YYYY-MM-DD
  memo: string;
  createdAt: string;
  updatedAt: string;
}

// --- リード（テナント候補）マスタ ---
export interface Lead {
  id: string;
  companyName: string;
  industry: string;
  contactName: string;
  email: string;
  phone: string;
  desiredAreas: string[]; // 希望エリア
  desiredRentMin: number;
  desiredRentMax: number;
  desiredAreaMin: number;
  desiredAreaMax: number;
  expansionNotes: string; // 出店動向メモ
  memo: string;
  createdAt: string;
  updatedAt: string;
}

// --- アウトリーチステータス ---
export type { OutreachStatus } from "./tenant-leasing-constants";
export { OUTREACH_STATUS_LABELS } from "./tenant-leasing-constants";

export interface OutreachRecord {
  id: string;
  propertyId: string;
  leadId: string;
  status: OutreachStatus;
  lastContactAt: string; // ISO
  nextActionAt: string | null; // リマインド用
  emailSentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  phoneMemo: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

// --- メールテンプレート ---
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// --- 物件 CRUD ---
export async function readProperties(): Promise<Property[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PROPERTIES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeProperties(items: Property[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PROPERTIES_FILE, JSON.stringify(items, null, 2), "utf-8");
}

// --- リード CRUD ---
export async function readLeads(): Promise<Lead[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeLeads(items: Lead[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(LEADS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

// --- アウトリーチ CRUD ---
export async function readOutreach(): Promise<OutreachRecord[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(OUTREACH_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeOutreach(items: OutreachRecord[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(OUTREACH_FILE, JSON.stringify(items, null, 2), "utf-8");
}

// --- メールテンプレート CRUD ---
export async function readEmailTemplates(): Promise<EmailTemplate[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(EMAIL_TEMPLATES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeEmailTemplates(items: EmailTemplate[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(EMAIL_TEMPLATES_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
