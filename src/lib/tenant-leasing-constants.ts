export type OutreachStatus =
  | "not_contacted"
  | "sent"
  | "replied"
  | "meeting_scheduled"
  | "contracted"
  | "passed";

export const OUTREACH_STATUS_LABELS: Record<OutreachStatus, string> = {
  not_contacted: "未接触",
  sent: "送付済",
  replied: "反応あり",
  meeting_scheduled: "面談予定",
  contracted: "成約",
  passed: "見送り",
};
