import fs from "fs/promises";
import path from "path";

// ---------- Storage abstraction ----------
// ローカル: ファイルシステム / Vercel: Upstash Redis
// Vercel経由の場合: KV_REST_API_URL / KV_REST_API_TOKEN
// Upstash直接の場合: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const isVercel = !!redisUrl;

let redis: import("@upstash/redis").Redis | null = null;

async function getRedis() {
  if (redis) return redis;
  const { Redis } = await import("@upstash/redis");
  redis = new Redis({
    url: redisUrl!,
    token: redisToken!,
  });
  return redis;
}

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

async function readJson<T>(filePath: string, key: string, fallback: T[]): Promise<T[]> {
  if (isVercel) {
    const kv = await getRedis();
    const data = await kv.get<T[]>(key);
    return data ?? fallback;
  }
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, key: string, data: T[]): Promise<void> {
  if (isVercel) {
    const kv = await getRedis();
    await kv.set(key, data);
    return;
  }
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- File paths & KV keys ----------
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const SHIFTS_FILE = path.join(DATA_DIR, "shifts.json");
const MANAGER_REPORTS_FILE = path.join(DATA_DIR, "manager-reports.json");
const NOTICES_FILE = path.join(DATA_DIR, "notices.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SALES_RATES_FILE = path.join(DATA_DIR, "sales-day-of-week-rates.json");
const SALES_TARGETS_MONTHLY_FILE = path.join(DATA_DIR, "sales-targets-monthly.json");
const SALES_DAILY_FILE = path.join(DATA_DIR, "sales-daily.json");
const ZENIN_REPORTS_FILE = path.join(DATA_DIR, "zenin-reports.json");
const TIMESLOT_REPORTS_FILE = path.join(DATA_DIR, "timeslot-reports.json");
const REPRESENTATIVE_ASSIGNMENTS_FILE = path.join(DATA_DIR, "representative-assignments.json");
const TIMESLOTS_FILE = path.join(DATA_DIR, "timeslots.json");

// ---------- Types ----------
export interface ZeninReport {
  id: string;
  date: string;
  storeId: string;
  userId: string;
  condition: string;
  busyLevel: string;
  trouble: string;
  goodPoint: string;
  memo: string;
  createdAt: string;
}

export interface TimeSlotReport {
  id: string;
  date: string;
  storeId: string;
  timeSlotId: string;
  userId: string;
  salesEvaluation: string;
  storeCondition: string;
  staffing: string;
  events: string[];
  memo: string;
  createdAt: string;
}

export interface RepresentativeAssignment {
  date: string;
  storeId: string;
  timeSlotId: string;
  userId: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SalesDayRate {
  dayOfWeek: number;
  label: string;
  rate: number;
}

export interface SalesTargetMonthly {
  storeId: string;
  yearMonth: string;
  amount: number;
}

export interface SalesDaily {
  storeId: string;
  date: string;
  amount: number;
}

export type UserRole = "staff" | "manager" | "hq";

export interface User {
  id: string;
  passwordHash: string;
  role: UserRole;
  storeId?: string;
  displayName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
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
}

export interface ShiftImport {
  id: string;
  storeId: string;
  yearMonth: string;
  rows: string[][];
  fileName: string;
  importedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  storeId: string;
  createdAt: string;
}

export interface ManagerReport {
  id: string;
  date: string;
  storeId: string;
  salesEvaluation: string;
  storeCondition: string;
  staffing: string;
  events: string[];
  themes: string[];
  memo: string;
  combinedSummary?: string;
  createdAt: string;
}

// ---------- CRUD functions ----------
export async function readReports(): Promise<Report[]> {
  return readJson<Report>(REPORTS_FILE, "reports", []);
}
export async function writeReports(reports: Report[]): Promise<void> {
  return writeJson(REPORTS_FILE, "reports", reports);
}

export async function readShifts(): Promise<ShiftImport[]> {
  return readJson<ShiftImport>(SHIFTS_FILE, "shifts", []);
}
export async function writeShifts(imports: ShiftImport[]): Promise<void> {
  return writeJson(SHIFTS_FILE, "shifts", imports);
}

export async function readManagerReports(): Promise<ManagerReport[]> {
  return readJson<ManagerReport>(MANAGER_REPORTS_FILE, "manager-reports", []);
}
export async function writeManagerReports(reports: ManagerReport[]): Promise<void> {
  return writeJson(MANAGER_REPORTS_FILE, "manager-reports", reports);
}

export async function readNotices(): Promise<Notice[]> {
  return readJson<Notice>(NOTICES_FILE, "notices", []);
}
export async function writeNotices(notices: Notice[]): Promise<void> {
  return writeJson(NOTICES_FILE, "notices", notices);
}

export async function readUsers(): Promise<User[]> {
  return readJson<User>(USERS_FILE, "users", []);
}
export async function writeUsers(users: User[]): Promise<void> {
  return writeJson(USERS_FILE, "users", users);
}

const defaultRates: SalesDayRate[] = [
  { dayOfWeek: 0, label: "日", rate: 100 },
  { dayOfWeek: 1, label: "月", rate: 100 },
  { dayOfWeek: 2, label: "火", rate: 100 },
  { dayOfWeek: 3, label: "水", rate: 100 },
  { dayOfWeek: 4, label: "木", rate: 100 },
  { dayOfWeek: 5, label: "金", rate: 100 },
  { dayOfWeek: 6, label: "土", rate: 100 },
];

export async function readSalesRates(): Promise<SalesDayRate[]> {
  return readJson<SalesDayRate>(SALES_RATES_FILE, "sales-rates", defaultRates);
}
export async function writeSalesRates(rates: SalesDayRate[]): Promise<void> {
  return writeJson(SALES_RATES_FILE, "sales-rates", rates);
}

export async function readSalesTargetsMonthly(): Promise<SalesTargetMonthly[]> {
  return readJson<SalesTargetMonthly>(SALES_TARGETS_MONTHLY_FILE, "sales-targets-monthly", []);
}
export async function writeSalesTargetsMonthly(targets: SalesTargetMonthly[]): Promise<void> {
  return writeJson(SALES_TARGETS_MONTHLY_FILE, "sales-targets-monthly", targets);
}

export async function readSalesDaily(): Promise<SalesDaily[]> {
  return readJson<SalesDaily>(SALES_DAILY_FILE, "sales-daily", []);
}
export async function writeSalesDaily(entries: SalesDaily[]): Promise<void> {
  return writeJson(SALES_DAILY_FILE, "sales-daily", entries);
}

export async function readZeninReports(): Promise<ZeninReport[]> {
  return readJson<ZeninReport>(ZENIN_REPORTS_FILE, "zenin-reports", []);
}
export async function writeZeninReports(reports: ZeninReport[]): Promise<void> {
  return writeJson(ZENIN_REPORTS_FILE, "zenin-reports", reports);
}

export async function readTimeSlotReports(): Promise<TimeSlotReport[]> {
  return readJson<TimeSlotReport>(TIMESLOT_REPORTS_FILE, "timeslot-reports", []);
}
export async function writeTimeSlotReports(reports: TimeSlotReport[]): Promise<void> {
  return writeJson(TIMESLOT_REPORTS_FILE, "timeslot-reports", reports);
}

export async function readRepresentativeAssignments(): Promise<RepresentativeAssignment[]> {
  return readJson<RepresentativeAssignment>(REPRESENTATIVE_ASSIGNMENTS_FILE, "representative-assignments", []);
}
export async function writeRepresentativeAssignments(assignments: RepresentativeAssignment[]): Promise<void> {
  return writeJson(REPRESENTATIVE_ASSIGNMENTS_FILE, "representative-assignments", assignments);
}

const defaultSlots: TimeSlot[] = [
  { id: "lunch", name: "ランチ", sortOrder: 1 },
  { id: "afternoon", name: "アフタヌーン", sortOrder: 2 },
  { id: "dinner", name: "ディナー", sortOrder: 3 },
];

export async function readTimeSlots(): Promise<TimeSlot[]> {
  return readJson<TimeSlot>(TIMESLOTS_FILE, "timeslots", defaultSlots);
}
export async function writeTimeSlots(slots: TimeSlot[]): Promise<void> {
  return writeJson(TIMESLOTS_FILE, "timeslots", slots);
}
