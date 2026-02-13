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

export async function readReports(): Promise<Report[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(REPORTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeReports(reports: Report[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export async function readShifts(): Promise<ShiftImport[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SHIFTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeShifts(imports: ShiftImport[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SHIFTS_FILE, JSON.stringify(imports, null, 2), "utf-8");
}

export async function readManagerReports(): Promise<ManagerReport[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(MANAGER_REPORTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeManagerReports(reports: ManagerReport[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(MANAGER_REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export async function readNotices(): Promise<Notice[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(NOTICES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeNotices(notices: Notice[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(NOTICES_FILE, JSON.stringify(notices, null, 2), "utf-8");
}

export async function readUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function readSalesRates(): Promise<SalesDayRate[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SALES_RATES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const defaultRates: SalesDayRate[] = [
      { dayOfWeek: 0, label: "日", rate: 100 },
      { dayOfWeek: 1, label: "月", rate: 100 },
      { dayOfWeek: 2, label: "火", rate: 100 },
      { dayOfWeek: 3, label: "水", rate: 100 },
      { dayOfWeek: 4, label: "木", rate: 100 },
      { dayOfWeek: 5, label: "金", rate: 100 },
      { dayOfWeek: 6, label: "土", rate: 100 },
    ];
    return defaultRates;
  }
}

export async function writeSalesRates(rates: SalesDayRate[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SALES_RATES_FILE, JSON.stringify(rates, null, 2), "utf-8");
}

export async function readSalesTargetsMonthly(): Promise<SalesTargetMonthly[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SALES_TARGETS_MONTHLY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeSalesTargetsMonthly(targets: SalesTargetMonthly[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SALES_TARGETS_MONTHLY_FILE, JSON.stringify(targets, null, 2), "utf-8");
}

export async function readSalesDaily(): Promise<SalesDaily[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SALES_DAILY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeSalesDaily(entries: SalesDaily[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SALES_DAILY_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function readZeninReports(): Promise<ZeninReport[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ZENIN_REPORTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeZeninReports(reports: ZeninReport[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ZENIN_REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export async function readTimeSlotReports(): Promise<TimeSlotReport[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(TIMESLOT_REPORTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeTimeSlotReports(reports: TimeSlotReport[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TIMESLOT_REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export async function readRepresentativeAssignments(): Promise<RepresentativeAssignment[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(REPRESENTATIVE_ASSIGNMENTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeRepresentativeAssignments(
  assignments: RepresentativeAssignment[]
): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    REPRESENTATIVE_ASSIGNMENTS_FILE,
    JSON.stringify(assignments, null, 2),
    "utf-8"
  );
}

export async function readTimeSlots(): Promise<TimeSlot[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(TIMESLOTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const defaultSlots: TimeSlot[] = [
      { id: "lunch", name: "ランチ", sortOrder: 1 },
      { id: "afternoon", name: "アフタヌーン", sortOrder: 2 },
      { id: "dinner", name: "ディナー", sortOrder: 3 },
    ];
    return defaultSlots;
  }
}

export async function writeTimeSlots(slots: TimeSlot[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TIMESLOTS_FILE, JSON.stringify(slots, null, 2), "utf-8");
}
