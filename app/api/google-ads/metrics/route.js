import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { getHistoricalMetrics } from "@/lib/google-ads/historical-metrics";
import GoogleAdsConnection from "@/models/GoogleAdsConnection";

const schema = z.object({
  keywords: z.array(z.string().trim().min(1)).min(1).max(50),
  country: z.string().min(2),
  language: z.string().min(2),
});

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ results, keywordCount: keywords.length });
  } catch (error) {
    return NextResponse.json(
      { error: error?.issues?.[0]?.message || error?.message || "Unable to fetch keyword metrics" },
      { status: 400 }
    );
  }
}
