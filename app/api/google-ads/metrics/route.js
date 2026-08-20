import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { getHistoricalMetrics } from "@/lib/google-ads/historical-metrics";
import GoogleAdsConnection from "@/models/GoogleAdsConnection";
import { checkQuota, incrementQuota } from "@/lib/quota";

const schema = z.object({
  keywords: z.array(z.string().trim().min(1)).min(1).max(1000),
  country: z.string().min(2),
  language: z.string().min(2),
});

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let quota;
  try {
    quota = await checkQuota();
  } catch (quotaError) {
    return NextResponse.json(
      { error: quotaError.message, quota: { status: "exceeded", used: 15000, limit: 15000, remaining: 0 } },
      { status: 429 }
    );
  }

  try {
    const input = schema.parse(await request.json());
    const keywords = [...new Set(input.keywords.map((keyword) => keyword.toLowerCase().trim()))];
    await connectDB();
    const connection = await GoogleAdsConnection.findOne({ userId: session.user.id }).lean();
    if (!connection) {
      return NextResponse.json({ error: "Connect Google Ads before searching traffic." }, { status: 409 });
    }

    const results = await getHistoricalMetrics(connection, keywords, input.country, input.language);
    await GoogleAdsConnection.updateOne({ _id: connection._id }, { lastValidatedAt: new Date() });

    const updatedQuota = await incrementQuota(1);

    const response = NextResponse.json({
      results,
      keywordCount: keywords.length,
      quota: {
        used: updatedQuota.used,
        limit: updatedQuota.limit,
        remaining: updatedQuota.remaining,
        status: updatedQuota.status,
      },
    });

    response.headers.set("X-Quota-Used", String(updatedQuota.used));
    response.headers.set("X-Quota-Limit", String(updatedQuota.limit));
    response.headers.set("X-Quota-Remaining", String(updatedQuota.remaining));
    response.headers.set("X-Quota-Status", updatedQuota.status);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.issues?.[0]?.message || error?.message || "Unable to fetch keyword metrics",
        quota: {
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
          status: quota.status,
        },
      },
      { status: 400 }
    );
  }
}
