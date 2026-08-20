import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQuotaStatus } from "@/lib/quota";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const quota = await getQuotaStatus();
    return NextResponse.json({ quota });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Unable to fetch quota status" },
      { status: 500 }
    );
  }
}
