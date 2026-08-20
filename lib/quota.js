import { connectDB } from "@/lib/mongodb";
import ApiQuota from "@/models/ApiQuota";

function getTodayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export async function getQuotaStatus() {
  await connectDB();
  const today = getTodayUTC();
  const doc = await ApiQuota.findOne({ date: today }).lean();
  if (!doc) return { date: today, used: 0, limit: 15000, hardLimit: 14500, warningThreshold: 14000, remaining: 15000, status: "ok" };

  const remaining = Math.max(0, doc.limit - doc.requestsUsed);
  let status = "ok";
  if (doc.requestsUsed >= doc.hardLimit) status = "exceeded";
  else if (doc.requestsUsed >= doc.warningThreshold) status = "warning";

  return {
    date: today,
    used: doc.requestsUsed,
    limit: doc.limit,
    hardLimit: doc.hardLimit,
    warningThreshold: doc.warningThreshold,
    remaining,
    status,
  };
}

export async function checkQuota() {
  const status = await getQuotaStatus();
  if (status.used >= status.hardLimit) {
    throw new Error(
      `Daily Google Ads API quota reached (${status.used}/${status.limit}). Resets at midnight UTC.`
    );
  }
  return status;
}

export async function incrementQuota(count = 1) {
  await connectDB();
  const today = getTodayUTC();
  const doc = await ApiQuota.findOneAndUpdate(
    { date: today },
    { $inc: { requestsUsed: count } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  const remaining = Math.max(0, doc.limit - doc.requestsUsed);
  let status = "ok";
  if (doc.requestsUsed >= doc.hardLimit) status = "exceeded";
  else if (doc.requestsUsed >= doc.warningThreshold) status = "warning";

  return {
    date: today,
    used: doc.requestsUsed,
    limit: doc.limit,
    hardLimit: doc.hardLimit,
    warningThreshold: doc.warningThreshold,
    remaining,
    status,
  };
}
